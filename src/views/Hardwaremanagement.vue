<template>
  <!-- Sidebar -->
  <Sidebar :isSidebarVisible="isSidebarVisible" @toggleSidebar="toggleSidebar"/>

  <!-- Actual content for hardware management page -->
  <div :class="['content', { 'content-expanded': !isSidebarVisible }]">
    <header>
      <h1> Manage Hardware </h1>
    </header>

    <!-- Button to open the overlay for adding hardware -->
    <div class="buttons-top-right">
      <button class="overlay-button d-flex align-items-center" @click="openHardwareOverlay"> 
        <i class="bi bi-plus fs-3" style="line-height: 1;"></i>
        Add Hardware
      </button>
      <Overlay v-if="isHardwareOverlayOpen"> 
        <!-- AddHardware Component -->
        <AddHardware @closeOverlay="closeHardwareOverlay" />
      </Overlay>
    </div>

    <!--Searchbar for the table (searches for Name and Category)-->
    <div class="input-group rounded mt-4 mb-4 ">
      <span class="input-group-text" id="search-addon">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-search" viewBox="0 0 16 16">
          <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0"></path>
        </svg>
      </span>
      <input type="search" v-model="searchQuery" class="form-control search-input" placeholder="Search Name/Category" aria-label="Search" aria-describedby="search-addon" />
    </div>

    <!-- Table with all hardware entries -->
    <table class="table" v-if="filteredHardware.length > 0">
      <thead>
        <tr>
          <th>#</th>
          <th>Name</th>
          <th>[SN/CCN]
            <i class="bi bi-info-circle" title="SN = stock number &#10;CCN = cost center number" style="color: #595C5F;"></i>
          </th>
          <th>Category</th>
          <th>Storage Room</th>
          <th>Status</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(hardware, index) in filteredHardware" :key="hardware.id">
          <td>{{ index + 1 }}</td>
          <td>{{ hardware.name }}</td>
          <td> SN: {{ hardware.stockNumber }}<br>CCN: {{ hardware.costCenterNumber }}</td>
          <td>{{ hardware.category }}</td>
          <td>{{ hardware.roomNumber }}</td>
          <td>
            <!-- Displays the availability of the hardware and allows to change it -->
            <span :class="hardware.deactivated ? 'hardware-deactivated' : 'hardware-activated'" @click="toggleStatus(hardware)">
              {{ hardware.deactivated ? 'Deactivated' : 'Activated' }}
            </span>
          </td>
          <td>
            <!-- Buttons to edit and delete the specific hardware -->
            <div class="action-buttons">
              <button class="btn-edit classic-button" @click="editHardware(hardware)">
                <i class="bi bi-pencil-square"></i>
              </button>
              &nbsp;
              <button class="btn-delete classic-button" @click="deleteHardware(hardware.id)">
                <i class="bi bi-x-circle-fill"></i>
              </button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
    <!-- In case of an empty database, this message is on screen -->
    <div v-else>No hardware found!</div>

    <!-- Overlay for editing hardware -->
    <Overlay v-if="isEditOverlayOpen">
      <EditHardware :hardware="editHardwareForm" @closeOverlay="closeEditOverlay" @updateHardware="updateHardware" />
    </Overlay>
  </div>
</template>

<script setup>
import Sidebar from "@/components/Sidebar.vue";
import AddHardware from "@/views/AddHardware.vue";
import Overlay from "@/components/Overlay.vue";
import EditHardware from "@/views/EditHardware.vue";
import { functions } from '@/appwrite';
import { ref, computed, onMounted } from 'vue';
import { useMessageStore } from '@/store/messages';
import { useStorageLocationStore } from '@/store/storageLocation';
import { useHardwareStore } from '@/store/hardware';

// for the allert messages
const messageStore = useMessageStore();
const hardwareStore = useHardwareStore();
const storageLocationStore = useStorageLocationStore();

// Variables for the sidebar and overlays
const isSidebarVisible = ref(true);
const isHardwareOverlayOpen = ref(false);
const isEditOverlayOpen = ref(false);

// Form for editing hardware
const editHardwareForm = ref({
  id: null,
  hardware_name: '',
  stock_number: '',
  cost_center_number: '',
  max_booking_time: '',
  category: '',
  is_available: false,
  storage_id: '',
  room_number: '',
  shelf_slot: '',
});

// Search Query for the table
const searchQuery = ref(""); 

/**
 * @description Toggles the status of a hardware item (activated/deactivated).
 * @param {Object} hardware - The hardware object to toggle status for.
 */
const toggleStatus = async (hardware) => {
  try {
    await hardwareStore.toggleStatus(hardware);
    messageStore.showAlert('Updated successfully!', 'info');
  } catch (error) {
    console.log(error);
    messageStore.showLongAlert(error.message, 'danger');
  }
};

/**
 * @description Toggles the visibility of the sidebar.
 */
function toggleSidebar() {
  isSidebarVisible.value = !isSidebarVisible.value;
}

