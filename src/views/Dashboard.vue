<template>
  <div class="dashboard">
    <!-- Sidebar -->
    <Sidebar :isSidebarVisible="isSidebarVisible" @toggleSidebar="toggleSidebar"/>
    <div :class="['content', { 'content-expanded': !isSidebarVisible }]">
      <!-- Title -->
      <header>
        <h1>{{ greetingMessage }} {{ userStore.user?.first_name }}!</h1>
      </header>

      <div v-if="!userStore.user?.role.includes('student')" class="card">
        <!--Card Header-->
        <h5 class="ch card-header">Room Booking</h5>

        <div class="card-body">
          
          <div class="card-table-container">

          <!--List of place bookings-->
          <table class="table">
            <!--Headers-->
            <thead>
              <tr>
                <th style="width: 50px">#</th>
                <th>Time Slot</th>
                <th>Room</th>
                <th>Number of Places</th>
                <th>Action</th>
              </tr>
            </thead>
            <!--Bookings-->
            <tbody>
              <tr v-for="(booking, index) in roomBookings" :key="roomBookings.id">
                <td style="width: 50px">{{ index + 1 }}</td>
                <td>{{ booking.time_slot }}</td>
                <td>{{ booking.room }}</td>
                <td># {{ booking.num_places }}</td>
                <td>
                  <!--Delete button-->
                  <div class="action-buttons" style="margin-left: 16px">
                    <button class="classic-button btn-delete" @click="deleteBooking(booking, false)">
                      <i class="bi bi-x-circle-fill"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
          

          </div>

        </div>
        <!--Reference to place booking page-->
        <button id="bookRoom" class="classic-button btn" @click="refRoomBooking">Book Room Now <i class="bi bi-door-open"></i></button>
       
      </div>
      <div class="card">
      <!--Card header-->
      <div class="header-container">
        <h5 class="ch card-header" style="transform: translateY(-5px);">Place Booking</h5>
        <!--Show time quota if user == student-->
        <TimeQuotaDisplay v-if="userStore.user?.role.includes('student')" :timeQuota="userStore.user?.time_quota"/>
      </div>
      

        <div class="card-body">
          
          <div class="card-table-container">

          <!--List of place bookings-->
          <table class="table">
            <!--Headers-->
            <thead>
              <tr>
                <th style="width: 50px">#</th>
                <th>Time Slot</th>
                <th>Room</th>
                <th>Place</th>
                <th>Action</th>
              </tr>
            </thead>
            <!--Bookings-->
            <tbody>
              <tr v-for="(booking, index) in placeBookings" :key="placeBookings.id">
                <td style="width: 50px">{{ index + 1 }}</td>
                <td>{{ booking.time_slot }}</td>
                <td>{{ booking.room }}</td>
                <td>@{{ booking.place }}</td>
                <td>
                  <!--Delete button-->
                  <div class="action-buttons" style="margin-left: 16px">
                    <button class="classic-button btn-delete" @click="deleteBooking(booking, false)">
                      <i class="bi bi-x-circle-fill"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
          

          </div>

        </div>
        
        <!--Reference to place booking page-->
        <button id="bookPlace" class="classic-button btn" @click="refPlaceBooking">Book Place Now <i class="bi bi-calendar-event"></i></button>
        
      </div>

      <div  class="card">
        <!--Card Header-->
        <h5 class="ch card-header">Hardware Booking</h5>
        <div class="card-body">

          <div class="card-table-container">

          <!--List of hardware bookings-->
          <table class="table">
            <!--Headers-->
            <thead>
              <tr>
                <th style="width: 50px">#</th>
                <th>Booking Duration</th>
                <th>Item</th>
                <th>[SN/CCN]
                  <i class="bi bi-info-circle" title="SN = stock number &#10;CCN = cost center number" style="color: #595C5F;"></i>
                </th>
                <th>Storage Location</th>
                <th>Action</th>
              </tr>
            </thead>
            <!--Bookings-->
            <tbody>
              <tr v-for="(booking, index) in hardwareBookings" :key="hardwareBookings.$id">
                <td style="width: 50px">{{ index + 1 }}</td>
                <td>{{ booking.booking_duration }}</td>
                <td>{{ booking.item }}</td>
                <td>SN: {{ booking.stock_number }}<br>CCN: {{ booking.cost_center_number }}</td>
                <td>{{ booking.room_number }} <br> Storage:{{ booking.storage_id }} <br> Shelf Slot:{{ booking.shelf_slot }}</td>
                <td>
                  <!--Delete button-->
                  <div class="action-buttons" style="margin-left: 16px">
                    <button class="classic-button btn-delete" @click="deleteBooking(booking, true)">
                      <i class="bi bi-x-circle-fill"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          </div>

        </div>
        <!--Reference to hardware booking page-->
        <button id="bookHardware" class="classic-button btn" @click="refHardwareBooking">Book Hardware Now <i class="bi bi-cpu"></i></button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import Sidebar from '@/components/Sidebar.vue';
