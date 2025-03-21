import { ref, computed } from "vue";
import { defineStore } from "pinia";
import { databases, functions, account } from "../appwrite";
import { ExecutionMethod, Query } from "appwrite";
import type { User } from "./user"
import { useRoomStore, type Room } from "./room";
export interface RoomBooking {
  booking_type: string;
  start_time: Date;
  end_time: Date;
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  $permissions: string[];
  user?: User;
  $databaseId: string;
  $collectionId: string;
}

export interface DaySlots {
  date: Date;
  slots: Slot[];
}

export enum BookingType {
  room = "room"
}

export interface Booking {
  start_time: Date;
  end_time: Date;
  user: User;
  booking_type: BookingType;
}

export interface Slot {
  start_time: Date;
  end_time: Date;
  isBookableForYou: boolean;
  // This is used to make the selection of the slot button easier
  // And to show the information of the slot when it is selected for booking
  booking_selected_booking_type?: BookingType;
  booking?: Booking;
}


export const useRoomBookingStore = defineStore('roomBooking', () => {
  const bookings = ref<RoomBooking[]>([]);
  //this is set every time the user selects a room and clicks book
  const availableSlotsForRoom = ref<DaySlots[]>([]);

  //this is used to indicate if the available slots contain reserved slots
  //only to show a text to the user on the RoomBookingInformation.vue component
  const availableSlotsContainsReservedSlots = ref<boolean>(false);

  //this is used for Booking
  const selectedSlots = ref<Slot[]>([]);


  const startDate = ref<Date | null>(null);
  const endDate = ref<Date | null>(null);

  const roomStore = useRoomStore();

  //These values are used for the result of the booking!
  const bookedSlots = ref<Slot[]>([]);
  const notBookedSlots = ref<Slot[]>([]);

  /**
   * Fetches room bookings of the user with the given ID.
   * @param {number} id - The ID of the user whose room bookings are to be fetched.
   * @returns {Promise<void>}
   */
  const fetchBookings = async (id: string|null = null): Promise<void> => {
    try {
      const queries = [
        // Query bookings that are not already over
        Query.greaterThanEqual('end_time', new Date().toISOString()),
        Query.orderAsc('start_time'),
        Query.limit(5000)
      ];

      if (id) {
        queries.unshift(Query.equal('user', id));
      }

      const response = await databases.listDocuments(
        import.meta.env.VITE_DB_ID, 
        import.meta.env.VITE_DB_ROOMBOOKING_ID, 
        queries
      );

      bookings.value = response.documents as RoomBooking[];
    } catch (error) {
        console.log(error);
    }
  };

   /**
  * Deletes a room booking.
  * @param {string} bookingId
  * @returns {Promise<string | undefined>}
  */
   const deleteUserBooking = async (bookingId: string) => {
     try {
       const requestBody = {
         bookingId: bookingId,
       };

       const promise = await functions.createExecution(
         import.meta.env.VITE_CLOUDFUNCTION_USERBOOKINGMANAGEMENT_ID,  // functionId
         JSON.stringify(requestBody),  // body (optional)
         true,  // async (optional)
         import.meta.env.VITE_CLOUDFUNCTION_USERBOOKINGMANAGEMENT_ENDPOINTDELETEROOMBOOKING,  // path (optional)
         ExecutionMethod.POST,
         {
           'Content-Type': 'application/json',
           'Accept': 'application/json',
         }
       );
       
       return promise.$id.toString();

     } catch (error) {
       console.log("Error deleting bookings " + error)
     }
   }

  /**
   * Sets the start date for room booking.
   * @param {Date | string} date - The start date to be set.
   */
  const setStartDate = (date: Date | string) => {
    startDate.value = new Date(date);
  };

  /**
   * Sets the end date for room booking.
   * @param {Date | string} date - The end date to be set.
   */
  const setEndDate = (date: Date | string) => {
    endDate.value = new Date(date);
  };

  /**
   * Sets the default date-time interval for room booking.
   * The interval is set to the current date and the same day of the next month.
   */
  const setDefaultDateTimeInterval = () => {
    const start = new Date();
    start.setHours(0, 0, 0, 0); // Set to the start of the day
    const end = new Date(start);
    end.setMonth(end.getMonth() + 1); // Set to the same day next month
    startDate.value = start;
    endDate.value = end;
  };

  /**
   * Computes the total duration of the selected time slots in minutes.
   *
   * This computed property iterates over the `selectedSlots` array and calculates
   * the total duration by summing up the difference between the `end_time` and 
   * `start_time` of each slot, converting the result from milliseconds to minutes.
   *
   * @returns {number} The total duration of the selected time slots in minutes.
   */
  const computeSelectedSlotsDuration = computed(() => {
    let duration = 0;
    for (const slot of selectedSlots.value) {
      duration += (slot.end_time.getTime() - slot.start_time.getTime()) / (1000 * 60); // Convert milliseconds to minutes
    }
    return duration;
  });

  /**
   * Determines if a slot is bookable for the user.
   * @param {Slot} slot - The slot to check.
   * @returns {boolean} - True if the slot is bookable, false otherwise.
   */
  const getIfSlotIsBookableForYou = (slot: Slot): boolean => {
    return !slot.booking;
  };

  /**
   * Retrieves available slots for a specific room based on the selected date range.
   * @param {number} roomIndex - The index of the room in the filteredRooms array.
   * @throws {Error} - Throws an error if start and end dates are not set.
   */
  const getAvailableSlots = (roomIndex: number) => {
    if (!startDate.value || !endDate.value) {
      throw new Error("Start and end dates are required.");
    }
    let from = startDate.value;
    let to = endDate.value;
    const beginHour = import.meta.env.VITE_BEGIN_BOOKINGTIME; // Start of valid booking time (e.g., 8:00).
    const endHour = import.meta.env.VITE_END_BOOKINGTIME; // End of valid booking time (e.g., 20:00).



    let numberOfFreeSlots = 0;
    let timeSlots: DaySlots[] = []; // Array to store time slots grouped by day for the current room.
    let currentDaySlots = [] as Slot[]; // Temporary array to store slots for the current day.
    let last = new Date(from); // Start processing from the `from` date.
    let currentDay = from.getDay(); // Track the current day for day changes.

    const room = roomStore.filteredRooms[roomIndex];
    console.log("Room:", room);
    if (room == undefined) return;

    // Loop to generate time slots until the `to` date.
    while (last <= to) {
      const newTempTime = new Date(last.getTime() + import.meta.env.VITE_TIMESLOT_SIZE * 60 * 1000); // Calculate the end time of the current slot.

      // Handle transition to a new day.
      if (newTempTime.getDay() !== currentDay) {
        if (currentDaySlots.length) {
          // If there are slots for the current day, save them.
          timeSlots.push({ date: new Date(last), slots: currentDaySlots });
        }
        currentDaySlots = []; // Reset slots for the new day.
        currentDay = newTempTime.getDay(); // Update the current day.
      }

      // Check if the slot falls within the valid booking time range.
      const withinTimeRange =
        last.getHours() >= beginHour &&
        last.getHours() < endHour &&
        newTempTime.getHours() <= endHour;

      if (withinTimeRange) {
        const slot = {
          start_time: new Date(last), // Start time of the slot. 
          end_time: newTempTime, // End time of the slot.
        } as Slot;

        // Check if the slot is available by ensuring it doesn't overlap with existing bookings.
        let booking = undefined;
        let bookingIndex = room.roomBooking.findIndex((booking) => {
          return (booking.start_time <= slot.start_time && booking.end_time >= slot.end_time)
        });

        if (bookingIndex != -1) {
          booking = room.roomBooking[bookingIndex];
        }

        if (booking === undefined) {
          //increase the number of free slots
          numberOfFreeSlots++;
        } else {
          // Mark the slot as booked and add it to the day's slots.
          slot.booking = {
            start_time: booking.start_time,
            end_time: booking.end_time,
            user: booking.user,
            booking_type: booking.booking_type as BookingType
          } as Booking;
        }
        slot.isBookableForYou = getIfSlotIsBookableForYou(slot);
        currentDaySlots.push(slot);
      }

      last = newTempTime; // Move to the next time slot.
    }

    // Push the last day's slots if any remain.
    if (currentDaySlots.length) {
      timeSlots.push({ date: new Date(last), slots: currentDaySlots });
    }

    // Assign the generated slots to the room and add it to the final list.
    room.slots = timeSlots;
    // Add the room to the list of available slots if there are free slots.
    if (numberOfFreeSlots > 0) {
      availableSlotsForRoom.value = timeSlots;
    }

  };

  /**
   * Toggles the selection of slots in the selectedSlots array.
   * If a slot is already selected, it is removed; otherwise, it is added.
   * @param {Slot[]} slots - An array of Slot objects to toggle.
   */
  const toggleSlotsFromSelectedSlots = (slots: Slot[]) => {
    for (const slot of slots) {
      if (slot.isBookableForYou) {
        const index = selectedSlots.value.findIndex(
          (selectedSlot: Slot) => (selectedSlot.start_time === slot.start_time) && (selectedSlot.end_time === slot.end_time)
        );
        //here we check if the slot is already selected
        if (index !== -1) {
          //if the slot is already selected we remove it from the selectedSlots array
          // first we need to reset the booking type of the slot
          selectedSlots.value[index].booking_selected_booking_type = undefined;
          selectedSlots.value.splice(index, 1);
        } else {
          slot.booking_selected_booking_type = BookingType.room
          selectedSlots.value.push(slot);
        }
      }
    }
    console.log("Selected Slots:", selectedSlots.value);
  };



  /**
   * Adds the provided slots to the currently selected slots.
   *
   * @param {Slot[]} slots - An array of Slot objects to be added to the selected slots.
   */
  const addSlotsToSelectedSlots = (slots: Slot[]) => {
    selectedSlots.value = [...selectedSlots.value, ...slots];
  }

  /**
   * Removes the specified slots from the selected slots.
   *
   * @param {Slot[]} slot - An array of slots to be removed from the selected slots.
   */
  const removeSlotsFromSelectedSlots = (slot: Slot[]) => {
    selectedSlots.value = selectedSlots.value.filter(
      (selectedSlot: Slot) => !slot.some((s) => s.start_time === selectedSlot.start_time && s.end_time === selectedSlot.end_time)
    );
  }

  /**
   * Books a room for the selected slots.
   * @param {Room} room - The room to be booked.
   * @throws {Error} - Throws an error if no slots are selected or if booking fails.
   */
  const bookRoom = async (room: Room) => {
    let slots = selectedSlots.value;
    if (!slots || slots.length === 0) {
      throw new Error("No slots selected.");
    }

    // Sort slots by start time
    slots.sort((a, b) => a.start_time.getTime() - b.start_time.getTime());

    const summarizedSlots: Slot[] = [];
    let currentSlot = { ...slots[0] }; // Create a copy to avoid modifying the original array

    for (let i = 1; i < slots.length; i++) {
      const slot = slots[i];

      // Check if the current slot's end time matches the next slot's start time
      if (currentSlot.end_time.getTime() === slot.start_time.getTime()) {
        // Merge slots by extending the current slot's end time
        currentSlot.end_time = slot.end_time;
      } else {
        // Push the current slot to the summarized slots and start a new one
        summarizedSlots.push(currentSlot);
        currentSlot = { ...slot }; // Create a new copy for the next slot
      }
    }
    // Push the last slot
    summarizedSlots.push(currentSlot);

    const userId = (await account.get()).$id;

    const requestBody = {
      roomId: room.$id,
      slots: summarizedSlots,
      userId: userId
    };

    // Book the room
    const booking = await functions.createExecution(
      import.meta.env.VITE_CLOUDFUNCTION_ROOMBOOKING_ID, // functionId
      JSON.stringify(requestBody), // body
      false, // async
      import.meta.env.VITE_CLOUDFUNCTION_ROOMBOOKING_ENDPOINTBOOKROOM, // path
      ExecutionMethod.POST, // method
      {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      }
    );
    console.log("Booking Request:", booking);
    let responseBody = JSON.parse(booking.responseBody);
    if (responseBody.error) {
      throw new Error(responseBody.error);
    }

    //console.log(responseBody);
    bookedSlots.value = responseBody.booked;
    notBookedSlots.value = responseBody.notBooked;

    selectedSlots.value = [];
  };

  return {
    bookings,
    fetchBookings,
    deleteUserBooking,
    availableSlotsForRoom,
    availableSlotsContainsReservedSlots,
    selectedSlots,
    bookedSlots,
    notBookedSlots,
    setStartDate,
    setEndDate,
    setDefaultDateTimeInterval,
    getAvailableSlots,
    toggleSlotsFromSelectedSlots,
    addSlotsToSelectedSlots,
    removeSlotsFromSelectedSlots,
    bookRoom,
    computeSelectedSlotsDuration,
  }
});
