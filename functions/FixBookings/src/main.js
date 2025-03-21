import { Client, Databases, Query } from 'node-appwrite';


export default async ({ req, res, log, error }) => {

  const client = new Client()
    .setEndpoint(process.env.APPWRITE_FUNCTION_API_ENDPOINT)
    .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
    .setKey(req.headers['x-appwrite-key'] ?? '');
  const database = new Databases(client);

  try {
    // Get time
    const now = new Date();
    now.setMilliseconds(0);
    now.setSeconds(0);
    now.setMinutes(0);
    now.setDate(now.getDate() + 1);
    const tomorrow_iso = now.toISOString();
    console.log("tomorrow: ", now)
    

    // Compute time in 30 min
    const in30Minutes = new Date(now.getTime() + 30 * 60 * 1000);
    in30Minutes.setMilliseconds(0);
    in30Minutes.setSeconds(0);
    in30Minutes.setMinutes(0);
    const in30Minutes_iso = in30Minutes.toISOString();
    console.log("tomorrow in 30 min: ",in30Minutes_iso)

    // List all bookings that start between tomorrow at this time & (tomorrow at this time + 30min)
    const bookings = await database.listDocuments(
      process.env.DB_ID,
      process.env.PLACEBOOKING_ID,
      [
        Query.greaterThanEqual("start_time", tomorrow_iso),
        Query.lessThan("start_time", in30Minutes_iso),
        Query.equal("booking_type", "reserved"),
        Query.limit(5000)
      ]
    );

    // Update of booking_type attribute
    for (const booking of bookings.documents) {
      console.log(booking)
      await database.updateDocument(
        process.env.DB_ID,
        process.env.PLACEBOOKING_ID,
        booking.$id,
        { booking_type: "fix" }
      );
    }

    return res.json({
      success: true,
      message: "Bookings updated successfully",
      updatedCount: bookings.documents.length,
    });
  } catch (error) {
    console.error("Error updating items:", error);
    return res.json({
      success: false,
      error: error.message,
    });
  }
};
