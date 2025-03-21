import { Client, Databases, Messaging } from 'node-appwrite';
import { deletePlaceBooking, cleanBookingsOnDisable } from '../src/booking.js';
import { sendEmailHwDeletion, sendEmailHwDisabling } from '../src/email.js';

// This Appwrite function will be executed every time your function is triggered
export default async ({ req, res, log, error }) => {

  /*
      /togglePlace
      PlaceIds
      Place_id
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

  if(req.path === "/toggle-hardware" || req.path === "/delete-hardware"){
    responseText = isDeletion ? "Hardware deletion" : "Hardware toogle";
    emailData = await deletePlaceBooking(isDeletion, req.body.hwId, emailData, databases)

    if(isDeletion){
      log("deletion")
      await databases.deleteDocument(process.env.DB_ID,process.env.HW_ID,req.body.hwId)
    }
  }
  else {
    console.log("ELSE")
    emailData = await cleanBookingsOnDisable(databases)
    responseText = "Check up"
  }

  if(isDeletion){
    for (const [userId, userData] of Object.entries(emailData)) {
      await sendEmailHwDeletion(userId, userData.user, userData.affectedBookings, messaging);
    }
  }
  else{
    for (const [userId, userData] of Object.entries(emailData)) {
      await sendEmailHwDisabling(userId, userData.user, userData.affectedBookings, messaging);
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
