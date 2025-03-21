import { registerBaseURL, routeImportCSV, routeCreateAccount, routeUpdateAccount, routeDeleteAccount, importCSVRole } from './config.js';


import { Client, Users, ID, Messaging, Databases } from 'node-appwrite';
import jwt from 'jsonwebtoken';
import ejs from 'ejs';
import { fileURLToPath } from 'url';
import path from 'path';
import crypto from 'crypto';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


// The path to the email template
const templatePath = path.resolve(__dirname, '../static/emailTemplate.ejs');


async function getMaxTimeQuota(databases) {
    const timeQuota = await databases.getDocument(process.env.DB_ID, process.env.TIMEQUOTA_ID, process.env.TIMEQUOTA_DOC_ID);
    return timeQuota["max_value"];
}


// Database and collection IDs. They need to be modified to match the IDs of the database and collection in your project.
async function generateHTML(filename, first_name, last_name, email, code) {
    const html = await new Promise((resolve, reject) => {
        ejs.renderFile(filename, {
            first_name: first_name,
            last_name: last_name,
            email: email,
            code: code,
            baseurl: registerBaseURL
        }, (err, str) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(str);
            }
        });
    });
    return html;
}
// This function is excluted from the main function to be able to reuse it in the import CSV function
async function createAccount(first_name, last_name, role, email, users, messaging, uniqueID, databases, maxtimeQuota) {
    if (!first_name || !last_name || !role || !email || !users || !messaging || !uniqueID || !databases) throw new Error('Missing parameters');
    if (!validateEmail(email)) throw new Error('Invalid email');
    if (first_name.length === 0) throw new Error('first_name is required');
    if (last_name.length === 0) throw new Error('last_name is required');
    if (first_name.length > 128) throw new Error('first_name is too long');
    if (last_name.length > 128) throw new Error('last_name is too long');
    if (!(role === 'student' || role === 'phd' || role === 'admin')) throw new Error('Invalid role');

    // The users fullname is basicly the first_name and last_name combined
    const fullname = first_name + ' ' + last_name;
    await users.create(uniqueID, // userId
        email, // email
        undefined, //phone
        undefined, // password
        fullname);

    // Add the role to the user
    await users.updateLabels(uniqueID, [role]);

    // As the key a random key is generated, this should be enough for privacy
    const signingKey = crypto.randomBytes(64).toString("hex");



    const user = {
        first_name: first_name,
        last_name: last_name,
        email: email,
        role: role,
        activation_code: signingKey,
    };
    if (user.role === 'student') {
        user.time_quota = maxtimeQuota;
    }

    // now the user is added to the user collection
    await databases.createDocument(process.env.DB_ID, // process.env.DB_ID
        process.env.USER_ID, // collectionId
        uniqueID, // documentId
        user);
    // since this is private information, the code should not be sent to the user
    user.activation_code = undefined;
    user.time_quota = undefined;    
    user.id = uniqueID;

    const token = jwt.sign(user, signingKey);
    const html = await generateHTML(templatePath, first_name, last_name, email, token);
    // send email
    await messaging.createEmail(ID.unique(), // messageId
        'You have been invited to the SimpleRoomBookingTool!', // subject
        html, // content
        [], // topics (optional)
        [uniqueID], // users (optional)
        [], // targets (optional)
        [], // cc (optional)
        [], // bcc (optional)
        [], // attachments (optional)
        false, // draft (optional)
        true, // html (optional)
        undefined // scheduledAt (optional)
    );
    return user;
}
export default async ({ req, res, log, error }) => {
    let key = '';
    //for Debugging:
    if (req.headers['x-appwrite-key'] === "") {
        key = req.headers['appwrite-key'];
    } else {
        key = req.headers['x-appwrite-key'];
    }
    const client = new Client()
        .setEndpoint(process.env.APPWRITE_FUNCTION_API_ENDPOINT)
        .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
        .setKey(key);

    var notCreated = [];
    var created = [];

    if (req.path === routeImportCSV) {
        try {
            // The attributes are the keys of the csv file, mapped to the database attributes
            // the course is the csv file itself as an array of objects already parsed by the browser
            const course = req.body.course;
            const attributes = req.body.attributes;
            if (!course || !attributes)
                throw new Error("Courses and attributes are required");
            if (course.length === 0)
                throw new Error("Courses cannot be empty");
            const courseWithDatabaseAttributes = [];

            // iterate over the course and check if the attributes are valid
            for (const user of course) {
                const userObj = {};
                //let attributes = Object.keys(user);
                for (const key of Object.keys(user)) {
                    if (attributes[key] !== undefined) {
                        if (attributes[key] === 'email') {
                            if (!validateEmail(user[key]))
                                throw new Error('Invalid email in one entry');
                            if (user[key].length < 128 && user[key].length > 0)
                                userObj.email = user[key];
                        }
                        if (attributes[key] === 'first_name') {
                            if (user[key].length > 128)
                                throw new Error('first_name of one entry is too long');
                            if (user[key].length === 0) continue;
                            userObj.first_name = user[key];
                        }
                        if (attributes[key] === 'last_name') {
                            if (user[key].length > 128)
                                throw new Error('last_name of one entry is too long');
                            userObj.last_name = user[key];
                        }
                    }
                    if (attributes[key] === 'first and last_name') {
                        if (user[key].length > 128)
                            throw new Error('first_name and last_name of one entry is too long');

                        // the name is split into first and last name
                        // since this is stored in the database as first_name and last_name
                        const nameParts = user[key].split(' ');
                        userObj.last_name = nameParts.pop();
                        userObj.first_name = nameParts.join(' ');
                    }
                }

                // now check if the bare minimum of needed attributes is there
                if (userObj.email === undefined || userObj.first_name === undefined || userObj.last_name === undefined) {
                    // check if this is just a clear line in the csv
                    let empty = true;
                    for (const key of Object.keys(userObj)) {
                        if (userObj[key].length > 0)
                            empty = false;
                    }
                    if (!empty) {
                        userObj.error = 'Missing attributes';
                        notCreated.push(userObj);
                    }
                } else {
                    courseWithDatabaseAttributes.push(userObj);
                }

            }

            // The database Objects are created
            const users = new Users(client);
            const messaging = new Messaging(client);
            const databases = new Databases(client);
            const maxtimeQuota = await getMaxTimeQuota(databases);

            // this is by now hardcoded, but can be changed to a parameter
            const role = importCSVRole;
            for (const user of courseWithDatabaseAttributes) {
                try {
                    //This is the function that creates the user
                    let userResult = await createAccount(user.first_name, user.last_name, role, user.email, users, messaging, ID.unique(), databases, maxtimeQuota);
                    created.push(userResult);
                } catch (e) {
                    // When the user could not be created, the error is stored in the user object
                    user.error = e.message;
                    notCreated.push(user);
                }
            }
            // The result is returned to the client
            // The created and not created users are returned
            return res.json({
                success: true,
                created: created,
                notCreated: notCreated,
            });
        }
        catch (e) {
            error(e.message);

            // if anything breaks, the error is returned to the client
            // The created and not created users are returned
            return res.json({
                success: false,
                error: e.message,
                created: created,
                notCreated: notCreated,
            });
        }
    } else if (req.path === routeCreateAccount) {
        try {
            // The parameters are extracted from the request
            const first_name = req.body.first_name;
            const last_name = req.body.last_name;
            const role = req.body.role;
            const email = req.body.email;
            // Check if the parameters are there
            if (!first_name || !last_name || !role || !email)
                throw new Error('Missing parameters');
            //The database Objects are created
            const users = new Users(client);
            const messaging = new Messaging(client);
            const databases = new Databases(client);
            let maxtimeQuota;
            if(role === 'student') {
                maxtimeQuota = await getMaxTimeQuota(databases);
            }
            const user = await createAccount(first_name, last_name, role, email, users, messaging, ID.unique(), databases, maxtimeQuota);
            log(JSON.stringify({ type: "userscreated", user: user }));
            return res.json({
                success: true,
                user: user,
            });
        } catch (e) {
            error(e.message);
            return res.json({
                success: false,
                error: e.message,
            });

        }
        // The delete account function is implemented here    
    } else if (req.path === routeDeleteAccount) {
        try {
            const userId = req.body.userId;
            if (!userId) throw new Error('Missing User ID');
            const users = new Users(client);
            const databases = new Databases(client);
            await users.delete(userId);
            await databases.deleteDocument(process.env.DB_ID, process.env.USER_ID, userId);
            return res.json({
                success: true,
            });
        } catch (e) {
            error(e.message);
            return res.json({
                success: false,
                error: e.message,
            });
        }
        // The update account function is implemented here
    } else if(req.path === routeUpdateAccount) {
        try {
            console.log('Req Body:',req.body);
            const userId = req.body.userId;
            if (!userId) throw new Error('Missing User ID');
            const users = new Users(client);
            const databases = new Databases(client);
            let updateUser = {};
            updateUser.time_quota = req.body.time_quota;
            updateUser.hardware_eligibility = req.body.hardware_eligibility;

            // check if email is valid

            if(req.body.emailChanged) {
                console.log('Email:',req.body.email);
                if (!validateEmail(req.body.email)) throw new Error('Invalid email');
                const promise = await users.updateEmail(userId, req.body.email);
                console.log('Promise Email:',promise);

                updateUser.email = req.body.email;
            }
            // check if first_name and last_name are valid

            if(req.body.first_name && req.body.last_name) {
                console.log('First Name:',req.body.first_name);
                if (req.body.first_name.length === 0) throw new Error('first_name is required');
                if (req.body.first_name.length > 128) throw new Error('first_name is too long');

                if (req.body.last_name.length === 0) throw new Error('last_name is required');
                if (req.body.last_name.length > 128) throw new Error('last_name is too long');
                const promise = await users.updateName(userId, req.body.first_name + ' ' + req.body.last_name);
                
                console.log('Promise Name:',promise);
                
                updateUser.first_name = req.body.first_name;
                updateUser.last_name = req.body.last_name;
            }
            // check if role is valid
            if(req.body.role) {
                console.log('Role:',req.body.role);
                if (!(req.body.role === 'student' || req.body.role === 'phd' || req.body.role === 'admin')) throw new Error('Invalid role');
                const promise = await users.updateLabels(userId, [req.body.role]);
                console.log('Promise Role:',promise);

                updateUser.role = req.body.role;
            }
            // check if there is anything to update
            if(Object.keys(updateUser).length === 0) throw new Error('Nothing to update');
            let result = await databases.updateDocument(process.env.DB_ID, process.env.USER_ID, userId, updateUser);
            console.log('Result:',result);
            return res.json({
                success: true, ...result
            });

        } catch (e) {
            console.log('Error:',e.message);
            error(e.message);
            return res.json({
                success: false,
                error: e.message,
            });
        }
    }
    return res.json({
        error: 'Path not found',
        success: false
    });
};

// Regex to validate email
function validateEmail(email) {
    const re = /\S+@\S+\.\S+/;
    return re.test(email);
}