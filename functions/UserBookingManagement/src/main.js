import { Client, Databases } from 'node-appwrite';

async function restoreTimeQuota(bookingData, userId, userTimeQuota, maxTimeQuota, databases){
  try{  
    let timeDelta = new Date(bookingData.end_time) - new Date(bookingData.start_time);
    timeDelta = userTimeQuota + Math.floor(timeDelta / (1000 * 60))
    const newTimeQuota = {
      // Compute the minutes that are restored by the deletion
      time_quota: Math.min(timeDelta, maxTimeQuota)
    }

    await databases.updateDocument(
      process.env.DB_ID, // databaseId
      process.env.USER_ID, // collectionId
      userId, // documentId
      newTimeQuota, // data (optional)
    );
    console.log("timeDelta (ms): ", timeDelta)
    console.log("new time quota (min): ", newTimeQuota)
  } catch (error) {
    console.error("Error restoring time quota:", error);
  }
}

async function deleteBooking(collectionId, bookingId, databases){
  try{
    await databases.deleteDocument(process.env.DB_ID, 
      collectionId,
      bookingId);
  } catch (error) {
    console.error("Error deeleting booking: ", error);
  }
}

// This Appwrite function will be executed every time your function is triggered
export default async ({ req, res, log, error }) => {
  const client = new Client()
  .setEndpoint(process.env.APPWRITE_FUNCTION_API_ENDPOINT)
  .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
  .setKey(req.headers['x-appwrite-key'] ?? '');
  const databases = new Databases(client);

  try {

    if(req.path === "/delete-room-booking"){
      await deleteBooking(process.env.ROOMBOOKING_ID, req.body.bookingId, databases);

      return res.json({
        success: true,
        message: "Room booking deleted successfully",
      });
    } 
    else if(req.path === "/delete-place-booking"){
      if(req.body.userRole.includes("student") && (req.body.bookingType === "blocked")){
        const bookingData = await databases.getDocument(process.env.DB_ID, process.env.PLACEBOOKING_ID, req.body.bookingId);
        await restoreTimeQuota(bookingData, req.body.userId, req.body.userTimeQuota, req.body.maxTimeQuota , databases);
      }
      
      await deleteBooking(process.env.PLACEBOOKING_ID, req.body.bookingId, databases);

      return res.json({
        success: true,
        message: "Place booking deleted successfully",
      });
    }
    else if(req.path === "/delete-hardware-booking"){
      await deleteBooking(process.env.HWBOOKING_ID, req.body.bookingId, databases);

      return res.json({
        success: true,
        message: "Hardware booking deleted successfully",
      });
    }

    return res.json({
      success: false,
      message: "Could not handle request: Wrong request path.",
    });
    
  } catch(erorr) {
    error("Could not handle request: " + error.message);
    return res.json({
      success: false,
      error: err.message,
    });
  }
};
