import { Client, Messaging, Databases } from 'node-appwrite';
import { bookRoom } from '../src/booking.js';
import { sendEmailBookingConfirmation, sendEmailOverBookingNotification } from '../src/email.js';
import { getAffectedDays } from '../src/utils.js';

// This Appwrite function will be executed every time your function is triggered
export default async ({ req, res, log, error }) => {
  // You can use the Appwrite SDK to interact with other services
  // For this example, we're using the Users service
  const client = new Client()
    // eslint-disable-next-line no-undef
    .setEndpoint(process.env.APPWRITE_FUNCTION_API_ENDPOINT)
    // eslint-disable-next-line no-undef
    .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
    .setKey(req.headers['x-appwrite-key'] ?? '');
  const databases = new Databases(client);
  const messaging = new Messaging(client);

  // The req object contains the request data
  try {
    if (req.path === "/bookroom") {
      //sanity checks
      if (req.body.userId === undefined) throw new Error("User ID not provided");
      if (req.body.roomId === undefined) throw new Error("Place ID not provided");
      if (req.body.slots === undefined) throw new Error("Slots not provided");

      const user = await databases.getDocument(process.env.DB_ID, process.env.USER_ID, req.body.userId, undefined);
      if (user.error) throw new Error("User not found");

      const room = await databases.getDocument(process.env.DB_ID, process.env.ROOM_ID, req.body.roomId, undefined);
      console.log(room)

      //Slots must have the following format: [{start_time: Date, end_time: Date}]
      const slots = req.body.slots;
      if (!Array.isArray(slots)) throw new Error("Slots must be an array");

      const formattedSlots = slots.map(slot => {
        if (!slot.start_time || !slot.end_time) {
          throw new Error("Each slot must have a start_time and end_time");
        }
        return {
          start_time: new Date(slot.start_time),
          end_time: new Date(slot.end_time)
        };
      });


      // Check for overlapping slots and calculate total time delta
      for (let i = 0; i < formattedSlots.length; i++) {
        for (let j = i + 1; j < formattedSlots.length; j++) {
          if (
            (formattedSlots[i].start_time < formattedSlots[j].end_time) &&
            (formattedSlots[i].end_time > formattedSlots[j].start_time)
          ) {
            throw new Error("Slots cannot overlap");
          }
        }
      }

      let booked = null, notBooked = null;
      let modifiedBookings = {};
      ({ booked, notBooked, modifiedBookings } = await bookRoom(databases, user.$id, formattedSlots, room, modifiedBookings));

      // Send email
      if (booked.length > 0) {
          await sendEmailBookingConfirmation(user, booked, notBooked, room, messaging);
      }
      // Delete overbooked slots
      console.log("sending email for modified bookings")
      for (const [userId, userData] of Object.entries(modifiedBookings)) {
        const bookingDay = getAffectedDays(userData.affectedBookings)
        await sendEmailOverBookingNotification(userId, userData.user, userData.affectedBookings, bookingDay, messaging);
      }
      

      return res.json({
        message: "Booking successful",
        booked: booked,
        notBooked: notBooked
      });
    }
  } catch (e) {
    error(e.toString());
    return res.json({ error: e.message });
  }

  return res.json({ message: "Route not found" });
};

