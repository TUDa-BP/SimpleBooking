<template>
  <div class="hardware-return">
    <!-- Sidebar -->
    <Sidebar :isSidebarVisible="isSidebarVisible" @toggleSidebar="toggleSidebar"/>
    
    <!-- Actual content for hardware booking management page; only seen if user.role == admin -->
    <div :class="['content', { 'content-expanded': !isSidebarVisible }]">
      <header>
        <h1> Manage Hardware Bookings </h1>
      </header>        

      <!--Search bar-->
      <div class="input-group rounded mt-4 mb-4">
        <span class="input-group-text" id="basic-addon1">
          <!-- Search icon -->
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-search"
            viewBox="0 0 16 16" >
            <path
              d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0">
            </path>
          </svg>
        </span>
        <input type="search" v-model="searchQuery" class="form-control" placeholder="Search Item" aria-label="Search" aria-describedby="search-addon" />
      </div>

      <!-- Table displaying bookings -->
      <table class="table" v-if="bookings.length > 0">
        <thead>
          <tr>
            <th>#</th>
            <th>User</th>
            <th>Item</th>
            <th>[SN/CCN]
              <i class="bi bi-info-circle" title="SN = stock number &#10;CCN = cost center number" style="color: #595C5F;"></i>
            </th>
            <th>Duration</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(booking, index) in searchHardware" :key="booking.id">
            <td>{{ index + 1 }}</td>
            <td>{{ booking.user_first_name + " " + booking.user_last_name }}</td>
            <td>{{ booking.item }}</td>
            <td>SN: {{ booking.stock_number }} <br> CCN: {{ booking.cost_center_number }}</td>
            <td>{{ booking.booking_duration }}</td>
            <td>
            <!--Displays the status of the hardware and allows to change it-->
            <span :class="booking.availability === null ? 'booking-not-started' : booking.availability ? 'hardware-available' : 'hardware-unavailable'" @click="toggleAvailability(booking)">
              {{ booking.availability === null ? 'Scheduled' : booking.availability ?  'Returned' : 'Booked' }}
            </span>
            
            </td>
            <td>
              <!--Buttons to edit and delete the specific booking-->
              <div class="action-buttons">
                <button class="classic-button btn-delete" @click="deleteBooking(booking.id)">
                  <i class="bi bi-x-circle-fill"></i>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      <!-- Message displayed when no bookings are found -->
      <div v-else>No hardware bookings found!</div>
    </div>
  </div>
</template>

<script setup>
import Sidebar from "@/components/Sidebar.vue";
import { ref, computed, onMounted } from 'vue';
import { useMessageStore } from '@/store/messages';
import { useHardwareStore } from '@/store/hardware';
import { useHardwareBookingStore } from '@/store/hardwareBooking';


/*----------------------------------------system relevant variables---------------------------------------------------------------*/
const isSidebarVisible = ref(true);
const messageStore = useMessageStore();  
const hardwareBookingStore = useHardwareBookingStore();
const hardwareStore = useHardwareStore();

/*----------------------------------------general variables----------------------------------------------------------------------*/
const searchQuery = ref(""); 
//table data
const bookings = ref([]);

/**
 * @function searchHardware
 * @description Filters the bookings based on the search query.
 * @returns {Array} Filtered list of bookings.
 */
const searchHardware = computed(() => {
  return bookings.value.filter((booking) => {
    const query = searchQuery.value.toLowerCase();
    return (
      booking.item.toLowerCase().includes(query)
    );
  });
});

/**
 * @function getHardwareBookings
 * @description Fetches the list of hardware bookings and processes the data.
 */
const getHardwareBookings = async () => {
  try {
    await hardwareBookingStore.fetchBookings();
    const results = []

    hardwareBookingStore.bookings.forEach((booking) => {
      const bookingDuration = formatDuration(booking.start_time, booking.end_time);
      const available = checkAvailability(booking, hardwareBookingStore.bookings);
      const futureBookingStarted = checkFutureBookings(booking,hardwareBookingStore.bookings)
      
      results.push({
        //General information
        id: booking.$id,
        user_first_name: booking.user.first_name,
        user_last_name: booking.user.last_name,
        //Time specific
        start_time: booking.start_time,
        max_booking_time: booking.hardware?.max_booking_time || 0,
        booking_duration: bookingDuration,
        //Hardware specific
        item: booking.hardware?.hardware_name || "N/A",
        stock_number: booking.hardware?.stock_number >= 0 ? booking.hardware?.stock_number : "N/A",
        cost_center_number: booking.hardware?.cost_center_number >= 0 ? booking.hardware?.cost_center_number : "N/A",
        hardware_id: booking.hardware?.$id  || null,
        //Availability specific
        availability: available,
        future_booking_started: futureBookingStarted
      })
    })
    bookings.value = results;
  } catch (error) {
    console.log(error);
    messageStore.showAlert(error.message, 'danger');
  }
};

/**
 * @function deleteBooking
 * @description Deletes a booking by its ID after user confirmation.
 * @param {number} id - The ID of the booking to delete.
 */
