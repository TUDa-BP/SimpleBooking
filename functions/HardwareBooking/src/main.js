import { Client, Messaging, Databases, ID } from 'node-appwrite';
import { sendEmailHardwareBookingConfirmation } from './email.js';

// This Appwrite function will be executed every time your function is triggered
export default async ({ req, res, log, error }) => {
  // You can use the Appwrite SDK to interact with other services
  // For this example, we're using the Users service
  const client = new Client()
    .setEndpoint(process.env.APPWRITE_FUNCTION_API_ENDPOINT)
    .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
    .setKey(req.headers['x-appwrite-key'] ?? '');
  const database = new Databases(client);
  const messaging = new Messaging(client);

  // The req object contains the request data
  if (req.path === "/bookhardware") {

    try {

      if (!req.body.hardwareID) throw new Error("Hardware ID is required");
      if (!req.body.userID) throw new Error("User ID is required");
      if (!req.body.startTime) throw new Error("StartTime is required");

      const hardwareID = req.body.hardwareID;
      const userID = req.body.userID;
      const startTime = new Date(req.body.startTime.split("T")[0]);
      

      const userObj = await database.getDocument(process.env.DB_ID, process.env.USER_ID, userID);
      if (!userObj.$id) throw new Error("User not found");
      if (!req.body.hardware_eligibility) throw new Error("User is not eligible to book hardware");

      const hardwareObj = await database.getDocument(process.env.DB_ID, process.env.HW_ID, hardwareID);
      const max_booking_time = hardwareObj.max_booking_time;

      const endDate = new Date(startTime.valueOf() + max_booking_time*24*60*60*1000);
      endDate.setHours(23,59,0,0);
      const endTime = endDate;
      if (startTime > endTime) throw new Error("StartTime should be less than EndTime");
      // Check if the hardware is already booked
      const bookings = hardwareObj.hardwareBooking;
      // bookings has start_time and end_time
      for (let i = 0; i < bookings.length; i++) {
        if (new Date(bookings[i].start_time) <= endTime && new Date(bookings[i].end_time) >= startTime) {
          throw new Error("Hardware is already booked for this time");
        }
      }
      const id = ID.unique();
      await database.createDocument(process.env.DB_ID, process.env.HWBOOKING_ID,id, {
        hardware: hardwareID,
        user: userID,
        start_time: startTime,
        end_time: endTime,
      });
      await sendEmailHardwareBookingConfirmation(userObj,[{ start_time: startTime, end_time: endTime }],hardwareObj, messaging)
      return res.json({
        success: true,
        message: "Booking was successful!",
      });

    } catch (error) {
      return res.json({
        success: false,
        error: error.message,
      });
    }
  }

  return res.json({
    success: false,
    error: "Invalid path",
  });
};
