import { Client, Databases, Query } from 'node-appwrite';


export default async ({ req, res, log, error }) => {

  const client = new Client()
    .setEndpoint(process.env.APPWRITE_FUNCTION_API_ENDPOINT)
    .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
    .setKey(req.headers['x-appwrite-key'] ?? '');
  const database = new Databases(client);

  try {
    // Get Date of today (00:00)
    const today = new Date().toISOString().split("T")[0];

    // List all bookings that start today
    const bookings = await database.listDocuments(
      process.env.DB_ID,
      process.env.HWBOOKING_ID,
      [Query.equal("start_time", today)]
    );

    // Update of is_available attribute
    for (const booking of bookings.documents) {
      if(booking.hardware?.is_available){
        const hardware_id = booking.hardware?.$id;

        if (hardware_id) {
          await database.updateDocument(
            process.env.DB_ID,
            process.env.HW_ID,
            hardware_id,
            { is_available: false }
          );
        }
      }
    }

    return res.json({
      success: true,
      message: "Hardware updated successfully",
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
