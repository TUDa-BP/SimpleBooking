import { ID, Permission, Query, Role } from "node-appwrite";
import { getTimeDelta, userBookingsMap, checkIfTimeSlotIsBooked } from "../src/utils.js";
import { MIN_BOOKING_DURATION } from "../src/config.js";


export const Status = {
    deleted: "DELETED",
    updated: "UPDATED"
};

async function handleCollidingBookingsBeforeStart(databases, slot, collidingBookings, modifiedBookings) {
  console.log("Number of booking collisions before start to handle: ", collidingBookings.length);
  try{
    let tmpStatus = null;
    for (let booking of collidingBookings) {
        if (getTimeDelta(booking.start_time, slot.start_time) > MIN_BOOKING_DURATION){
            console.log("old bookig:")
            console.log(booking)
            booking = await databases.updateDocument(process.env.DB_ID, process.env.PLACEBOOKING_ID, booking.$id, 
                {
                    end_time: slot.start_time.toISOString(),
                    user: booking.user.$id
                }
            );
            
            console.log("updated booking:")
            console.log(booking)
            tmpStatus = Status.updated;
        }
        else{
            await databases.deleteDocument(process.env.DB_ID, process.env.PLACEBOOKING_ID, booking.$id);
            tmpStatus = Status.deleted;
        }

        modifiedBookings.push({
            booking: booking,
            status: tmpStatus
        });
    }

    return modifiedBookings;

  } catch (error) {  
    console.log("Error handling collision bookings before start: ",error);
  }

}

async function handleCollidingBookingsAfterEnd(databases, slot, collidingBookings, modifiedBookings) {
  console.log("Number of booking collisions after end to handle: ", collidingBookings.length);
  try{
    let tmpStatus = null;
    for(let booking of collidingBookings){
        if (getTimeDelta(slot.end_time, booking.end_time) > MIN_BOOKING_DURATION){
            console.log("old bookig:")
            console.log(booking)
            booking = await databases.updateDocument(process.env.DB_ID, process.env.PLACEBOOKING_ID, booking.$id, 
                {
                    start_time: slot.end_time.toISOString(),
                    user: booking.user.$id
                }
            );
            
            console.log("updated booking:")
            console.log(booking)
            tmpStatus = Status.updated;
        }
        else{
            await databases.deleteDocument(process.env.DB_ID, process.env.PLACEBOOKING_ID, booking.$id);
            tmpStatus = Status.deleted;
        }
        modifiedBookings.push({
            booking: booking,
            status: tmpStatus
        });
    }

    return modifiedBookings;
  } catch (error) {
    console.log("Error handling collision bookings after end: ",error);
  }
}

async function handleCollidingBookingsWithinSlot(databases, slot, collidingBookings, modifiedBookings) {
  console.log("Number of booking collisions within slot to handle: ", collidingBookings.length);
  try{
    let tmpStatus = null;
    for(let booking of collidingBookings){
        const deltaStart = getTimeDelta(booking.start_time, slot.start_time);
        const deltaEnd = getTimeDelta(slot.end_time, booking.end_time);
        if( deltaEnd < MIN_BOOKING_DURATION && deltaStart < MIN_BOOKING_DURATION){
            await databases.deleteDocument(process.env.DB_ID, process.env.PLACEBOOKING_ID, booking.$id);
            tmpStatus = Status.deleted;
        }
        else {
            console.log("old bookig:")
            console.log(booking)
            const newData = deltaEnd > deltaStart ? 
                {
                    start_time: slot.end_time.toISOString(),
                    user: booking.user.$id
                } : 
                {
                    end_time: slot.start_time.toISOString(),
                    user: booking.user.$id
                };

            booking = await databases.updateDocument(process.env.DB_ID, process.env.PLACEBOOKING_ID, booking.$id, 
                newData
            );
            
            console.log("updated booking:")
            console.log(booking)
            tmpStatus = Status.updated;
        }
        modifiedBookings.push({
            booking: booking,
            status: tmpStatus
        });
    }
    return modifiedBookings
  } catch (error) {
    console.log("Error handling collision bookings within slot: ",error);
  }
}

