import { Client, Databases, Query } from 'node-appwrite';


const deleteBookings = async (database, collectionId, date) => {
  // Query documents with end_time <= date
  const bookings = await database.listDocuments(
    process.env.DB_ID,
    collectionId,
    [Query.lessThanEqual("end_time", date)]
  );
  
  // Delete bookings
  for (const booking of bookings.documents) {
    await database.deleteDocument(
      process.env.DB_ID,
      collectionId,
      booking.$id
    )
  }

}

export default async ({ req, res, log, error }) => {

  const client = new Client()
    .setEndpoint(process.env.APPWRITE_FUNCTION_API_ENDPOINT)
    .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
    .setKey(req.headers['x-appwrite-key'] ?? '');
  const database = new Databases(client);

  try {
    // Get Date of today
    const today = new Date();
    
    today.setFullYear(today.getFullYear() - 1);
    const today_one_year_ago = today.toISOString().split("T")[0]; 

    // Delete place & hardware bookings of today one year ago
    await deleteBookings(database, process.env.HWBOOKING_ID, today_one_year_ago);
    await deleteBookings(database, process.env.ROOMBOOKING_ID, today_one_year_ago);
    await deleteBookings(database, process.env.PLACEBOOKING_ID, today_one_year_ago);

    return res.json({
      success: true,
      message: "Bookings deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting items:", error);
    return res.json({
      success: false,
      error: error.message,
    });
  }
};
