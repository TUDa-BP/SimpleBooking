import ejs from 'ejs';
import path from 'path';
import { ID } from 'node-appwrite';
import { fileURLToPath } from 'url';
import { getRedableDateFromISO,formatBookings } from '../src/utils.js';
import { placeBookingURL } from '../src/config.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const templatePathBookingConfirmation = path.resolve(__dirname, '../static/ConfirmationOnBooking.ejs');
const templatePathOverBookingNotification = path.resolve(__dirname, '../static/NotifyOverBooking.ejs');


export async function sendEmailBookingConfirmation(user, booked, notbooked, room, messaging) {
  // Format the slots into a readable date format
  const formatSlots = slots => slots.map(slot => ({
      start_time: getRedableDateFromISO(slot.start_time),
      end_time: getRedableDateFromISO(slot.end_time),
  }));  

  const formattedBooked = formatSlots(booked);
  const formattedNotBooked = formatSlots(notbooked);  

  const html = await new Promise((resolve, reject) => {
      ejs.renderFile(templatePathBookingConfirmation, {
          user: user,
          booked: formattedBooked,
          notBooked: formattedNotBooked,
          room: room,
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
      'You booked a room ' + room["room_number"], // subject
      html, // content
      [], // topics (optional)
      [user.$id], // users (optional)
      [], // targets (optional)
      [], // cc (optional)
      [], // bcc (optional)
      [], // Attechemnts (optional)
      false, // draft (optional)
      true, // html (optional)
      undefined // scheduledAt (optional)
  );
}

export async function sendEmailOverBookingNotification(userId, user, bookings, bookingDay, messaging) {
    const bookingList = formatBookings(bookings);
    try{
      const html = await new Promise((resolve, reject) => {
          ejs.renderFile(templatePathOverBookingNotification, {
              user: user,
              bookingDay: bookingDay,
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
          'Your booking(s) have been overbooked', // subject
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
