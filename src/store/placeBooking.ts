import { ref, computed } from "vue";
import { defineStore } from "pinia";
import { databases, functions, account } from "../appwrite";
import { ExecutionMethod, Query } from "appwrite";
import { useUserStore, type User } from "./user";
import { type Place } from "./place";

export interface PlaceBooking {
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
  fix = "fix",
  reserved = "reserved",
  blocked = "blocked",
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


export const usePlaceBookingStore = defineStore('placeBooking', () => {
  const bookings = ref<PlaceBooking[]>([]);
  //this is set every time the user selects a place and clicks book
  const availableSlotsForPlace = ref<DaySlots[]>([]);

  //this is used to indicate if the available slots contain reserved slots
  //only to show a text to the user on the PlaceBookingInformation.vue component
  const availableSlotsContainsReservedSlots = ref<boolean>(false);

  //this is used for Booking
  const selectedSlots = ref<Slot[]>([]);


  const startDate = ref<Date | null>(null);
  const endDate = ref<Date | null>(null);

  const userStore = useUserStore();

  //These Values are used for the result of the booking!
  const bookedSlots = ref<Slot[]>([]);
  const notBookedSlots = ref<Slot[]>([]);


  /**
   * Fetches place bookings of the user with the given ID.
   * @param {number} id - The ID of the user whose place bookings are to be fetched.
   * @returns {Promise<void>}
   */
  const fetchBookings = async (id: string|null = null) => {
    try {

      const queries = [
        Query.notEqual('booking_type', "room"),
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
        import.meta.env.VITE_DB_PLACEBOOKING_ID, 
        queries
      );
      
      bookings.value = response.documents as PlaceBooking[];
    } catch (error) {
        console.log(error);
      }
    };

    /**
   * Deletes a place booking from dashboard.
   * @param {string} bookingId
   * @param {string} bookingType
   * @returns {Promise<string | undefined>}
   */
    const deleteUserBooking = async (bookingId: string, bookingType: string) => {
      try {
        const user = userStore.user;
        const requestBody = {
          bookingId: bookingId,
          bookingType: bookingType,
          userId: user?.$id,
          userRole: user?.role,
          userTimeQuota: user?.time_quota,
          maxTimeQuota: user?.role.includes('student') ? user?.maxTimeQuota.max_value : 0
        };
  
        const promise = await functions.createExecution(
          import.meta.env.VITE_CLOUDFUNCTION_USERBOOKINGMANAGEMENT_ID,  // functionId
          JSON.stringify(requestBody),  // body (optional)
          true,  // async (optional)
          import.meta.env.VITE_CLOUDFUNCTION_USERBOOKINGMANAGEMENT_ENDPOINTDELETEPLACEBOOKING,  // path (optional)
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
  //used for start date
  const setStartDate = (date: Date | string) => {
    startDate.value = new Date(date);
  };

  //used for end date 
  const setEndDate = (date: Date | string) => {
    endDate.value = new Date(date);
  };

  // used to set the default date time interval
  // this is as standard the current date and the next month
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
   * Determines if a given slot is bookable for the user.
   *
   * @param {Slot} slot - The slot to check for bookability.
   * @returns {boolean} - Returns `true` if the slot is bookable for the user, otherwise `false`.
   *
   * A slot is considered bookable if:
   * - It has a booking with a booking type of `reserved`.
   * - It does not have a booking and its start time is in the future.
   */
  const getIfSlotIsBookableForYou = (slot: Slot): boolean => {
    if (slot.booking) {
      if (slot.booking.booking_type === BookingType.reserved) return true;
      return false;
    }
    // if the slot is in the past it is not bookable for you
    if (slot.start_time <= new Date()) return false;
    return true;
  };

  /**
   * Generates available time slots for a given place within a specified date range.
   * 
   * @param place - The place for which to generate available time slots.
   * 
   * @throws {Error} If the start date or end date is not provided.
   * 
   * @remarks
   * This function calculates the available time slots for a given place based on the provided start and end dates.
   * It considers the valid booking time range defined by environment variables `VITE_BEGIN_BOOKINGTIME` and `VITE_END_BOOKINGTIME`.
   * The function also checks for existing bookings to ensure that generated slots do not overlap with booked slots.
   */
  const getAvailableSlots = (place: Place) => {
    if (!startDate.value || !endDate.value) {
      throw new Error("Start and end dates are required.");
    }
    let from = startDate.value;
    let to = endDate.value;
    const beginHour = import.meta.env.VITE_BEGIN_BOOKINGTIME; // Start of valid booking time (e.g., 8:00).
    const endHour = import.meta.env.VITE_END_BOOKINGTIME; // End of valid booking time (e.g., 20:00).


    let containsReservedSlots = false;
    // Skip places that don't have all required features.

    let numberOfFreeSlots = 0;
    let timeSlots: DaySlots[] = []; // Array to store time slots grouped by day for the current place.
    let currentDaySlots = [] as Slot[]; // Temporary array to store slots for the current day.
    let last = new Date(from); // Start processing from the `from` date.
    let currentDay = from.getDay(); // Track the current day for day changes.

    console.log("Place:", place);
    if (place == undefined) return;

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
        let bookingIndex = place.placeBooking.findIndex((booking) => {
          return (booking.start_time <= slot.start_time && booking.end_time >= slot.end_time)
        });

        if (bookingIndex != -1) {
          booking = place.placeBooking[bookingIndex];
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
          if (containsReservedSlots === false) containsReservedSlots = slot.booking.booking_type === BookingType.reserved
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

    // Assign the generated slots to the place and add it to the final list.
    place.slots = timeSlots;
    availableSlotsContainsReservedSlots.value = containsReservedSlots;
    // Add the place to the list of available slots if there are free slots.
    if (numberOfFreeSlots > 0) {
      availableSlotsForPlace.value = timeSlots;
    }

  };

  /**
   * Clears the available slots and selected slots for a place.
   * 
   * This function resets the `availableSlotsForPlace` and `selectedSlots` arrays to empty arrays.
   */
  const clearAvailableSlotsForPlace = () => {
    availableSlotsForPlace.value = [];
    selectedSlots.value = [];
  };

  /**
   * Toggles the selection of slots in the `selectedSlots` array.
   */
  const toggleSlotsFromSelectedSlots = (slots: Slot[]) => {
    const time_quota = userStore.user?.time_quota;
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
          // then we remove the slot from the selectedSlots array
          selectedSlots.value.splice(index, 1);
        } else {
          //Check if the user has enough time quota
          let slot_duration = (slot.end_time.getTime() - slot.start_time.getTime()) / (1000 * 60); // Convert milliseconds to minutes
          if ((time_quota ?? 0) - slot_duration <= 0) {
            //if the slot is already booked we do nothing if the user has not enough time quota

            console.log("time quota exceeded");
            if (slot.booking) {
              return;
            }
            slot.booking_selected_booking_type = BookingType.reserved;
            selectedSlots.value.push(slot);
          } else {
            slot.booking_selected_booking_type = BookingType.fix;
            selectedSlots.value.push(slot);
          }
          
        }
      }
    }
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
   * Books a place for the selected slots.
   *
   * This function takes a `Place` object and attempts to book the selected slots for that place.
   * It first checks if any slots are selected, then sorts and merges consecutive slots.
   * After summarizing the slots, it sends a booking request to the server.
   * If the booking is successful, it updates the booked and not booked slots.
   *
   * @param {Place} place - The place to be booked.
   * @throws {Error} If no slots are selected or if there is an error in the booking response.
   * @returns {Promise<void>} A promise that resolves when the booking process is complete.
   */
  const bookPlace = async (place: Place) => {
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

    const userID = (await account.get()).$id;

    const requestBody = {
      placeID: place.$id,
      slots: summarizedSlots,
      userID: userID,
    };

    // Book the place
    const booking = await functions.createExecution(
      import.meta.env.VITE_CLOUDFUNCTION_PLACEBOOKING_ID, // functionId
      JSON.stringify(requestBody), // body
      false, // async
      import.meta.env.VITE_CLOUDFUNCTION_PLACEBOOKING_ENDPOINTBOOKPLACE, // path
      ExecutionMethod.POST,
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

    console.log(responseBody);
    bookedSlots.value = responseBody.booked;
    notBookedSlots.value = responseBody.notBooked;

    selectedSlots.value = [];
  };

  return {
    bookings,
    fetchBookings,
    deleteUserBooking,
    availableSlotsForPlace,
    availableSlotsContainsReservedSlots,
    selectedSlots,
    bookedSlots,
    notBookedSlots,
    setStartDate,
    setEndDate,
    setDefaultDateTimeInterval,
    getAvailableSlots,
    clearAvailableSlotsForPlace,
    toggleSlotsFromSelectedSlots,
    addSlotsToSelectedSlots,
    removeSlotsFromSelectedSlots,
    bookPlace,
    computeSelectedSlotsDuration,

  }
});
