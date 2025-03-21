import { finishRegistrationRoute } from './config.js';
import { Client, Users, Databases } from 'node-appwrite';
import jwt from 'jsonwebtoken';
// to use the await keyword, the promisify function is needed
function verifyAsync(token, secret) {
  return new Promise((resolve, reject) => {
    jwt.verify(token, secret, (err, decoded) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(decoded);
    });
  });
}



export default async ({ req, res, log, error }) => {
  const client = new Client()
    .setEndpoint(process.env.APPWRITE_FUNCTION_API_ENDPOINT)
    .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
    .setKey(req.headers['x-appwrite-key'] ?? '');

  if (req.path === finishRegistrationRoute) {
    try {
      const first_name = req.body.first_name;
      const last_name = req.body.last_name;
      const activation_code = req.body.activation_code;
      const password = req.body.password;
      const ID = req.body.id;

      // Sanity checks, if any of these fail, the function will throw an error
      if (!ID || ID == "") throw new Error("ID is required");
      if (!first_name || first_name == "") throw new Error("first_name is required");
      if (!last_name || last_name == "") throw new Error("last_name is required");
      if (!activation_code || activation_code == "") throw new Error("activation_code is required");
      if (!password || password == "") throw new Error("Password is required");
      if (password.length < 8) throw new Error("Password is too short");
      if (password.length > 128) throw new Error("Password is too long");
      if (password && !/(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8}/.test(password)) throw new Error("Password is not strong enough");

      // check if the activation_code is correct

      const databases = new Databases(client);
      const fetchedUser = await databases.getDocument(process.env.DB_ID, process.env.USER_ID, ID);
      if (!fetchedUser) throw new Error("User not found");

      if (!fetchedUser.activation_code || fetchedUser.activation_code == "") throw new Error("User has already finished registration");

      const secret = fetchedUser.activation_code;
      const decoded = await verifyAsync(activation_code, secret);

      const users = new Users(client);
      // only update the name if it is different from the one in the token
      const name = first_name + " " + last_name;
      if (name !== decoded.first_name + " " + decoded.last_name) {
        await users.updateName(
          ID, // userId
          name // name
        );
      }

      // update the password
      await users.updatePassword(
        ID, // userId
        password // password
      );
      await users.updateEmailVerification(
        ID, // userId
        true // emailVerification
      );

      await databases.updateDocument(
        process.env.DB_ID, // process.env.DB_ID
        process.env.USER_ID, // collectionId
        ID, // documentId
        { first_name: first_name, last_name: last_name, activation_code: null },
      );


      return res.json({
        success: true,
        message: "Finished registration",
      });

    } catch (e) {
      error(e);
      return res.json({
        success: false,
        error: e.message,
      });
    }

  }
  return res.json({
    success: false,
    error: "Route not found",
  });
};