import TimeQuotaDisplay from '@/components/TimeQuotaDisplay.vue'
import { useRouter } from 'vue-router';
import { useMessageStore } from '@/store/messages';
import { useUserStore } from '@/store/user';
import { useRoomBookingStore } from '@/store/roomBooking';
import { usePlaceBookingStore } from '@/store/placeBooking';
import { useHardwareBookingStore } from '@/store/hardwareBooking';
import { functions } from '../appwrite';

// System relevant variables
const isSidebarVisible = ref(true);
const messageStore = useMessageStore();
const userStore = useUserStore();
const roomBookingStore = useRoomBookingStore();
const placeBookingStore = usePlaceBookingStore();
const hardwareBookingStore = useHardwareBookingStore();
const router = useRouter();

// General variables
const greetingMessage = ref('');
const roomBookings = ref([])
const placeBookings = ref([]);
const hardwareBookings = ref([]);

/**
 * Fetches room bookings from the user store and formats them.
 * @async
 * @function getRoomBookings
 * @returns {Promise<void>}
 */
async function getRoomBookings () {
  console.log("get room bookings")
  try{
    await roomBookingStore.fetchBookings(userStore.user.$id);
    roomBookings.value = roomBookingStore.bookings.map(({ $id, start_time, end_time, room }) => ({
      id: $id,
      start_time,
      booking_type: "room",
      time_slot: formatBookingTime(start_time, end_time),
      num_places: room?.num_places >= 0 ? room.num_places : "N/A",
      room: room?.room_number || "N/A"
    }));
  } catch (error) {
    console.error('Error fetching place bookings:', error); 
  }
}

/**
 * Fetches place bookings from the user store and formats them.
 * @async
 * @function getPlaceBookings
 * @returns {Promise<void>}
 */
async function getPlaceBookings () {
  console.log("get place bookings")
  try{
    await placeBookingStore.fetchBookings(userStore.user.$id);
    placeBookings.value = placeBookingStore.bookings.map(({ $id, start_time, end_time, booking_type, place }) => ({
      id: $id, // id needed for deletion
      start_time, // start_time needed for deletion check
      booking_type,
      time_slot: formatBookingTime(start_time, end_time),
      place: place?.place_id || "N/A",
      room: place?.room?.room_number || "N/A"
    }));
  } catch (error) {
    console.error('Error fetching place bookings:', error); 
  }
}

/**
 * Fetches hardware bookings from the user store and formats them.
 * @async
 * @function getHardwareBookings
 * @returns {Promise<void>}
 */
