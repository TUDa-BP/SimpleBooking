import ejs from 'ejs';
import path from 'path';
import { ID } from 'node-appwrite';
import { fileURLToPath } from 'url';
import { formatBookings } from '../src/utils.js';
import { placeBookingURL } from '../src/config.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const templatePathNotifyPlaceDisabled = path.resolve(__dirname, '../static/NotifyDisabling.ejs');
const templatePathNotifyPlaceDeleted = path.resolve(__dirname, '../static/NotifyDeletion.ejs');


export async function sendEmailPlaceDeletion(userId, user, bookings, messaging) {
  console.log("send email for place deletion")
  const bookingList = formatBookings(bookings);
  try{
    const html = await new Promise((resolve, reject) => {
        ejs.renderFile(templatePathNotifyPlaceDeleted, {
            user: user,
            affectedBookings: bookingList,
            placeBookingURL: placeBookingURL
  
        }, (err, str) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(str);
            }
        });
    });

    // send email
    await messaging.createEmail(ID.unique(), // messageId
        'Booking deleted!', // subject
        html, // content
        [], // topics (optional)
        [userId], // users (optional)
        [], // targets (optional)
        [], // cc (optional)
        [], // bcc (optional)
        [], // Attechemnts (optional)
        false, // draft (optional)
        true, // html (optional)
        undefined // scheduledAt (optional)
    );
  }catch(error){
    console.log("error sending email: ", error)
  }
}



export async function sendEmailPlaceDisabling(userId, user, bookings, messaging) {
  console.log("send email for place disabling")
  const bookingList = formatBookings(bookings);
  try{
    const html = await new Promise((resolve, reject) => {
        ejs.renderFile(templatePathNotifyPlaceDisabled, {
            user: user,
            affectedBookings: bookingList,
            placeBookingURL: placeBookingURL
  
        }, (err, str) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(str);
            }
        });
    });

    // send email
    await messaging.createEmail(ID.unique(), // messageId
        'Booking deleted!', // subject
        html, // content
        [], // topics (optional)
        [userId], // users (optional)
        [], // targets (optional)
        [], // cc (optional)
        [], // bcc (optional)
        [], // Attechemnts (optional)
        false, // draft (optional)
        true, // html (optional)
        undefined // scheduledAt (optional)
    );
  }catch(error){
    console.log("error sending email: ", error)
  }
}

