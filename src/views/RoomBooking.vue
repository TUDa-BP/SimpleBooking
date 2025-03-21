<template>
<div class="room-booking">
      <Sidebar :isSidebarVisible="isSidebarVisible" @toggleSidebar="toggleSidebar" />
      <div :class="['content', { 'content-expanded': !isSidebarVisible }]">
        <div :class="`search-field`">
          <!--Search button in Card header-->
          <div class="search-bar">
            <CalendarPlacebooking v-model:date="start_time" :initialDate="start_time" label="From:" />
            <CalendarPlacebooking v-model:date="end_time" :initialDate="end_time" label="Until:" />
            
            <div class="room-search">
              <span style="margin-right: 0.5em;">Room:</span>
                <input v-model="selectedRoom" type="text" class="border bg-white" placeholder="Search Room"/>    
            </div>
            <button type="button" class="btn btn-primary search" value="select features" @click="search">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-search"
                viewBox="0 0 16 16">
                <path
                  d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0">
                </path>
              </svg>
              Search
            </button>
          </div>
        </div>

        <!-- is shown if no places are avaiable -->
        <p v-if="filteredRooms.length == 0" class="text-center">
          No rooms available for the selected time period
        </p>
        <table class="table" v-else>
          <thead>
            <tr>
              <th>#</th>
              <th>Room</th>
              <th>Number of Places</th>
              <th></th>
            </tr>
          </thead>
          <tbody>

            <tr v-for="(room, index) in filteredRooms" :key="room.$id">
              <td>{{ index + 1}}</td>
              <td>{{ room.room_number }}</td>
              <td>{{ room.num_places }}</td>
              <td>
                <BookingInformation :index="index"></BookingInformation>
              </td>
            </tr>
            
          </tbody>
        </table>

      </div>
    </div>

  
</template>
  
<script setup>
import { ref, onMounted, computed } from 'vue';
import Sidebar from "@/components/Sidebar.vue";
import CalendarPlacebooking from "@/components/CalendarPlacebooking.vue";
import BookingInformation from '@/components/RoomBookingInformation.vue';
import { useMessageStore } from '@/store/messages';
import { useRoomStore } from "@/store/room";
import { useRoomBookingStore } from "@/store/roomBooking";

/**
 * Reactive variables for start and end time of the booking.
 */
const start_time = ref(new Date());
const end_time = ref(new Date(new Date().setMonth(new Date().getMonth() + 1)));

/**
 * Store instances for managing messages, room bookings, and room data.
 */
const messageStore = useMessageStore();
const roomBookingStore = useRoomBookingStore();
const roomStore = useRoomStore();

/**
 * Reactive variable for the selected room.
 */
const selectedRoom = ref(null);

/**
 * Reactive variable to manage the visibility of the sidebar.
 */
const isSidebarVisible = ref(true);

/**
 * Toggles the visibility of the sidebar.
 */
function toggleSidebar() {
  isSidebarVisible.value = !isSidebarVisible.value;
}

/**
 * Computed property to get the filtered list of rooms.
 */
const filteredRooms = computed(() => roomStore.filteredRooms);

/**
 * Searches for available rooms based on the selected time period and room number.
 * Validates the input and updates the room store with the filtered results.
 * Displays an alert if validation fails.
 */
function search() {
  try {
    if (start_time.value === '' || end_time.value === '') {
      throw new Error('Please select start and end date');
    }
    if (start_time.value >= end_time.value) {
      throw new Error('Start date should be less than end date');
    }

    // Set time to 00:00:00 for both start and end dates
    start_time.value.setSeconds(0, 0);
    end_time.value.setSeconds(0, 0);
    start_time.value.setMinutes(0, 0);
    end_time.value.setMinutes(0, 0);

    roomBookingStore.setStartDate(start_time.value);
    roomBookingStore.setEndDate(end_time.value);
    const filter = selectedRoom.value === null ? 
      {
        duration: {
          start_time: start_time.value,
          end_time: end_time.value
        }
      }:
      {
        room_number: selectedRoom.value.trim(),
        duration: {
          start_time: start_time.value,
          end_time: end_time.value
      }
    };
    
    roomStore.filterRooms(
      filter
    );
    console.log("rooms filtered")
    console.log(roomStore.filteredRooms)
    selectedRoom.value = null;

  } catch (error) {
    messageStore.showAlert(error.message, 'warning');
  }
}

/**
 * Fetches the initial list of rooms and sets the default date-time interval on component mount.
 */
onMounted(async () => {
  await roomStore.fetchRooms(true);
  roomBookingStore.setDefaultDateTimeInterval();
});
</script>

<style scoped>
@import "../style/frames.scss";

.room-booking {
  display: flex;
  flex-direction: row;
}
.text-center {
  margin-top: 2em;
}

.btn {
  background-color: #6610f2 !important;
  color: white !important;
}

.table {
  margin-top: 1em;
  border-collapse: collapse;

  button {
    float: right;
  }

  td:last-child {
    text-align: right;
  }
}


.search-bar {
  position: relative;
  width: 100%;
  top: -1.5rem;
  display: flex;
  padding: 0.5em;
  justify-content: space-between;
  background-color: #ebe5fc;
  border-radius: 2.5em;

  .search {
    border-radius: 2em;
    padding: 0.5em !important;
    &:active {
      color: #6c1ced !important;
    }
  }

  input[type="button"] {
    padding: 0em !important;
    font-size: 0.9em;
  }

  input[type="text"] {
    width: 125px;
    font-size: 0.9em;
    border-radius: 5px;
    padding: 0.5rem;
  }
  
  span {
    margin-right: 0.5em;
  }

  .room-search {
    margin: 0.5em;
    font-size: 0.9em;    
  }

}


.search-field {
  margin-top: 4rem;
}

</style>