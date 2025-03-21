import { Client, Databases, Messaging } from 'node-appwrite';
import { deleteRoomBooking, disableStartedBookings, deletePlaceBooking, cleanBookingsOnDisable, deleteRoomLinkedPlaceBooking } from '../src/bookings.js';
import { sendEmailPlaceDisabling, sendEmailPlaceDeletion } from '../src/email.js';

// This Appwrite function will be executed every time your function is triggered
export default async ({ req, res, log, error }) => {

    /*
        /togglePlace
        PlaceIds
        process.env.PLACE_ID
        Room_number

        /toggleRoom
        PlaceId
        RoomId
        Room_number
    */

  const client = new Client()
    .setEndpoint(process.env.APPWRITE_FUNCTION_API_ENDPOINT)
    .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
    .setKey(req.headers['x-appwrite-key'] ?? '');
  const databases = new Databases(client);
  const messaging = new Messaging(client);

  try {
    let emailData ={}
    let responseText = ""

    const isDeletion = req.path.includes('delete');
    console.log("isDeletion: ", isDeletion)

    if(req.path === "/toggle-room" || req.path === "/delete-room"){
      log("/toggle-room || /delete-room")

      responseText = isDeletion ? "Room deletion" : "Room toogle";
      
      emailData = await deleteRoomBooking(isDeletion,req.body.roomId, emailData, databases)

      for(const placeId of req.body.placeIds){
         emailData = await disableStartedBookings(placeId, emailData, databases)
         emailData = await deletePlaceBooking(isDeletion,placeId, emailData, databases)
      }

      if(isDeletion){
        log("deletion")

        for(const placeId of req.body.placeIds){
          await databases.deleteDocument(process.env.DB_ID,process.env.PLACE_ID, placeId);
        }
        await databases.deleteDocument(process.env.DB_ID,process.env.ROOM_ID,req.body.roomId);
      
      }
    
    }
    else if(req.path === "/toggle-place" || req.path === "/delete-place"){
      log("/toggle-place || /delete-place")

      responseText = isDeletion ? "Place deletion" : "Place toogle";
      emailData = await disableStartedBookings(req.body.placeId, emailData, databases)
      emailData = await deletePlaceBooking(isDeletion, req.body.placeId, emailData, databases)

      if(isDeletion){
        log("deletion")
        await deleteRoomLinkedPlaceBooking(req.body.placeId, databases)
        await databases.deleteDocument(process.env.DB_ID,process.env.PLACE_ID,req.body.placeId)
      }

    }
    else{
      console.log("ELSE")
      emailData = await cleanBookingsOnDisable(databases)
      responseText = "Check up"
    }

    if(isDeletion){
      for (const [userId, userData] of Object.entries(emailData)) {
        await sendEmailPlaceDeletion(userId, userData.user, userData.affectedBookings, messaging);
      }
    }
    else{
      for (const [userId, userData] of Object.entries(emailData)) {
        await sendEmailPlaceDisabling(userId, userData.user, userData.affectedBookings, messaging);
      }
    }
    
    return res.json({
      success: true,
      text:`${responseText} successful!`
    })

  } catch(err) {
    error("Could not delete/toggle place/room: " + err.message);
  }


  return res.json({
    success: false,
    text:"Check up failed"
  })
};