/**
 * @description Opens the overlay for adding hardware.
 */
function openHardwareOverlay() {
  isHardwareOverlayOpen.value = true;
}

/**
 * @description Closes the overlay for adding hardware and refreshes the hardware list.
 */
function closeHardwareOverlay() {
  isHardwareOverlayOpen.value = false;
  hardwareStore.fetchHardware();
}

/**
 * @description Opens the overlay for editing hardware and populates the form with hardware data.
 * @param {Object} hardware - The hardware object to edit.
 */
function openEditOverlay(hardware) {
  editHardwareForm.value = {
    id: hardware.id,
    hardware_name: hardware.name,
    stock_number: hardware.stockNumber,
    cost_center_number: hardware.costCenterNumber || '',
    max_booking_time: hardware.maxBookingTime || '',
    category: hardware.category,
    storage_id: hardware.storageID || '',
    room_number: hardware.roomNumber,
    shelf_slot: hardware.shelfSlot || '',
  };
  isEditOverlayOpen.value = true;
}

/**
 * @description Closes the overlay for editing hardware and refreshes the hardware list.
 */
function closeEditOverlay() {
  isEditOverlayOpen.value = false;
  hardwareStore.fetchHardware();
}

/**
 * @description Updates the hardware in the database.
 * @param {Object} updatedHardware - The updated hardware data.
 */
async function updateHardware(updatedHardware) {
  try {
    // Check if the storage location exists
    const storageLocationID = await storageLocationStore.fetchOrCreateStorageLocation(
      updatedHardware.storage_id,
      updatedHardware.room_number,
      updatedHardware.shelf_slot
    );

    // Update the hardware document
    const hardwareToUpdate = {
      hardware_name: updatedHardware.hardware_name,
      stock_number: parseInt(updatedHardware.stock_number, 10),
      cost_center_number: parseInt(updatedHardware.cost_center_number, 10),
      max_booking_time: parseInt(updatedHardware.max_booking_time, 10),
      category: updatedHardware.category,
      storageLocation: storageLocationID,
    };

    // Update the hardware document
    await hardwareStore.updateHardware(hardwareToUpdate, updatedHardware.id);
    
    // Show success message and close the overlay
    messageStore.showLongAlert("Hardware updated", 'info');
    closeEditOverlay();
    hardwareStore.fetchHardware();
  } catch (error) {
    console.log(error);
    messageStore.showLongAlert(error.message, 'danger');
  }
}

// function to open the edit overlay
const editHardware = (hardware) => {
  openEditOverlay(hardware);
};

const updateAfterCloudFunction = async (executionId) => {
  console.log(executionId);
  let execution;
    do {
        execution = await functions.getExecution(
          import.meta.env.VITE_CLOUDFUNCTION_HWMANAGEMENT_ID,
         executionId);
        console.log(`current status: ${execution.status}`);

        if (execution.status === "completed") {
            console.log("Cloud function completed!");
            hardwareStore.fetchHardware();
            break;
        }

        await new Promise(resolve => setTimeout(resolve, 1000));
    } while (execution.status !== "failed");

    if (execution.status === "failed") {
        console.error("Cloud function failed!");
    }

}

/**
 * @description Deletes a hardware item after confirmation.
 * @param {string} id - The ID of the hardware to delete.
 */
const deleteHardware = async (id) => {
  if (confirm("Are you sure you want to delete this Hardware?")) {
    try {
      let executionId = await hardwareStore.deleteHardware(id);
      messageStore.showLongAlert("Hardware and related bookings deleted", 'info');
      updateAfterCloudFunction(executionId)
    } catch (error) {
      console.log(error);
      messageStore.showLongAlert(error.message);
    }
  }
};

/**
 * @description Filters the hardware list based on the search query.
 * @returns {Array} The filtered hardware list.
 */
const filteredHardware = computed(() => {
  const query = searchQuery.value.toLowerCase();
  return hardwareStore.hardwareList.filter((hardware) => {
    return (
      hardware.name.toLowerCase().includes(query) ||
      hardware.category.toLowerCase().includes(query)
    );
  });
});

/**
 * @description Fetches the hardware list when the component is mounted.
 */
onMounted(() => { hardwareStore.fetchHardware(); });
</script>

<style lang="scss" scoped>
@use "../../node_modules/bootstrap/scss/bootstrap" as *;
@use "../../node_modules/bootstrap-icons/font/bootstrap-icons" as *;
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap");
@import "../style/frames.scss";
@import "../style/button.scss";
@import "../style/typography.scss";

// Status of the hardware
.hardware-activated {
  color: $green-500;
  font-weight: bold;
  cursor: pointer;
  &:hover {
    color: $green-300;
  }
}
.hardware-deactivated {
  color: $red-500;
  font-weight: bold;
  cursor: pointer;
  &:hover {
    color: $red-300;
  }
}
.input-group-text{
  margin-right: 0rem !important;
}
</style>