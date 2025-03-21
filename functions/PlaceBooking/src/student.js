//This file is for the student role. It contains the logic for placing a booking
import User from './user.js';
import { ID, Permission, Role } from 'node-appwrite';

export default class Student extends User {
    //@param {Client} client
    //@param {Databases} database
    //@param {Messaging} messaging
    //@param {Function} log
    //@param {Object} user
    constructor(client, database, messaging, log, user) {
        super(client, database, messaging, log, user);
    }
    /**
     * Books time slots for a user at a specified place.
     *
     * @param {Array} slots - An array of slot objects, each containing start_time and end_time properties.
     * @param {Object} place - The place object where the booking is to be made, containing a $id and placeBooking properties.
     * @returns {Promise<Object>} - A promise that resolves to an object containing booked and notBooked arrays.
     * @throws {Error} - Throws an error if the place is already booked.
     */
    async book(slots, place) {
        let booked = [];
        let notBooked = [];
        const placeID = place["$id"];

        let new_time_quota = this.user.time_quota;
        let placeBooking = place["placeBooking"]

        // Find any reserved bookings and add them to overbookedSlots
        let overbookedSlots = [];

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


            const delta = (end_time - start_time) / (1000 * 60); // Calculate slot size in minutes
            // Check if the user has enough time quota for the slot
            let bookingType = "blocked";
            if (this.user.time_quota < delta) {
                //when the slot has not enough time qouta it will be booked as reserved
                bookingType = "reserved";
            }
            let { isBooked, reservedBookings } = this.checkIfTimeSlotIsBooked(slot, placeBooking);
            //Check if the slot has fixed or blocked booking
            if (isBooked) {
                slot.error = "Place is already booked as fixed or blocked";
                notBooked.push(slot);
                continue;
            }
            overbookedSlots.push(...reservedBookings);



            const bookingID = ID.unique();
            const bookingDoc = await this.database.createDocument(process.env.DB_ID, process.env.PLACEBOOKING_ID, bookingID, {
                user: this.userID,
                start_time: slot.start_time.toISOString(),
                end_time: slot.end_time.toISOString(),
                place: placeID,
                booking_type: bookingType,
            },
                [
                    Permission.read(Role.any()),                  // Anyone can view this document
                    Permission.update(Role.label("admin")),      // Admins can update this document
                    Permission.update(Role.label("phd")),        // PhD students can update this document
                    Permission.delete(Role.label("admin")),      // Admins can delete this document
                    Permission.delete(Role.label("phd")),        // PhD students can delete this document
                    Permission.update(Role.user(this.userID)),   // Owner can update this document
                    Permission.delete(Role.user(this.userID)),   // Owner can delete this document
                ]
            );
            booked.push(bookingDoc);

            //Update the time quota only if the slot is not reserved
            //since then the time quota is already 0
            if (slot.booking_type !== "reserved") {
                if (new_time_quota - delta < 0) {
                    new_time_quota = 0;
                } else {
                    new_time_quota -= delta;
                }
            }
        }

        await this.database.updateDocument(process.env.DB_ID, process.env.USER_ID, this.userID, {
            time_quota: new_time_quota,
        }, undefined);

        // Send email
        if (booked.length > 0) {
            await this.sendEmailBookingConfirmation(this.user, booked, notBooked, place);
        }

        // Delete overbooked slots
        if (overbookedSlots.length > 0) {
            await this.sendEmailOverBookingNotification(overbookedSlots, place);
            await this.deleteOverBookings(overbookedSlots);
        }

        return { booked, notBooked, overbookedSlots };

    }
}