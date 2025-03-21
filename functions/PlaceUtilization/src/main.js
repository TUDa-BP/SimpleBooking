import { Client, Databases, Query } from 'node-appwrite';
import { startBookingTime, endBookingTime } from './config.js';

// This Appwrite function will be executed every time your function is triggered
export default async ({ req, res, log, error }) => {
  // You can use the Appwrite SDK to interact with other services
  // For this example, we're using the Users service
  const client = new Client()
    .setEndpoint(process.env.APPWRITE_FUNCTION_API_ENDPOINT)
    .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
    .setKey(req.headers['x-appwrite-key'] ?? '');
  const databases = new Databases(client);

  await getUtilizationForAllPlaces(databases, log);
};

async function getUtilizationForAllPlaces(databases, log) {
  const places = await databases.listDocuments(
    process.env.DB_ID, // process.env.DB_ID
    process.env.PLACE_ID, // collectionId
    [] // queries (optional)
  );
  let numeberUpdated = 0;
  await places.documents.forEach(async place => {
    let utilization = await getUtilizationForPlace(databases, place.$id);
    if (utilization !== place.utilization) {

      await databases.updateDocument(
        process.env.DB_ID, // process.env.DB_ID
        process.env.PLACE_ID, // collectionId
        place.$id, // documentId
        { utilization: utilization } // data
      );
      numeberUpdated++;
    }
    
  });
  log(`Updated ${numeberUpdated} places`);
}

async function getUtilizationForPlace(databases, placeID) {

  const bookings = await databases.listDocuments(
    process.env.DB_ID, // process.env.DB_ID
    process.env.PLACEBOOKING_ID, // collectionId
    [Query.orderDesc("start_time"),
    Query.equal("place", placeID),
    ] // queries (optional)
  );

  const now = new Date();
  const sevenDaysLater = new Date(now);
  sevenDaysLater.setDate(now.getDate() + 7);

  let totalUtilization = 0;
  let totalHours = 0;
  console.log(bookings.documents.length);

  bookings.documents.forEach(booking => {
    const startTime = new Date(booking.start_time);
    const endTime = new Date(booking.end_time);

    if (startTime >= now && endTime <= sevenDaysLater) {
      const duration = (endTime - startTime) / (1000 * 60 * 60); // duration in hours
      totalUtilization += duration;
    }
  });

  const timeFromEndBookingTime = 24 - endBookingTime;
  totalHours = 7 * (24 - startBookingTime - timeFromEndBookingTime); // total hours in 7 days
  const utilization = totalUtilization / totalHours;

  let level = "low";
  if (utilization > 1 / 3 && utilization <= 2 / 3) {
    level = "medium";
  } else if (utilization > 2 / 3) {
    level = "high";
  }
  return level;
}