async function handleRegularPlaceBooking(databases, slot, place, modifiedBookings) {
 console.log("Handling regular place booking: ", place.$id);
  try{
    let tmpModifiedBookings = [];
    let collidingBookingsRaw = await databases.listDocuments(process.env.DB_ID, process.env.PLACEBOOKING_ID, [
        Query.equal("place", place.$id),
        Query.or([
            Query.and([
                Query.lessThan("start_time", slot.start_time.toISOString()),
                Query.greaterThan("end_time", slot.start_time.toISOString()),
                Query.lessThanEqual("end_time", slot.end_time.toISOString())
            ]),
            Query.and([
                Query.greaterThanEqual("start_time", slot.start_time.toISOString()),
                Query.lessThanEqual("end_time", slot.end_time.toISOString())
            ]),
            Query.and([
                Query.greaterThanEqual("start_time", slot.start_time.toISOString()),
                Query.lessThan("start_time", slot.end_time.toISOString()),
                Query.greaterThan("end_time", slot.end_time.toISOString())
            ]),
            Query.and([
                Query.lessThan("start_time", slot.start_time.toISOString()),
                Query.greaterThan("end_time", slot.end_time.toISOString())
            ])
        ])

    ]);
    // start time & end time are outside of the slot
    let collidingBookings = collidingBookingsRaw.documents.filter(booking => { 
        const startTime = new Date(booking.start_time);
        const endTime = new Date(booking.end_time);

        return startTime < slot.start_time && endTime > slot.end_time;
    });
    let seenIds = new Set(collidingBookings.map(b => b.$id));
    tmpModifiedBookings = await handleCollidingBookingsWithinSlot(databases, slot, collidingBookings, tmpModifiedBookings);

    // start time is oustide of the slot & end time is in the slot
    collidingBookings = collidingBookingsRaw.documents.filter(booking => {
        const startTime = new Date(booking.start_time);
        const endTime = new Date(booking.end_time);

        return !seenIds.has(booking.$id) && startTime < slot.start_time && endTime > slot.start_time && endTime <= slot.end_time;
    });
    collidingBookings.forEach(b => seenIds.add(b.$id));
    tmpModifiedBookings = await handleCollidingBookingsBeforeStart(databases, slot, collidingBookings, tmpModifiedBookings);

    // start time is in the slot & end time is outside of the slot
    collidingBookings = collidingBookingsRaw.documents.filter(booking => { 
        const startTime = new Date(booking.start_time);
        const endTime = new Date(booking.end_time);

        return !seenIds.has(booking.$id) && startTime >= slot.start_time && startTime < slot.end_time && endTime > slot.end_time;
    });
    collidingBookings.forEach(b => seenIds.add(b.$id));
    tmpModifiedBookings = await handleCollidingBookingsAfterEnd(databases, slot, collidingBookings, tmpModifiedBookings);

    // start time in the slot & end time is in the slot
    collidingBookings = collidingBookingsRaw.documents.filter(booking => {
        const startTime = new Date(booking.start_time);
        const endTime = new Date(booking.end_time);

        return !seenIds.has(booking.$id) && startTime >= slot.start_time && endTime <= slot.end_time;
    })
    for(const booking of collidingBookings){
        databases.deleteDocument(process.env.DB_ID, process.env.PLACEBOOKING_ID, booking.$id);
        tmpModifiedBookings.push({
            booking: booking,
            status: Status.deleted
        });
    }

    console.log("Modified bookings: ", tmpModifiedBookings);
    return userBookingsMap(tmpModifiedBookings, modifiedBookings);
  } catch (error) {
    console.log("Error handling regular place booking: ",error);
  }
}

