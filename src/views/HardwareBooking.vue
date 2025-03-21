<template>
  <div class="hardware-booking">
    <Sidebar :isSidebarVisible="isSidebarVisible" @toggleSidebar="toggleSidebar"/>
    <div :class="['content', { 'content-expanded': !isSidebarVisible}]">
      <!-- Dropdown-Komponente mit Button, der automatisch das Menü öffnet/schließt -->
      <Dropdown
        id="category-dropdown"
        label="Select Category:"
        :options="categories"
        placeholder="Select Category"
        v-model="selectedValue"
      />

      <div class="search-bar">
            <CalendarPlacebooking v-model:date="start_time" :initialDate="start_time" @update:date="(val) => start_time = val" label="From:" />
            <CalendarPlacebooking v-model:date="end_time" :initialDate="end_time"  @update:date="(val) => end_time = val"label="Until:" />

            <button type="button" class="btn btn-search search" value="select features" @click="fetchData">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-search"
                viewBox="0 0 16 16">
                <path
                  d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0">
                </path>
              </svg>
              Search
            </button>
          </div>

      <table class="table">
        <thead>
          <tr>
            <th>#</th>
            <th>Hardware</th>
            <th>[SN/CCN]
              <i class="bi bi-info-circle" title="SN = stock number &#10;CCN = cost center number" style="color: #595C5F;"></i>
            </th>
            <th>Available From</th>
            <th>Duration</th>
            <th>Location</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <!-- Iteration über die gefilterte Hardware -->
          <tr v-for="(hw,index) in hardware" :key="hw.$id">
            <td>{{ index + 1  }}</td>
            <td>{{ hw.hardware_name }}</td>
            <td>SN: {{ hw.stock_number }}<br>CCN: {{ hw.cost_center_number }}</td>
            <td>{{ formatDateTime(store.freeFromMap[hw.$id]) }}</td>
            <td>{{ hw.max_booking_time }} days </td>
            <td>{{ hw.storageLocation ? hw.storageLocation.room_number : 'N/A' }}</td>
            <td>
              <button class="btn classic-button" @click="bookHardware(hw.$id)">Book Hardware</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, computed, watch } from 'vue';
import Sidebar from "@/components/Sidebar.vue";
import Dropdown from '@/components/Dropdown.vue';
import { useMessageStore } from '@/store/messages';
import CalendarPlacebooking from '../components/CalendarPlacebooking.vue';
import { useHardwareBookingStore } from '@/store/hardwareBooking';
import { useUserStore } from '@/store/user';

const messageStore = useMessageStore();
const store = useHardwareBookingStore();
const userStore = useUserStore();
const isSidebarVisible = ref(true);

const start_time = ref(new Date());
const end_time = ref(new Date(new Date().setMonth(new Date().getMonth() + 1)));

const categories = computed(() => store.categories);

let selectedValue = ref("all"); // Add this if it's not already defined

/**
 * Fetches user data and hardware data on component mount.
 */
onMounted(async () => {
  await userStore.fetchUser();
  await fetchData();
});

/**
 * Fetches hardware data based on the selected start and end times.
 * Displays an alert if the user is not eligible to book hardware.
 */
async function fetchData() {
  // Übergabe der Werte aus den Refs
  if(userStore.user.hardware_eligibility){
  await store.fetchHardware(start_time.value, end_time.value);
  }else{
    messageStore.showLongAlert("You are currently unavailable to book hardware!\nFor help, ask an administrator or go to the settings page.", 'danger');
  }
}

// Update the computed property for hardware to include category filtering
const hardware = computed(() => {
  let filtered = store.filteredHardware;
  if(selectedValue.value == 'all'){
    return filtered;
  }
  if (selectedValue.value) {
    filtered = filtered.filter(hw => hw.category === selectedValue.value);
  }
  return filtered;
});

// Add a watch to update the hardware list when category changes
watch(selectedValue, async () => {
  await fetchData();
});

/**
 * Formats a given date into a localized string.
 * @param {string|Date|null} date - The date to format.
 * @returns {string} - The formatted date string or 'N/A' if the date is invalid.
 */
function formatDateTime(date) {
  if (!date) return 'N/A';
  const options = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  };
  return new Date(date).toLocaleString(undefined, options);
}

/**
 * Toggles the visibility of the sidebar.
 */
function toggleSidebar() {
  isSidebarVisible.value = !isSidebarVisible.value;
}

/**
 * Books the hardware with the given ID and refreshes the hardware list.
 * @param {string} hwId - The ID of the hardware to book.
 */
async function bookHardware(hwId) {
  console.log("Booking hardware with ID: ", hwId);
  await store.bookHardware(hwId);
  await store.fetchHardware(start_time.value, end_time.value);
}
</script>

<style scoped>
@import "@/style/frames.scss";

.table {
  margin-top: 2em;
  border-collapse: collapse;

  button {
    float: right;
  }

  td:last-child {
    text-align: right;
  }
}

.hardware-booking {
  display: flex;
  flex-direction: row;
}

.dropdown-menu {
  width: 250px;
  background-color: transparent !important;
  border: none;
}

.btn-search {
  background-color: #6610f2 !important;
  color: white !important;
}

.search-bar {
  position: relative;
  width: 100%;
  display: flex;
  padding: 0.5em;
  justify-content: space-between;
  background-color: #ebe5fc !important;
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

}
</style>