async function getHardwareBookings()  {
  console.log("get hw bookings")
  try {
    await hardwareBookingStore.fetchBookings(userStore.user.$id);
    hardwareBookings.value = hardwareBookingStore.bookings.map(({ $id, start_time, end_time, hardware }) => ({
      id: $id, // id needed for deletion
      start_time, // start_time needed for deletion check
      booking_duration: formatBookingTime(start_time, end_time, true),
      item: hardware?.hardware_name || "N/A",
      stock_number: hardware?.stock_number,
      cost_center_number: hardware?.cost_center_number,
      room_number: hardware?.storageLocation?.room_number || "N/A",
      storage_id: hardware?.storageLocation?.storage_id || "N/A",
      shelf_slot: hardware?.storageLocation?.shelf_slot || "N/A"
    }));
  }catch (error){
    console.error('Error fetching hardware bookings:', error);
    messageStore.showAlert(error.message, 'danger')
  }
};

/**
 * Checks if the booking date is valid for deletion.
 * @function checkDate
 * @param {string} startTime - The start time of the booking.
 * @param {boolean} isHardware - Whether the booking is for hardware.
 * @returns {boolean} - True if the booking can be deleted, false otherwise.
 */
function checkDate(startTime, isHardware) {
  if(isHardware){
    let today = new Date();
    today = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    return today < new Date(startTime);
  }

  const now = Date.now();
  const start = new Date(startTime).getTime();
  const notWithin30min = start <= now || start > (now + 30 * 60 * 1000);
  return now < start && notWithin30min;
}

/**
 * Updates the user data after a cloud function execution.
 * @async
 * @function updateAfterCloudFunction
 * @param {string} executionId - The ID of the cloud function execution.
 * @returns {Promise<void>}
 */
const updateAfterCloudFunction = async (executionId) => {
  console.log(executionId);
  let execution;
    do {
        execution = await functions.getExecution(
          import.meta.env.VITE_CLOUDFUNCTION_USERBOOKINGMANAGEMENT_ID,
          executionId
        );
        console.log(`current status: ${execution.status}`);

        if (execution.status === "completed") {
            console.log("Cloud function completed!");
            await getUserData();
            break;
        }

        await new Promise(resolve => setTimeout(resolve, 1000)); // Warte 3 Sekunden vor nächster Prüfung
    } while (execution.status !== "failed"); // Falls sie fehlschlägt, brich ab

    if (execution.status === "failed") {
        console.error("Cloud function failed!");
    }

}

/**
 * Deletes a booking.
 * @async
 * @function deleteBooking
 * @param {Object} booking - The booking to delete.
 * @param {boolean} isHardware - Whether the booking is for hardware.
 * @returns {Promise<void>}
 */
const deleteBooking = async (booking, isHardware) => { 
  try{
    if (checkDate(booking.start_time, isHardware)){
      const confirmed = confirm("Are you sure you want to delete your booking?\nThis process cannot be undone.");
      if (!confirmed) return;

      let executionId;
      if(isHardware){
        executionId = await hardwareBookingStore.deleteUserBooking(booking.id);
      }
      else if(booking.booking_type !== "room") {
        executionId = await placeBookingStore.deleteUserBooking(booking.id, booking.booking_type);
      }
      else {
        executionId = await roomBookingStore.deleteUserBooking(booking.id);
      }
      updateAfterCloudFunction(executionId);
      messageStore.showAlert("Deletion successful!",'success');

    } else {
      messageStore.showLongAlert((isHardware ?
      "This booking session cannot be deleted since it has already started!":
      "This booking session cannot be deleted since it has already started or it will start within 30min!"), 
      'info');
    }
  } catch (error){
    console.log("Could not delete user booking: " + error);
  }

};

/**
 * Navigates to the room booking page.
 * @function refRoomBooking
 */
const refRoomBooking = () => {
  router.push("/room-booking")
}

/**
 * Navigates to the place booking page.
 * @function refPlaceBooking
 */
const refPlaceBooking = () => {
  router.push("/place-booking");
};

/**
 * Navigates to the hardware booking page.
 * @function refHardwareBooking
 */
