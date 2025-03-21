import { Client, Messaging, Databases } from 'node-appwrite';
import Student from './student.js';
import AdminOrPhD from './adminOrPhD.js';

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
  const database = new Databases(client);
  const messaging = new Messaging(client);

  // The req object contains the request data
  try {
    if (req.path === "/bookplace") {
      //sanity checks
      //log(req.headers)
      const userIDFromBody = req.body.userID;
      if (req.body.userID === undefined) throw new Error("User ID not provided");
      if (req.body.placeID === undefined) throw new Error("Place ID not provided");
      if (req.body.slots === undefined) throw new Error("Slots not provided");

      const userDoc = await database.getDocument(process.env.DB_ID, process.env.USER_ID, userIDFromBody, undefined);
      if (userDoc.error) throw new Error("User not found");

      const place = await database.getDocument(process.env.DB_ID, process.env.PLACE_ID, req.body.placeID, undefined);

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

      let booked = [], notBooked = [], overBooked = [];

      //create booking id
      if (userDoc.role === "student") {
        log("Student booking");
        const student = new Student(client, database, messaging, log, userDoc);
        ({ booked, notBooked, overBooked } = await student.book(formattedSlots, place));
      } else {
        log("Admin or PhD booking");
        const adminOrPhD = new AdminOrPhD(client, database, messaging, log, userDoc);
        ({ booked, notBooked, overBooked } = await adminOrPhD.book(formattedSlots, place));
      }

      return res.json({
        message: "Booking successful",
        booked: booked,
        notBooked: notBooked,
        overBooked: overBooked
      });
    }
  } catch (e) {
    error(e.toString());
    return res.json({ error: e.message });
  }

  return res.json({ message: "Route not found" });
};

