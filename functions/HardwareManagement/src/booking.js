import { Query } from 'node-appwrite';
import { userBookingsMap } from '../src/utils.js';

export async function deletePlaceBooking(deleteAll = false, hwId, emailData, databases){
    console.log("delete hardware booking");
    console.log(hwId)
    try{
      let query = null;
      const now = new Date();
      now.setMilliseconds(0);
      now.setSeconds(0);
      console.log("now: ", now.toISOString());
      
      if(!deleteAll){
        
        const tomorrow = new Date();
        tomorrow.setMilliseconds(0);
        tomorrow.setSeconds(0);
        tomorrow.setMinutes(0);
        tomorrow.setHours(0);
        tomorrow.setDate(tomorrow.getDate() + 1);
        console.log("tomorrow: ", tomorrow.toISOString());
  
        query = Query.and([
            Query.greaterThan('start_time', now.toISOString()),
            Query.lessThanEqual('start_time', tomorrow.toISOString())
        ])
  
      }
      else{
        query = Query.greaterThan('start_time', now.toISOString());
      }
  
      const deleteHardwareBookings = await databases.listDocuments(
        process.env.DB_ID, process.env.HWBOOKING_ID, [
          Query.equal('hardware', hwId),
          query
        ]
      )

      console.log("number of bookings to be deleted: \n", deleteHardwareBookings.total)
      emailData = userBookingsMap(deleteHardwareBookings, emailData)
  
      for(const booking of deleteHardwareBookings.documents){
        console.log("booking to be disabled: ", booking.$id);
  
        await databases.deleteDocument(
          process.env.DB_ID, process.env.HWBOOKING_ID, booking.$id
        )
      }
      return emailData;
    } catch (error){
      console.log(error);
    }
  }
  
  export async function cleanBookingsOnDisable (databases){
    console.log("check disabling");
    try{
      let emailData = {}
      // Handle place bookings
      const disabledHardwareBookings = await databases.listDocuments(
        process.env.DB_ID, process.env.HW_ID,
        [Query.equal("deactivated", true)]
      );
      console.log("number of disabled hardware: \n", disabledPlaces.total);
      
      for(const hardware of disabledHardwareBookings.documents){
        console.log("place to be handled: ", hardware.$id);
        emailData = await deletePlaceBooking(hardware.$id, emailData, databases);
      }
      
      return emailData
    } catch (error) {
      console.log(error)
    }
  }
  