import ejs from 'ejs';
import path from 'path';
import { ID } from 'node-appwrite';
import { fileURLToPath } from 'url';
import { formatBookings } from '../src/utils.js';
import { hwBookingURL } from '../src/config.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const templatePathNotifyHwDisabled = path.resolve(__dirname, '../static/NotifyDisabling.ejs');
const templatePathNotifyHwDeleted = path.resolve(__dirname, '../static/NotifyDeletion.ejs');


export async function sendEmailHwDeletion(userId, user, bookings, messaging) {
  console.log("send email for place deletion")
  const bookingList = formatBookings(bookings);
  try{
    const html = await new Promise((resolve, reject) => {
        ejs.renderFile(templatePathNotifyHwDeleted, {
            user: user,
            affectedBookings: bookingList,
            hwBookingURL: hwBookingURL
  
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



export async function sendEmailHwDisabling(userId, user, bookings, messaging) {
  console.log("send email for place disabling")
  const bookingList = formatBookings(bookings);
  try{
    const html = await new Promise((resolve, reject) => {
        ejs.renderFile(templatePathNotifyHwDisabled, {
            user: user,
            affectedBookings: bookingList,
            hwBookingURL: hwBookingURL
  
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