const refHardwareBooking = () => {
  router.push("/hardware-booking");
};

/**
 * Formats the booking time.
 * @function formatBookingTime
 * @param {string} startTime - The start time of the booking.
 * @param {string} endTime - The end time of the booking.
 * @param {boolean} [isHardware=false] - Whether the booking is for hardware.
 * @returns {string} - The formatted booking time.
 */
function formatBookingTime (startTime,endTime,isHardware = false){
  const startDate = new Date(startTime);
  const endDate = new Date(endTime);

  if(isHardware){
    return `${startDate.toLocaleDateString('de-DE')} - ${endDate.toLocaleDateString('de-DE')}`;
  }

  const timeOption = { hour: '2-digit', minute: '2-digit' }
  if (startDate.toLocaleDateString() === endDate.toLocaleDateString()) {
    return `${startDate.toLocaleDateString('de-DE')} ${startDate.toLocaleTimeString('de-De',timeOption)} - 
      ${endDate.toLocaleTimeString('de-De',timeOption)}`;
  } else {
    return `${startDate.toLocaleDateString('de-DE')} ${startDate.toLocaleTimeString('de-De',timeOption)} - 
      ${endDate.toLocaleDateString('de-DE')} ${endDate.toLocaleTimeString('de-De',timeOption)}`;
  }
}

/**
 * Sets the greeting message based on the current time.
 * @function setGreetingMessage
 */
const setGreetingMessage = () => {
  const currentHour = new Date().getHours();
  if (currentHour < 12) {
    greetingMessage.value = "Good Morning";
  } else if (currentHour < 18) {
    greetingMessage.value = "Good Afternoon";
  } else {
    greetingMessage.value = "Good Evening";
  }
}

/**
 * Toggles the visibility of the sidebar.
 * @function toggleSidebar
 */
function toggleSidebar() {
  isSidebarVisible.value = !isSidebarVisible.value;
}

/**
 * Fetches user data and updates the bookings.
 * @async
 * @function getUserData
 * @returns {Promise<void>}
 */
async function getUserData () {
  try {
    await userStore.fetchUser()
    if(!userStore.user?.role.includes("student")){
      await getRoomBookings()
    }
    await getPlaceBookings()
    await getHardwareBookings()
  } catch (error) {
    console.log("Error updating user data: ", error)
  }
}

onMounted(() => {
  setGreetingMessage();
  getUserData();
})

</script>

<style lang="scss" scoped>
  @use "../../node_modules/bootstrap/scss/bootstrap" as *;
  @use "../../node_modules/bootstrap-icons/font/bootstrap-icons" as *;
  @import '@/style/frames.scss';
  @import '@/style/button.scss';
  @import '@/style/typography.scss';

  .dashboard {
      display: flex;
      justify-content: center;
      flex-direction: row;
      height: 100vh;
  }

  .ch {
    padding: 0;
    background-color: transparent;
    border: none;
    margin-top: 16px;
    margin-left: 16px;
  }


  .card {
    width: 100%; 
    max-height: 100vh; 
    overflow: hidden; 
    display: flex;
    flex-direction: column; 
    margin-top: 2rem;
    margin-bottom: 1rem;
    border: 2px solid #54595e66;
    border-radius: 10px;
    padding: 1rem;
  }

  .card-table-container {
    position: relative;
    flex-grow: 1;
    overflow: hidden; 
    overflow-y: auto;
  }

  .table {
    width: 100%; 
    border-collapse: collapse;
  }

  .table tbody {
    display: block; 
    max-height: 28vh;
    overflow-y: scroll;
    width: 100%; 
  }

  .table tr {
    display: table; 
    width: 100%;
    table-layout: fixed; 
  }

  #bookHardware,
  #bookPlace,
  #bookRoom {
    position: sticky;
    bottom: 0;
  }

  .header-container {
    display: flex;
    gap: 10px; 
  }

</style>
