import { Query } from 'node-appwrite';
import { userBookingsMap } from '../src/utils.js';
import { restoreTimeQuota } from '../src/user.js';
import { RESTORE_THRESHOLD } from '../src/config.js';

export async function disablePlaceStartedBookings(placeId, emailData, databases){
  console.log("delete started bookings");
  console.log(placeId)
  try{
    const now = new Date();
    now.setMilliseconds(0);
    now.setSeconds(0);
    console.log("today: ", now.toISOString());

    const disabledBookings = await databases.listDocuments(
      process.env.DB_ID, process.env.PLACEBOOKING_ID, [
        Query.equal('place',placeId),
        Query.and([
            Query.lessThanEqual('start_time', now.toISOString()),
          Query.greaterThan('end_time',now.toISOString())
        ])
      ]
    )
    emailData = userBookingsMap(disabledBookings, emailData)

    now.setMinutes( (now.getMinutes() > RESTORE_THRESHOLD) ? RESTORE_THRESHOLD : 0);

    for(const booking of disabledBookings.documents){
      console.log("booking to bo deleted: ", booking.$id)
      console.log("booking type is: ", booking.booking_type);
      const isBlocked = booking.booking_type.includes("blocked");

      if(isBlocked){
        await restoreTimeQuota(now.toISOString(), booking.end_time, booking.user.$id, databases)
      }

      await databases.deleteDocument(
        process.env.DB_ID, process.env.PLACEBOOKING_ID,
        booking.$id
      )
    }

    return emailData
  }catch (error){
    console.log(error)
  }

}

export async function deleteRoomLinkedPlaceBooking(placeId, databases){
  const roomBookings = databases.list(process.env.DB_ID, process.env.PLACEBOOKING_ID,[
    Query.equal('place', placeId),
    Query.equal('booking_type', 'room')
  ])

  for(const booking of roomBookings){
    await databases.deleteDocument(process.env.DB_ID, process.env.PLACEBOOKING_ID, booking.$id)
  }
}

export async function deleteRoomBooking(deleteAll = false,roomId, emailData, databases){
  console.log("delete room bookings");
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

      query = Query.or([
        Query.and([
          Query.greaterThan('end_time', now.toISOString()),
          Query.lessThanEqual('end_time', tomorrow.toISOString())
        ]),
        Query.and([
          Query.greaterThan('start_time', now.toISOString()),
          Query.lessThanEqual('start_time', tomorrow.toISOString())
        ])
      ])
    }
    else {
      query = Query.greaterThan('start_time', now.toISOString());
    }
    

    const deleteRoomBookings = await databases.listDocuments(
      process.env.DB_ID, process.env.ROOMBOOKING_ID, [
        Query.equal('room', roomId),
        query
      ]
    )
    console.log("number of bookings to be deleted: ", deleteRoomBookings.total)
    emailData = userBookingsMap(deleteRoomBookings, emailData)

    for(const roomBooking of deleteRoomBookings.documents){
      console.log("booking to be disabled: ", roomBooking.$id);
      // delete place bookings related to room booking
      for(const placeBooking of roomBooking.placeBooking){
        await databases.deleteDocument(
          process.env.DB_ID, process.env.PLACEBOOKING_ID, placeBooking.$id
        )
      }
      await databases.deleteDocument(
        process.env.DB_ID, process.env.ROOMBOOKING_ID, roomBooking.$id
      )
    }

    return emailData;
  } catch (error){
    console.log(error);
  }
}

export async function deletePlaceBooking(deleteAll = false, placeId, emailData, databases){
  console.log("delete place booking");
  console.log(placeId)
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

    const deletePlaceBookings = await databases.listDocuments(
      process.env.DB_ID, process.env.PLACEBOOKING_ID, [
        Query.equal('place', placeId),
        Query.notEqual('booking_type', 'room'),
        query
      ]
    )
    console.log("number of bookings to be deleted: \n", deletePlaceBookings.total)
    emailData = userBookingsMap(deletePlaceBookings, emailData)

    for(const booking of deletePlaceBookings.documents){
      console.log("booking to be disabled: ", booking.$id);

      const isBlocked = booking.booking_type.includes("blocked");
      console.log("is blocked: ", isBlocked);

      if(isBlocked){
        await restoreTimeQuota(booking.start_time, booking.end_time, booking.user.$id, databases)
      }
      await databases.deleteDocument(
        process.env.DB_ID, process.env.PLACEBOOKING_ID, booking.$id
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
    // Handle room bookings
    const disabledRooms = await databases.listDocuments(
        process.env.DB_ID,  process.env.ROOM_ID,
        [Query.equal("deactivated", true)]
    );
    console.log("number of disabled rooms: \n", disabledRooms.total)
    
    for(const room of disabledRooms.documents){
      console.log("room to be handled: ", room.$id);
      emailData = await deleteRoomBooking(room.$id,emailData,databases);
    }    

    // Handle place bookings
    const disabledPlaces = await databases.listDocuments(
      process.env.DB_ID, process.env.PLACE_ID,
      [Query.equal("deactivated", true)]
    );
    console.log("number of disabled places: \n", disabledPlaces.total);
    
    for(const place of disabledPlaces.documents){
      console.log("place to be handled: ", place.$id);
      emailData = await deletePlaceBooking(place.$id, emailData, databases);
    }
    
    return emailData
  } catch (error) {
    console.log(error)
  }
}