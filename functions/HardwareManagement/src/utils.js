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
                hardware: b.hardware ? b.hardware.hardware_name : "N/A",
                cost_center_number: b.hardware ? b.hardware.cost_center_number : "N/A",
                stock_number: b.hardware? b.hardware.stock_number:"N/A",
                start_time: getRedableDateFromISO(b.start_time),
                end_time: b.start_time.slice(0, 10) === b.end_time.slice(0, 10) ? 
                  getReadableTimeFromISO(b.end_time):
                  getRedableDateFromISO(b.end_time)
            })
        );
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
export function userBookingsMap(hwBookings, existingUserData){
    return hwBookings.documents.reduce((acc, hwBooking) => {
        const userId = hwBooking.user.$id;
        const booking = hwBooking;
        
        // Falls der Benutzer noch nicht im Map existiert, initialisiere ein Array für seine Buchungen
        if (!acc[userId]) {
          acc[userId] = {
            user:   {
                first_name: hwBooking.user.first_name, // Vorname des Benutzers
                last_name: hwBooking.user.last_name,   // Nachname des Benutzers
            },
            affectedBookings: []       // Array für betroffene Buchungen
          };
        }
    
        // Füge die betroffene Buchung für diesen Benutzer hinzu
        acc[userId].affectedBookings.push(booking);
    
        return acc;
        }, existingUserData);
}