import ejs from 'ejs';
import path from 'path';
import { ID } from 'node-appwrite';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const templatePathBookingConfirmation = path.resolve(__dirname, '../static/ConfirmationOnBooking.ejs');

export async function sendEmailHardwareBookingConfirmation(user, booked, hardware, messaging) {

      const formattedBooked = booked;
  
    const html = await new Promise((resolve, reject) => {
        ejs.renderFile(templatePathBookingConfirmation, {
            user: user,
            booked: formattedBooked,
            hardware: hardware,
        }, (err, str) => {
            if (err) {
                reject(err);
            } else {
                resolve(str);
            }
        });
    });
  
    // send email
    await messaging.createEmail(
        ID.unique(), // messageId
        'Hardware Booking Confirmation: ' + (hardware.hardware_name || 'your hardware'), // subject
        html, // content
        [], // topics (optional)
        [user.$id], // users (optional)
        [], // targets (optional)
        [], // cc (optional)
        [], // bcc (optional)
        [], // attachments (optional)
        false, // draft (optional)
        true,  // html (optional)
        undefined // scheduledAt (optional)
    );
  }