async function bookPlace(databases, userId, slot, place, modifiedBookings) {
  console.log("Booking place: ", place.$id);
  try{
    modifiedBookings =  await handleRegularPlaceBooking(databases, slot, place, modifiedBookings);
    const doc = await databases.createDocument(process.env.DB_ID, process.env.PLACEBOOKING_ID, ID.unique(), {
        user: userId,
        start_time: slot.start_time.toISOString(),
        end_time: slot.end_time.toISOString(),
        place: place.$id,
        booking_type: "room",
    },
        [
            Permission.read(Role.any()),                 // Anyone can view this document
            Permission.update(Role.label("admin")),      // Admins can update this document
            Permission.update(Role.label("phd")),        // PhD students can update this document
            Permission.delete(Role.label("admin")),      // Admins can delete this document
            Permission.delete(Role.label("phd")),        // PhD students can delete this document
            Permission.update(Role.user(userId)),   // Owner can update this document
            Permission.delete(Role.user(userId)),   // Owner can delete this document
        ]
    );
  return {modifiedBookings, doc};
  } catch (error){
    console.log("Error booking place: ",error);
  }
}


async function bookPlacesInRoom(databases, userId, slot, room, modifiedBookings) {
  console.log("Booking places in the room: ", room.$id);
  try{
    let places = room.place;
    let placeBookings = [];
    console.log("Places in the room:");
    for (const place of places){
        console.log(place);
    }
   
    let doc = null;
    for (const place of places){
        ({ modifiedBookings, doc } = await bookPlace(databases, userId, slot, place, modifiedBookings));
        placeBookings.push(doc);
    }

    return { modifiedBookings, placeBookings};
  } catch (error){
    console.log("Error booking places in the room: ",error);
  }
}

  
export async function bookRoom(databases, userId, slots, room, modifiedBookings) {
  console.log("Booking room: ", room.$id);
  try {
    let booked = [];
    let notBooked = [];
    const roomId = room["$id"];
    let roomBooking = room["roomBooking"]
  
    for (let slot of slots) {
        const start_time = new Date(slot.start_time);
        const end_time = new Date(slot.end_time);
  
        // Check if the slot Start time is before before end time
        if (start_time >= end_time) {
            slot.error = "Slot start time must be before end time";
            notBooked.push(slot);
            continue;
        }
  
        //check if the slot is in the past
        if (start_time < new Date()) {
            slot.error = "Slot is in the past";
            notBooked.push(slot);
            continue;
        }
  
        // Check if the user has enough time quota for the slot
        let isBooked = checkIfTimeSlotIsBooked(slot, roomBooking);
        let placeBookings = [];
        //Check if the slot has fixed or blocked booking
        if (isBooked) {
            slot.error = "Place is already booked";
            notBooked.push(slot);
            continue;
        }else{
            ({ modifiedBookings, placeBookings } = await bookPlacesInRoom(databases, userId, slot, room, modifiedBookings));
            console.log("Modified bookings: ", modifiedBookings);
            console.log("Place bookings: ", placeBookings);
        }
        placeBookings = placeBookings.map(placeBooking => placeBooking.$id);

        const bookingDoc = await databases.createDocument(process.env.DB_ID, process.env.ROOMBOOKING_ID, ID.unique(), {
            user: userId,
            start_time: slot.start_time.toISOString(),
            end_time: slot.end_time.toISOString(),
            room: roomId,
            placeBooking: placeBookings
        },
            [
                Permission.read(Role.any()),                 // Anyone can view this document
                Permission.update(Role.label("admin")),      // Admins can update this document
                Permission.update(Role.label("phd")),        // PhD students can update this document
                Permission.delete(Role.label("admin")),      // Admins can delete this document
                Permission.delete(Role.label("phd")),        // PhD students can delete this document
                Permission.update(Role.user(userId)),   // Owner can update this document
                Permission.delete(Role.user(userId)),   // Owner can delete this document
            ]
        );
        booked.push(bookingDoc);
    }

    console.log("Booked Slots")
    console.log(booked);
    console.log("Not Booked Slots")
    console.log(notBooked);
    console.log("Modified bookings");
    console.log(modifiedBookings);
  
    return { booked, notBooked, modifiedBookings };
  } catch (error) {
    console.log("Error booking: ",error);
  }
}
  