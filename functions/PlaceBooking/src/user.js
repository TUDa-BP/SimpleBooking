// This is a abstract user class that contains the common logic for all user roles
import { placeBookingURL } from './config.js';
import { ID } from 'node-appwrite';
import ejs from 'ejs';

import { fileURLToPath } from 'url';
import path from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const templatePathBooking = path.resolve(__dirname, '../static/ConfirmationOnBooking.ejs');
const templatePathOverBooking = path.resolve(__dirname, '../static/NotifyOverBooking.ejs');


export default class User {
    constructor(client, database, messaging, log, user) {
        this.client = client;
        this.database = database;
        this.messaging = messaging;
        this.log = log;
        this.user = user;
        this.log("User ID: " + user["$id"]);
        this.userID = user["$id"];
    }
    getRedableDateFromISO(iso) {
        const date = new Date(iso);
        return date.toLocaleDateString('de-DE') + " " + date.toLocaleTimeString('de-DE');
    }
    /**
   * Returns reserved bookings for the slot duration.
   *
   * @param {Object} slot - The slot object containing start_time and end_time properties.
   * @param {Array} bookings - An array of booking objects to check against.
   * @returns {Array} - An array of reserved bookings that overlap with the slot duration.
   */
    checkIfTimeSlotIsBooked(slot, bookings) {
        const reservedBookings = [];
        if (bookings === null || bookings.length === 0) return { isBooked: false, reservedBookings };

        const slotStart = new Date(slot.start_time).getTime();
        const slotEnd = new Date(slot.end_time).getTime();

        for (let booking of bookings) {
            const bookingStart = new Date(booking.start_time).getTime();
            const bookingEnd = new Date(booking.end_time).getTime();

            if (slotStart < bookingEnd && slotEnd > bookingStart) {
                if (booking.booking_type === "fix" || booking.booking_type === "blocked") {
                    return { isBooked: true, reservedBookings };
                }
                if (booking.booking_type === "reserved") {
                    reservedBookings.push(booking);
                }
            }
        }

        return { isBooked: false, reservedBookings };
    }

    //This is used to delete the overbooked slots
    async deleteOverBookings(reservedBookings) {
        for (let booking of reservedBookings) {
            await this.database.deleteDocument(process.env.DB_ID, process.env.PLACEBOOKING_ID, booking["$id"]);
        }
    }
    //This is used to check if the slot is available for booking
    async sendEmailBookingConfirmation(user, booked, notbooked, place) {
        // Format the slots into a readable date format
        const formatSlots = slots => slots.map(slot => ({
            start_time: this.getRedableDateFromISO(slot.start_time),
            end_time: this.getRedableDateFromISO(slot.end_time),
            booking_type: slot.booking_type
        }));

        const formattedBooked = formatSlots(booked);
        const formattedNotBooked = formatSlots(notbooked);

        const html = await new Promise((resolve, reject) => {
            ejs.renderFile(templatePathBooking, {
                user: user,
                booked: formattedBooked,
                notBooked: formattedNotBooked,
                place: place,
                room: place.room  

            }, (err, str) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(str);
                }
            });
        });

        // send email
        await this.messaging.createEmail(ID.unique(), // messageId
            'You booked a place ' + place["place_id"], // subject
            html, // content
            [], // topics (optional)
            [this.userID], // users (optional)
            [], // targets (optional)
            [], // cc (optional)
            [], // bcc (optional)
            [], // Attechemnts (optional)
            false, // draft (optional)
            true, // html (optional)
            undefined // scheduledAt (optional)
        );
    }
    //This is used to send email notification to the user when the slot is overbooked
    async sendEmailOverBookingNotification(bookings, place) {
        for (let booking of bookings) {
            const formattedBooking = {
                start_time: this.getRedableDateFromISO(booking.start_time),
                end_time: this.getRedableDateFromISO(booking.end_time),
            };
            const html = await new Promise((resolve, reject) => {
                ejs.renderFile(templatePathOverBooking, {
                    user: booking.user,
                    createdDate: this.getRedableDateFromISO(booking["$createdAt"]),
                    booking: formattedBooking,
                    place: place,
                    placeBookingURL: placeBookingURL
                }, (err, str) => {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve(str);
                    }
                });
            });

            // send email
            await this.messaging.createEmail(ID.unique(), // messageId
                'Your Booking has been overbooked', // subject
                html, // content
                [], // topics (optional)
                [booking.user["$id"]], // users (optional)
                [], // targets (optional)
                [], // cc (optional)
                [], // bcc (optional)
                [], // Attechemnts (optional)
                false, // draft (optional)
                true, // html (optional)
                undefined // scheduledAt (optional)
            );
        }

    }
}