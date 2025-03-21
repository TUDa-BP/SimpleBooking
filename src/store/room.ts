import { ref } from "vue";
import { defineStore } from 'pinia';
import { databases, functions } from "../appwrite";
import { ExecutionMethod } from "appwrite";
import { Query } from "appwrite";
import type { RoomBooking, DaySlots } from "./roomBooking";
import type { Place } from "./place";

export interface Room {
    room_number: string;
    description: string;
    num_places: number;
    deactivated: boolean;
    place: Place[];
    $id: string;
    $createdAt: string;
    $updatedAt: string;
    $permissions: string[];
    roomBooking: RoomBooking[];
    $databaseId: string;
    $collectionId: string;
    slots?: DaySlots[];
}
  
export interface DateRange {
  start_time: Date,
  end_time: Date
}

export interface RoomFilter {
    room_number?: string,
    duration?: DateRange
}
  
  

export interface Room {
    room_number: string;
    num_places: number;
    description: string;
    deactivated: boolean;
    $id: string;
    $createdAt: string;
    $updatedAt: string;
    $permissions: string[];
    $databaseId: string;
    $collectionId: string;
}

export const useRoomStore = defineStore('room', () => {
    
    const rooms = ref<Room[]>([]);
    const filteredRooms = ref<Room[]>([]);
    const selectedRoom = ref<any>(null);

    /**
     * Fetches the list of rooms from the database.
     * @param {boolean} [showOnlyActive=false] - If true, fetches only active rooms.
     */
    const fetchRooms = async (showOnlyActive: boolean = false) => {
        try{
            const orderDesc = Query.orderDesc("room_number");
            const query = showOnlyActive ? [Query.equal("deactivated", [false]), Query.limit(5000) , orderDesc] : [ Query.limit(5000), orderDesc];
            const response = await databases.listDocuments(import.meta.env.VITE_DB_ID, import.meta.env.VITE_DB_ROOM_ID, query);
            rooms.value = response.documents.map((doc: any) => ({
              ...doc,
              $createdAt: new Date(doc.$createdAt),
              $updatedAt: new Date(doc.$updatedAt),
              roomBooking: doc.roomBooking.map((booking: any) => ({
                ...booking,
                start_time: new Date(booking.start_time),
                end_time: new Date(booking.end_time)
              }))
            })) as Room[];
            filteredRooms.value = rooms.value;
        } catch (error) {
            console.log(error);
        }
    }

    /**
     * Sets the selected room.
     * @param {any} room - The room to set as selected.
     */
    const setSelectedRoom = (room: any) => {
        selectedRoom.value = room;
    };

    /**
     * Updates the description of a room.
     * @param {string} roomId - The ID of the room to update.
     * @param {string} description - The new description for the room.
     */
    const updateRoomDescription = async (roomId: string, description: string) => {
        try {
            await databases.updateDocument(import.meta.env.VITE_DB_ID, import.meta.env.VITE_DB_ROOM_ID, roomId, {
                description: description
            });
        } catch (error) {
            console.log(error);
        }
    };

    /**
     * Deletes a room and its associated places using a cloud function.
     * @param {string} roomId - The ID of the room to delete.
     */
    const deleteRoom = async (roomId: string) => {
        try {
            // Fetch the data of the selected room directly from the Room collection
            const room = await databases.getDocument(import.meta.env.VITE_DB_ID, import.meta.env.VITE_DB_ROOM_ID, roomId);
            //const placesToDelete = room.place;

            
            const requestBody = {
                placeIds: room.place.map((place: any) => place.$id),
                roomId: roomId,
                //enable: room.deactivated
            }
        
            await functions.createExecution(
                import.meta.env.VITE_CLOUDFUNCTION_ROOMMANAGEMENT_ID,  // functionId
                  JSON.stringify(requestBody),  // body (optional)
                  true,  // async (optional)
                  import.meta.env.VITE_CLOUDFUNCTION_ROOMMANAGEMENT_ENDPOINTDELETEROOM,  // path (optional)
                  ExecutionMethod.POST,
                  {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                  }
            );
            
        } catch (error) {
            console.log(error);
        }
    };

    /**
     * Toggles the deactivated status of a room and its associated places.
     * @param {string} roomId - The ID of the room to toggle.
     * @param {any[]} places - The list of places associated with the room.
     */
    const toggleStatus = async (roomId: string, places: any[]) => {
        try {
            // Toggle the deactivated status of the room
            const room = rooms.value.find(room => room.$id === roomId);
            const newStatus = !room?.deactivated;

            await databases.updateDocument(import.meta.env.VITE_DB_ID, import.meta.env.VITE_DB_ROOM_ID, roomId, { deactivated: newStatus });
            // Update the deactivated status of all places in the room
            for (const place of places) {
                await databases.updateDocument(import.meta.env.VITE_DB_ID, import.meta.env.VITE_DB_PLACE_ID, place.$id, { deactivated: newStatus });
            }
            console.log("room deactivated ", newStatus);
            if(newStatus === true){
                console.log("create execution of cloud function");
                const requestBody = {
                    placeIds: places.map(place => place.$id),
                    roomId: roomId,
                }
            
                await functions.createExecution(
                    import.meta.env.VITE_CLOUDFUNCTION_ROOMMANAGEMENT_ID,  // functionId
                      JSON.stringify(requestBody),  // body (optional)
                      true,  // async (optional)
                      import.meta.env.VITE_CLOUDFUNCTION_ROOMMANAGEMENT_ENDPOINTTOGGLEROOM,  // path (optional)
                      ExecutionMethod.POST,
                      {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                      }
                );
            }
        } catch (error) {
            console.log(error);
        }
    };
    // when a place get added this store increment the numPlace of the Room by one 

    /**
     * Increments the number of places in a room by one.
     * @param {string} roomId - The ID of the room to update.
     * @param {number} numPlaces - The current number of places in the room.
     */
    const updateNumPlacesByOne = async (roomId: string, numPlaces: number) => {
        try {
            await databases.updateDocument(
                import.meta.env.VITE_DB_ID, // databaseid 
                import.meta.env.VITE_DB_ROOM_ID, // collection id 
                roomId,
                { num_places: numPlaces + 1 }
            );
            await fetchRooms(); // Refresh the rooms list after update
        } catch (error) {
            console.log(error);
        }
    }
    
    /**
     * Decrements the number of places in a room by one.
     * @param {string} roomId - The ID of the room to update.
     * @param {number} numPlaces - The current number of places in the room.
     */
    const decrementNumPlacesByOne = async (roomId: string, numPlaces: number) => {
        try {
            await databases.updateDocument(
                import.meta.env.VITE_DB_ID, // databaseid 
                import.meta.env.VITE_DB_ROOM_ID, // collection id 
                roomId,
                { num_places: numPlaces -1}
            );
            await fetchRooms(); // Refresh the rooms list after update
        } catch (error) {
            console.log(error);
        }
    }

    /**
     * Fetches a single room by its ID.
     * @param {string} roomId - The ID of the room to fetch.
     * @returns {Promise<any>} - The fetched room data.
     * @throws {Error} - If the room cannot be fetched.
     */
    const fetchSingleRoom = async (roomId: string) => {
        try {
            const room = await databases.getDocument(import.meta.env.VITE_DB_ID, import.meta.env.VITE_DB_ROOM_ID, roomId);
            return room;
        } catch (error) {
            console.log(error);
            throw new Error('Failed to fetch room');
        }
    };

    /**
     * Adds a new room to the database.
     * @param {Room} room - The room object to add.
     */
    const addRoom = async (room: Room) => {
        try {
            const response = await databases.createDocument(
                import.meta.env.VITE_DB_ID,
                import.meta.env.VITE_DB_ROOM_ID,
                'unique()', // unique ID
                room
            );
            rooms.value.push(response.value.map((doc: any) => ({
                ...doc,
                $createdAt: new Date(doc.$createdAt),
                $updatedAt: new Date(doc.$updatedAt),
                roomBooking: null
              })) as Room);
        } catch (error) {
            console.log(error);
        }
    };

    /**
     * Filters the list of rooms based on the provided filter criteria.
     * @param {RoomFilter} filter - The filter criteria for rooms.
     */
    const filterRooms = (filter: RoomFilter) => {
        const duration = import.meta.env.VITE_SLOT_SIZE ?? 30;
        filteredRooms.value = rooms.value.filter((room) => {
          let isMatch = true;
          console.log("filter room number ",room.room_number)
          if (filter.room_number) {
            isMatch = isMatch && room.room_number.includes(filter.room_number);
          }

          if (filter.duration) {
            let available = hasAvailableSlot(room.roomBooking, filter.duration, duration);
            console.log("has available slot: ", available)
            isMatch = isMatch && available;
          }
          return isMatch;
        });
      }

    /**
     * Checks if a room has an available slot within a given duration.
     * @param {RoomBooking[]} bookings - The list of room bookings.
     * @param {DateRange} duration - The start and end time of the desired slot.
     * @param {number} slotSize - The size of the slot in minutes.
     * @returns {boolean} - True if an available slot exists, false otherwise.
     */
    function hasAvailableSlot(bookings: RoomBooking[], duration: DateRange, slotSize: number): boolean {
        const slotMillis = slotSize * 60 * 1000;
        
        
        const minBookingTime = import.meta.env.VITE_BEGIN_BOOKINGTIME
        console.log("Min booking Time ", minBookingTime)
        const maxBookingTime = import.meta.env.VITE_END_BOOKINGTIME
    
        
        function hasAvailableSlotForDay(bookingsForDay: RoomBooking[], date: Date): boolean {
          console.log("current date: ", date)
            const bookingStartLimit = new Date(date);
            bookingStartLimit.setHours(minBookingTime, 0, 0, 0); 
            console.log("Booking Start Limit: ", bookingStartLimit)
    
            const bookingEndLimit = new Date(date);
            bookingEndLimit.setHours(maxBookingTime, 0, 0, 0); 
    
           
            if (bookingsForDay.length === 0) {
              console.log("there is no booking")
                return true;
            }
            if ( bookingEndLimit === bookingsForDay[0].end_time && bookingStartLimit === bookingsForDay[0].start_time){
              console.log("There is one booking for all day")
              return false;
            }
    
           
            const sortedBookings = bookingsForDay.sort((a, b) => a.start_time.getTime() - b.start_time.getTime());
    
            
            if (sortedBookings[0].start_time.getTime() - bookingStartLimit.getTime() >= slotMillis) {
              console.log("start time free")
              console.log("Booking start time: ", sortedBookings[0].start_time)
              console.log("Start time in general: ", bookingStartLimit)
                return true;
            }
    
            
            for (let i = 1; i < sortedBookings.length; i++) {
                const previousBooking = sortedBookings[i - 1];
                const currentBooking = sortedBookings[i];
    
                const gap = currentBooking.start_time.getTime() - previousBooking.end_time.getTime();
                if (gap >= slotMillis) {
                  console.log("There's a gap between the bookings")
                    return true;
                }
            }
    
            
            const lastBooking = sortedBookings[sortedBookings.length - 1];
            if (bookingEndLimit.getTime() - lastBooking.end_time.getTime() >= slotMillis) {
              console.log("end time free")
                return true;
            }
    
            return false;
        }
    
        
        let currentDate = new Date(duration.start_time);
        while (currentDate < duration.end_time) {
            
            const bookingsForDay = bookings.filter(booking =>
                booking.start_time.toDateString() === currentDate.toDateString()
            );
            console.log("bookings for day\n", bookingsForDay)
    
            
            if (hasAvailableSlotForDay(bookingsForDay, currentDate)) {
                return true;
            }
    
            
            currentDate.setDate(currentDate.getDate() + 1);
        }
    
        return false;
    }
    

    return {
        rooms,
        filteredRooms,
        fetchRooms,
        hasAvailableSlot,
        filterRooms,
        fetchSingleRoom,
        updateNumPlacesByOne,
        decrementNumPlacesByOne,
        selectedRoom,
        setSelectedRoom,
        updateRoomDescription,
        deleteRoom,
        toggleStatus,
        addRoom     
    }

})
