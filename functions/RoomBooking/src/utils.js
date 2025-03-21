import { Status } from '../src/booking.js';

export function getTimeDelta(time1, time2){
    const timeDelta = Math.abs(new Date(time2).getTime() - new Date(time1).getTime());
    return timeDelta/(1000*60);
}

export function getRedableDateFromISO(iso) {
    const date = new Date(iso);
    return date.toLocaleDateString('de-DE') + " " + date.toLocaleTimeString('de-DE');
}

function getReadableTimeFromISO(iso){
    const date = new Date(iso);
    return date.toLocaleTimeString('de-DE');
}

export function formatBookings(bookings){
    return bookings.map(
            b => ({
                place: !b.booking.place ? "all" : b.booking.place.place_id,
                room: !b.booking.place ? b.booking.room.room_number : b.booking.place.room.room_number,
                start_time: getRedableDateFromISO(b.booking.start_time),
                end_time: b.booking.start_time.slice(0, 10) === b.booking.end_time.slice(0, 10) ? 
                    getReadableTimeFromISO(b.booking.end_time):
                    getRedableDateFromISO(b.booking.end_time),
                status : b.status === Status.deleted ? "CANCELLED" : b.status
            })
        );
}


export function getAffectedDays(affectedBookings){
    let affectedDays = new Set();

    for(const affectedBooking of affectedBookings){
        console.log(affectedBooking)
        const day = new Date(affectedBooking.booking.start_time).toLocaleDateString('de-DE')
        if(affectedDays.has(day)) {
            continue;
        }
        affectedDays.add(day)
    }

    return [...affectedDays].join("/");
}

export function checkIfTimeSlotIsBooked(slot, bookings) {
    console.log("Checking if time slot is booked");
    if (bookings === null || bookings.length === 0) return false;
   
    const slotStart = new Date(slot.start_time).getTime();
    const slotEnd = new Date(slot.end_time).getTime();
   
    for (let booking of bookings) {
        const bookingStart = new Date(booking.start_time).getTime();
        const bookingEnd = new Date(booking.end_time).getTime();
   
        if (slotStart < bookingEnd && slotEnd > bookingStart) {
            return true;
        }
    }
   
    return false
  }


/* Contains following information:
{
  "user01": {
    user: {
        first_name: "Jane",
        last_name: "Smith"
    },
    affectedBookings: [booking1, booking2]
  },
  "user02": {
    user: {
        first_name: "John",
        last_name: "Doe"
    },
    affectedBookings: [booking3]
  }
}
*/
export function userBookingsMap(placeBookings, existingUserData){
    return placeBookings.reduce((acc, placeBooking) => {
        const userId = placeBooking.booking.user.$id;
        const booking = placeBooking;
        
        if (!acc[userId]) {
          acc[userId] = {
            user:   {
                first_name: placeBooking.booking.user.first_name, 
                last_name: placeBooking.booking.user.last_name,  
            },
            affectedBookings: []       
          };
        }
    
        // Füge die betroffene Buchung für diesen Benutzer hinzu
        acc[userId].affectedBookings.push(booking);
    
        return acc;
        }, existingUserData);
}
