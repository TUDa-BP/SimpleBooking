import { ref } from "vue";
import { defineStore } from "pinia";
import { databases, functions } from "../appwrite";
import { ID, Query, ExecutionMethod } from "appwrite";
import type { DaySlots, PlaceBooking } from "./placeBooking";
import type { Room } from "./room";
import type { Feature } from "./feature";
import type { User } from "./user";

export enum Utilisation {
  high = "high",
  medium = "medium",
  low = "low"
}

export interface Place {
  place_id: number;
  description: string;
  deactivated: boolean;
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  $permissions: string[];
  placeBooking: PlaceBooking[];
  room: Room;
  feature: Feature[];
  $databaseId: string;
  $collectionId: string;
  slots?: DaySlots[];
  utilization?: Utilisation;
}

export interface DateRange {
  start_time: Date,
  end_time: Date
}

export interface PlaceFilter {
  place_id?: number,
  features?: string[],
  duration?: DateRange,
}


export const usePlaceStore = defineStore('place', () => {
  // we have a normal array and a filtered array
  // we can use the filtered array to display the places
  const places = ref<Place[]>([]);
  const filteredPlaces = ref<Place[]>([]);
  const error = ref<string | null>(null);

  const lastBookedPlaces = ref<Place[]>([]);


  /**
   * Fetches a list of places from the database.
   * 
   * @param {boolean} [showOnlyActive=false] - If true, only fetches active places (where `deactivated` is false).
   * @returns {Promise<void>} - A promise that resolves when the places have been fetched and processed.
   * 
   * @throws Will log an error message to the console if the fetch operation fails.
   */
  const fetchPlaces = async (showOnlyActive: boolean = false) => {
    try {
      const query = showOnlyActive ? [Query.equal("deactivated", [false]), Query.limit(5000)] : [Query.limit(5000)];
      const response = await databases.listDocuments(import.meta.env.VITE_DB_ID, import.meta.env.VITE_DB_PLACE_ID, query);
      places.value = response.documents.map((doc: any) => ({
        ...doc,
        $createdAt: new Date(doc.$createdAt),
        $updatedAt: new Date(doc.$updatedAt),
        placeBooking: doc.placeBooking.map((booking: any) => ({
          ...booking,
          start_time: new Date(booking.start_time),
          end_time: new Date(booking.end_time)
        }))
      })) as Place[];
      filteredPlaces.value = places.value;
    } catch (error) {
      console.log("Error fetching places");
      console.error(error);
    }
  }

  /**
   * Fetch all places in a specific room from the database.
   *
   * @param {string} roomId - The ID of the room to fetch places for.
   * @returns {Promise<any[]>} - A promise that resolves to an array of places in the room.
   * @throws Will throw an error if the fetch operation fails.
   */
  const fetchPlacesInRoom = async (roomId: string) => {
    if (!roomId) return;

    try {
      const room = await databases.getDocument(import.meta.env.VITE_DB_ID, import.meta.env.VITE_DB_ROOM_ID, roomId);
      const placeIds = room.place; // Assumption: "places" is the relationship attribute in Room

      if (placeIds && placeIds.length > 0) {
        const response = await Promise.all(
          placeIds.map((placeId: { $id: string; }) => databases.getDocument(import.meta.env.VITE_DB_ID, import.meta.env.VITE_DB_PLACE_ID, placeId.$id))
        );
        return response; // Return the loaded places
      } else {
        return []; // No linked places
      }
    } catch (error) {
      console.log(error);
      throw error;
    }
  };


  /**
   * Fetches the last booked places for a given user.
   *
   * @param {User} user - The user object to fetch the last booked places for.
   * @returns {Promise<void>} - A promise that resolves when the last booked places have been fetched and processed.
   * @throws Will log an error message to the console if the fetch operation fails.
   */
  const getLastBookedPlaces = async (user: User) => {
    try {
      const response = await databases.listDocuments(import.meta.env.VITE_DB_ID, import.meta.env.VITE_DB_PLACEBOOKING_ID, [
        Query.equal('user', user.$id),
        Query.orderDesc("$createdAt"),
        Query.limit(3)
      ]);
      const placeIds = response.documents.map((doc: any) => doc.place.$id);
      lastBookedPlaces.value = places.value.filter(place => placeIds.includes(place.$id));
    } catch (error) {
      console.log(error);
    }
  }


  // Filter the places based on the filter object
  // The filter object can have a place_id and/or features
  const filterPlaces = (filter: PlaceFilter) => {
    console.log("Filtering Places");
    const duration = import.meta.env.VITE_SLOT_SIZE || 30;

    filteredPlaces.value = places.value.filter((place) => {

      if (filter.place_id !== undefined) {
        if (place.place_id !== filter.place_id) {
          console.log("Place ID does not match");
          console.log(place.$id);
          console.log(filter.place_id);
          return false;
        }
      }


      if (filter.features?.length) {
        if (!filter.features.every((feature: string) =>
          place.feature.some((placeFeature) => placeFeature.feature_name === feature))) {
          return false;
        }
      }

      if (filter.duration) {
        if (!hasAvailableSlot(place.placeBooking, filter.duration, duration)) {
          return false;
        }
      }

      return true;
    });
  };
  /**
   * Checks if there is an available slot within the given duration that is not occupied by any bookings.
   *
   * @param {PlaceBooking[]} bookings - An array of existing bookings.
   * @param {DateRange} duration - The time range to check for available slots.
   * @param {number} slotSize - The size of the slot in minutes.
   * @returns {boolean} - Returns true if there is an available slot, otherwise false.
   */
  function hasAvailableSlot(bookings: PlaceBooking[], duration: DateRange, slotSize: number): boolean {
    const slotMillis = slotSize * 60 * 1000;


    const minBookingTime = import.meta.env.VITE_BEGIN_BOOKINGTIME
    const maxBookingTime = import.meta.env.VITE_END_BOOKINGTIME


    function hasAvailableSlotForDay(bookingsForDay: PlaceBooking[], date: Date): boolean {
      const bookingStartLimit = new Date(date);
      bookingStartLimit.setHours(minBookingTime, 0, 0, 0);

      const bookingEndLimit = new Date(date);
      bookingEndLimit.setHours(maxBookingTime, 0, 0, 0);

      if (bookingsForDay.length === 0) {
        return true;
      }
      if (bookingEndLimit === bookingsForDay[0].end_time && bookingStartLimit === bookingsForDay[0].start_time) {
        return false;
      }
      const sortedBookings = bookingsForDay.sort((a, b) => a.start_time.getTime() - b.start_time.getTime());
      
      if (sortedBookings[0].start_time.getTime() - bookingStartLimit.getTime() >= slotMillis) {
        return true;
      }


      for (let i = 1; i < sortedBookings.length; i++) {
        const previousBooking = sortedBookings[i - 1];
        const currentBooking = sortedBookings[i];

        const gap = currentBooking.start_time.getTime() - previousBooking.end_time.getTime();
        if (gap >= slotMillis) {
          return true;
        }
      }


      const lastBooking = sortedBookings[sortedBookings.length - 1];
      if (bookingEndLimit.getTime() - lastBooking.end_time.getTime() >= slotMillis) {
        return true;
      }

      return false;
    }


    let currentDate = new Date(duration.start_time);
    while (currentDate < duration.end_time) {

      const bookingsForDay = bookings.filter(booking =>
        booking.start_time.toDateString() === currentDate.toDateString()
      );


      if (hasAvailableSlotForDay(bookingsForDay, currentDate)) {
        return true;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return false;
  }

  /**
   * Deletes a place and its related bookings.
   *
   * @param {string} placeID - The ID of the place to delete.
   * @returns {Promise<void>} - A promise that resolves when the place is deleted.
   * @throws Will log an error message to the console if the delete operation fails.
   */
  const deletePlace = async (placeID: string) => {
    try {
      // Fetch the place document to get the related placeBooking IDs
      //const place = await databases.getDocument(import.meta.env.VITE_DB_ID, import.meta.env.VITE_DB_PLACE_ID, placeID);
      //const placeBookingIds = place.placeBooking;

      const requestBody = {
        placeId: placeID,
      }

      await functions.createExecution(
        import.meta.env.VITE_CLOUDFUNCTION_ROOMMANAGEMENT_ID,  // functionId
        JSON.stringify(requestBody),  // body (optional)
        true,  // async (optional)
        import.meta.env.VITE_CLOUDFUNCTION_ROOMMANAGEMENT_ENDPOINTDELETEPLACE,  // path (optional)
        ExecutionMethod.POST,
        {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        }
      );
    } catch (error) {
      console.error(error);
    }
  };

  /**
   * Toggles the activation status of a place (activate/deactivate).
   *
   * @param {Place} place - The place object to toggle the status for.
   * @returns {Promise<void>} - A promise that resolves when the status is toggled.
   * @throws Will log an error message to the console if the toggle operation fails.
   */
  const toggleStatus = async (place: Place) => {
    try {
      const newStatus = !place.deactivated;
      await databases.updateDocument(import.meta.env.VITE_DB_ID, import.meta.env.VITE_DB_PLACE_ID, place.$id, { deactivated: newStatus });
      console.log("room deactivated ", newStatus);
      if (place.deactivated) {
        const requestBody = {
          placeId: place.$id,
        }

        await functions.createExecution(
          import.meta.env.VITE_CLOUDFUNCTION_ROOMMANAGEMENT_ID,  // functionId
          JSON.stringify(requestBody),  // body (optional)
          true,  // async (optional)
          import.meta.env.VITE_CLOUDFUNCTION_ROOMMANAGEMENT_ENDPOINTTOGGLEPLACE,  // path (optional)
          ExecutionMethod.POST,
          {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          }
        );
      }
      place.deactivated = newStatus; // Update the local state
    } catch (error) {
      console.log(error);
    }
  };

  /**
   * Updates the details of a place in the database.
   *
   * @param {Place} updatedPlace - The updated place object.
   * @returns {Promise<void>} - A promise that resolves when the place is updated.
   * @throws Will log an error message to the console if the update operation fails.
   */
  const updatePlace = async (updatedPlace: Place) => {
    try {
      await databases.updateDocument(import.meta.env.VITE_DB_ID, import.meta.env.VITE_DB_PLACE_ID, updatedPlace.$id, {
        place_id: updatedPlace.place_id,
        feature: updatedPlace.feature,
        deactivated: updatedPlace.deactivated,
        description: updatedPlace.description,
        room: updatedPlace.room
      });
    } catch (error) {
      console.log(error);
      throw error;
    }
  };

  /**
   * Adds a new place to the database.
   *
   * @param {string} description - The description of the place.
   * @param {number} place_id - The unique ID of the place.
   * @param {string} room_id - The ID of the room the place belongs to.
   * @param {string[]} features - An array of feature IDs associated with the place.
   * @returns {Promise<void>} - A promise that resolves when the place is added.
   * @throws Will log an error message to the console if the add operation fails.
   */
  const addPlace = async (description: string, place_id: number, room_id: string, features: string[]) => {
    const placeAdd = {
      place_id: place_id,
      description: description,
      feature: features,
      deactivated: false,
      room: room_id,
    };
    await databases.createDocument(
      import.meta.env.VITE_DB_ID, // DB id
      import.meta.env.VITE_DB_PLACE_ID, // collection id
      ID.unique(),
      placeAdd
    );
  };

  /**
   * Checks if a place with the given room ID and place ID already exists in the database.
   *
   * @param {string} room_id - The ID of the room to check.
   * @param {number} place_id - The unique ID of the place to check.
   * @returns {Promise<boolean>} - A promise that resolves to true if the place exists, otherwise false.
   * @throws Will log an error message to the console if the check operation fails.
   */
  const checkPlaceExists = async (room_id: string, place_id: number): Promise<boolean> => {
    try {
      const response = await databases.listDocuments(
        import.meta.env.VITE_DB_ID, // DB id
        import.meta.env.VITE_DB_PLACE_ID, // collection id
        [
          Query.equal('room', room_id), // Filter by room ID
          Query.equal('place_id', place_id), // Filter by place ID
        ]
      );

      // If any documents are found with the same room, return true
      return response.documents.length > 0;
    } catch (err) {
      console.error('Error checking place existence:', err);
      error.value = 'Failed to check if place exists';
      return false;
    }
  };

  return {
    places,
    fetchPlaces,
    fetchPlacesInRoom,
    getLastBookedPlaces,
    lastBookedPlaces,
    deletePlace,
    filteredPlaces,
    filterPlaces,
    hasAvailableSlot,
    toggleStatus,
    updatePlace,
    addPlace,
    checkPlaceExists,
  }
});