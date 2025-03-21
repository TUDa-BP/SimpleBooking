import { ref, reactive } from "vue";
import { defineStore } from 'pinia';
import { Query, Functions, ExecutionMethod } from "appwrite";
import { databases, account, client } from "../appwrite";
import { useUserStore } from "./user";
import { useMessageStore } from "./messages";
const functions = new Functions(client);

/**
 * This store manages hardware bookings, including fetching available hardware,
 * creating bookings, updating bookings, and deleting bookings. It also handles
 * filtering hardware based on availability and categorizing hardware items.
 */
export const useHardwareBookingStore = defineStore('hardwareBooking', () => {
  const bookings = ref<any[]>([]);
  const hardware = ref<any[]>([]);
  const filteredHardware = ref<any[]>([]);
  const categories = ref<any[]>([]);
  const startDate = ref<Date>(new Date());
  const endDate = ref<Date>(new Date());
  const bookingTime = ref(0);

  // Mapping of Hardware-ID -> available from (Date)
  const freeFromMap = reactive<{ [id: string]: Date }>({});

  // Actions

  
  /**
   * Fetches hardware booking documents from the database and updates the `bookings` state.
   * 
   * This function retrieves a list of hardware bookings from the database, ordered
   * in descending order by the `start_time` field. The retrieved documents are then
   * assigned to the `bookings` reactive variable.
   * 
   * @param id - The unique identifier of the user whose bookings should be fetched.
   * @async
   * @function
   * @throws Will log an error to the console if the database query fails.
   */
  const fetchBookings = async (id: string|null = null) => {
    try {
      const queries = [
        Query.limit(5000)
      ];

      if (id) {
        queries.unshift(Query.equal('user', id));
        queries.unshift(Query.greaterThanEqual('end_time', new Date().toISOString()));
        queries.unshift(Query.orderAsc('start_time'));
      }
      else{
        queries.unshift(Query.orderDesc('start_time'));
      }

      const bookingResponse = await databases.listDocuments(
        import.meta.env.VITE_DB_ID,
        import.meta.env.VITE_DB_HWBOOKING_ID,
        queries
      );

      bookings.value = bookingResponse.documents;
    } catch (error) {
      console.log(error);
    }
  };
  
  
  /**
   * Computes the end time by adding the maximum booking time (in days) to the given start time.
   * 
   * @param startTime - The starting date and time.
   * @param maxBookingTime - The maximum booking duration in days.
   * @returns The computed end date and time.
   */
  const computeEndTime = (startTime: any, maxBookingTime: number) => {
      const endDatetime = new Date(startTime);
      endDatetime.setDate(endDatetime.getDate() + maxBookingTime);
      
      return endDatetime
  };
  
  
  /**
   * Updates a hardware booking document in the database with the provided data.
   *
   * @param newData - The new data to update the hardware booking document with.
   * @param id - The unique identifier of the hardware booking document to update.
   * @returns A promise that resolves when the update operation is complete.
   *
   * @remarks
   * This function uses the `databases.updateDocument` method to update the document
   * in the specified database and collection. After the update, it refreshes the
   * hardware bookings by calling `fetchHardwareBookings`.
   */
  const updateBooking = async (newData: any, id: string) => {
      await databases.updateDocument(
        import.meta.env.VITE_DB_ID, // databaseId
        import.meta.env.VITE_DB_HWBOOKING_ID, // collectionId
        id, // documentId
        newData, // data (optional)
      ) ;
      await fetchBookings()
  };
  

  /**
   * Deletes a hardware booking by its unique identifier.
   *
   * This function interacts with the database to remove a booking document
   * and then refreshes the list of hardware bookings by calling `fetchHardwareBookings`.
   *
   * @param id - The unique identifier of the booking to be deleted.
   * @returns A promise that resolves when the booking is successfully deleted
   *          and the hardware bookings are refreshed.
   * @throws Will log an error to the console if the deletion or fetching process fails.
   */
  const deleteBooking = async (id:string) => {
      try{
          await databases.deleteDocument(import.meta.env.VITE_DB_ID, import.meta.env.VITE_DB_HWBOOKING_ID, id);
          await fetchBookings();
      } catch (error) {
          console.log(error);
      }
  };

   /**
     * Deletes a hardware booking from dashboard.
     * @param {string} bookingId
     * @returns {Promise<string | undefined>}
     */
      const deleteUserBooking = async (bookingId: string) => {
        try {
          const requestBody = {
            bookingId: bookingId
          };
    
          const promise = await functions.createExecution(
            import.meta.env.VITE_CLOUDFUNCTION_USERBOOKINGMANAGEMENT_ID,  // functionId
            JSON.stringify(requestBody),  // body (optional)
            true,  // async (optional)
            import.meta.env.VITE_CLOUDFUNCTION_USERBOOKINGMANAGEMENT_ENDPOINTDELETEHWBOOKING,  // path (optional)
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
   * Fetches available hardware within a specified date range and updates the state with the filtered results.
   * 
   * This function retrieves hardware data from the database, processes their booking schedules, 
   * and determines which hardware is available within the given date range. It also calculates 
   * the earliest free date for each hardware item and updates the `filteredHardware` and `freeFromMap` states.
   * 
   * @param searchFrom - The start date of the search range.
   * @param searchTo - The end date of the search range.
   * 
   * @remarks
   * - Hardware with no bookings or hardware that becomes available within the search range is added to the filtered results.
   * - Bookings are sorted by their start time, and overlapping or closely spaced bookings are handled appropriately.
   * - If a hardware item has no bookings ending within the search range, it is excluded from the results.
   * - The function also invokes `fetchHardwareCategories` to update hardware categories after filtering.
   * 
   * @throws Will log an error to the console if the database query fails.
   */
  const fetchAvailableHardware = async (searchFrom: Date, searchTo: Date) => {
    //console.log("searchFrom in fetchHardware:", searchFrom, "searchTo:", searchTo);
    try {
      // Clear state to prevent errors
      filteredHardware.value = [];
      Object.keys(freeFromMap).forEach((key) => delete freeFromMap[key]);

      const responseHW = await databases.listDocuments(
        import.meta.env.VITE_DB_ID,
        import.meta.env.VITE_DB_HW_ID
      );

      hardware.value = responseHW.documents;

      for (const hw of hardware.value) {
        let bookings = hw.hardwareBooking ?? [];
        let earliestFreeDate = new Date();

        // Correct the date if today is before the search range
        if (earliestFreeDate < searchFrom) {
          earliestFreeDate = new Date(searchFrom);
        }

        // Sort bookings by start_time
        bookings.sort((a: any, b: any) => {
          return new Date(a.start_time).getTime() - new Date(b.start_time).getTime();
        });

        // Filter bookings to those ending after the search start date
        bookings = bookings.filter((booking: any) => {
          return new Date(booking.end_time) > searchFrom;
        });

        // If there are no bookings, add the hardware directly
        if (bookings.length === 0) {
          freeFromMap[hw.$id] = earliestFreeDate;
          filteredHardware.value.push(hw);
          continue;
        }

        //Iterates through the bookings of a hardware item to determine its availability
        for (let i = 0; i < bookings.length; i++) {
          const bookingEnd = new Date(bookings[i].end_time);
          let nextBookingStart = new Date(searchTo);
          if (bookings[i + 1] !== undefined) {
            nextBookingStart = new Date(bookings[i + 1].start_time);
          }

          // Break if the booking ends after the search range
          if (bookingEnd > searchTo) {
            break;
          }

          // If there is another booking within 14 days, skip to the next one
          if (bookingEnd.valueOf() + 14 * 24 * 60 * 60 * 1000 > nextBookingStart.valueOf()) {
            continue;
          } else {
            earliestFreeDate = new Date(bookingEnd.getTime() + 24 * 60 * 60 * 1000); //sets availability to the next day
            freeFromMap[hw.$id] = earliestFreeDate;
            filteredHardware.value.push(hw);
            break;
          }
        }
      }

      fetchHardwareCategories();
    } catch (error) {
      console.error("Error fetching hardware:", error);
    }
  };


  /**
   * Fetches and updates the list of unique hardware categories.
   * 
   * This function iterates through the `hardware` collection, extracts the `category`
   * property from each hardware item (if it exists), and adds it to a `Set` to ensure
   * uniqueness. The resulting unique categories are then converted to an array and
   * assigned to the `categories` reactive variable.
   * 
   * @remarks
   * This function assumes that `hardware` is a reactive variable containing an array
   * of hardware objects, and `categories` is a reactive variable that will store the
   * unique categories as an array.
   */
  const fetchHardwareCategories = () => {
    const uniqueCategories = new Set();
    for (let hw of hardware.value) {
      if (hw.category) {
        uniqueCategories.add(hw.category);
      }
    }
    categories.value = Array.from(uniqueCategories);
    //console.log("Verfügbare Kategorien geladen:", categories.value);
  };



  /**
   * Asynchronously books a hardware item for the current user.
   *
   * @param hwID - The unique identifier of the hardware to be booked.
   * 
   * @remarks
   * This function retrieves the current user's ID, constructs a booking request
   * payload, and sends it to a cloud function for processing. If the booking is
   * successful, a success message is displayed. Otherwise, an error is thrown.
   * 
   * @throws Will throw an error if the cloud function execution fails or if the
   * booking request is unsuccessful.
   */
  const bookHardware = async (hwID: string) =>{
    const userID = (await account.get()).$id;
    var startTime = new Date(freeFromMap[hwID]);
    const requestBody =
    {
      hardwareID: hwID, startTime: startTime, userID: userID, hardware_eligibility: useUserStore().user?.hardware_eligibility
    }
    try {
      // Run Cloud Function 
      const result = await functions.createExecution(
        import.meta.env.VITE_CLOUDFUNCTION_HARDWAREBOOKING_ID,  // functionId
        JSON.stringify(requestBody),  // body (optional)
        false,  // async (optional)
        "/bookhardware",  // path (optional)
        'POST' as ExecutionMethod,
        {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        }
      );
      //console.log("Booking request: ", result);
      const jsonResult = JSON.parse(result.responseBody);
      if (jsonResult.success) {
        useMessageStore().showAlert(jsonResult.message,'success')
      } else {
        throw new Error(jsonResult.error);
      }
    } catch (error) {
      console.error("Error executing function:", error);
    }
};
  // Return state and actions for use in components
  return {
    bookings,
    hardware,
    filteredHardware,
    categories,
    startDate,
    endDate,
    bookingTime,
    freeFromMap,
    computeEndTime,
    fetchBookings,
    updateBooking,
    deleteBooking,
    deleteUserBooking,
    fetchHardware: fetchAvailableHardware,
    bookHardware,
    loadCategories: fetchHardwareCategories
  };
});