const deleteBooking = async (id) => {
  try{
    const confirmed = confirm("Are you sure you want to delete this booking?\nThis process cannot be undone.");
    if (!confirmed) return;

    await hardwareBookingStore.deleteBooking(id);
    await getHardwareBookings()
    messageStore.showAlert("Deletion successful!",'success');
  } catch (error) {
    console.log(error);
    messageStore.showAlert(error.message, 'danger');
  }
}

/**
 * @function updateBooking
 * @description Updates the booking's availability and end time.
 * @param {Object} booking - The booking object to update.
 * @param {boolean} newAvailability - The new availability status.
 */
async function updateBooking(booking, newAvailability){
  //New availability == ture: set date to now
  if(newAvailability){
    await hardwareBookingStore.updateBooking(
      { 
        end_time: new Date().toISOString().split("T")[0]
      }, booking.id)
    return
  }
  //Reset date to max. return date
  const endTime = hardwareBookingStore.computeEndTime(booking.start_time, booking.max_booking_time);
  await hardwareBookingStore.updateBooking(
    { 
      end_time: endTime.toISOString().split("T")[0]
    },
    booking.id
  );
}

/**
 * @function checkFutureBookings
 * @description Checks if there are future bookings for the same hardware.
 * @param {Object} booking - The current booking.
 * @param {Array} bookingList - The list of all bookings.
 * @returns {boolean} Whether a future booking has started.
 */
function checkFutureBookings(booking,bookingList){

  const futureBookings = bookingList.filter((otherBooking) => {
    return otherBooking.hardware.$id === booking.hardware.$id && 
      new Date(otherBooking.start_time) > new Date(booking.start_time);
  });

  //Check if future Bookin already started
  return futureBookings.some((futureBooking) => {
    return new Date(futureBooking.start_time) <= new Date(); 
  });

}

/**
 * @function checkAvailability
 * @description Determines the availability status of the hardware.
 * @param {Object} booking - The current booking.
 * @param {Array} bookingList - The list of all bookings.
 * @returns {boolean|null} The availability status.
 */
//Check if HW was already returned
function checkAvailability(booking, bookingList){

  //Set true if future booking already started 
  if (checkFutureBookings(booking,bookingList)) {
    return true;
  }

  const isBookingNotStarted = new Date(booking.start_time) > new Date();
  if (isBookingNotStarted) {
    return null;
  }

  //Set according to availability attribute
  return booking.hardware.is_available;
}

/**
 * @function formatDuration
 * @description Formats the booking duration into a readable string.
 * @param {string} startTime - The start time of the booking.
 * @param {string} endTime - The end time of the booking.
 * @returns {string} The formatted duration.
 */
function formatDuration (startTime, endTime){
  const startDate = new Date(startTime);
  const endDate = new Date(endTime)
  return `${startDate.toLocaleDateString('de-De')} - ${endDate.toLocaleDateString('de-De')}`;
}

/**
 * @function toggleAvailability
 * @description Toggles the availability status of the hardware.
 * @param {Object} booking - The booking object to update.
 */
//Toggle Availability
const toggleAvailability = async (booking) => {
  try {
    //Handle requested changes in availability
    if(booking.availability === null){
      messageStore.showLongAlert('This status cannot be updated since it has not started yet.', 'info');
      return;
    }
    if(booking.future_booking_started){
      messageStore.showLongAlert('This status cannot be updated since another booking has already started.', 'info');
      return;
    }

    const newAvailability = !booking.availability;
    //Update & Fetch
    await updateBooking(booking, newAvailability)
    console.log("updating...")
    await hardwareStore.updateHardware({ is_available: newAvailability }, booking.hardware_id);
    await getHardwareBookings();

    messageStore.showAlert('Status updated!', 'success');
  } catch (error) {
    console.log(error);
    messageStore.showAlert(error.message, 'danger');
  }
};

/**
 * @function toggleSidebar
 * @description Toggles the visibility of the sidebar.
 */
function toggleSidebar() {
  isSidebarVisible.value = !isSidebarVisible.value;
}

/**
 * Lifecycle hook to fetch bookings when the component is mounted.
 */
onMounted(async () => { 
  await getHardwareBookings();
});

</script>

<style lang="scss" scoped>
@use "../../node_modules/bootstrap/scss/bootstrap" as *;
@use "../../node_modules/bootstrap-icons/font/bootstrap-icons" as *;
@import '@/style/frames.scss';
@import '@/style/button.scss';
@import '@/style/typography.scss';
  
.hardware-return {
  display: flex;
  flex-direction: row;
  height: 100vh;
}

.input-group-text{
  margin-right: 0rem !important;
}
   
// Availability of the hardware
@mixin availability($color) {
  color: $color;
  font-weight: bold;
  cursor: pointer;
}

.hardware-available {
  @include availability(green);
}

.hardware-unavailable {
  @include availability(red)
}

.booking-not-started {
  @include availability(#4d99e6)
}

</style>