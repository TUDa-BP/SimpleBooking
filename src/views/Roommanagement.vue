<template>
  <div class="roommanagement">
    <!-- Sidebar -->
    <Sidebar :isSidebarVisible="isSidebarVisible" @toggleSidebar="toggleSidebar"/>

    <!--Actual content for roommanagement page-->
    <div :class="['content', { 'content-expanded': !isSidebarVisible }]">
      <header>
        <h1> Manage Rooms </h1>
      </header>

      <!-- Buttons to add a new room and place -->
      <div class="buttons-top-right">
        <button id="add-room-button" class="overlay-button d-flex align-items-center" @click="openRoomOverlay"> 
          <i class="bi bi-plus fs-3" style="line-height: 1;"></i>
          Add Room
        </button>
        <Overlay v-if="isRoomOverlayOpen" >
          <!--Create new Room-->
          <AddRoom @closeOverlay="closeRoomOverlay" ref="addRoomOverlay"/>
        </Overlay>

        <button id="add-place-button" class="overlay-button d-flex align-items-center" @click="openPlaceOverlay"> 
          <i class="bi bi-plus fs-3" style="line-height: 1;"></i>
          Add Place
        </button>
        <Overlay v-if="isPlaceOverlayOpen" >
          <!--Create new Place-->
          <AddPlace @closeOverlay="() => { closePlaceOverlay(); fetchPlaces(); }" :room_number="!selectedRoom?.room_number? 'Select Room':selectedRoom.room_number" ref="addPlaceOverlay"/>
        </Overlay>
      </div>

      <div class="dropdown mb-4 d-flex align-items-center mt-4">
        <select class="form-select" v-model="selectedRoomId" @change="fetchPlaces">
          <option value="" disabled>Select Room</option>

          <!-- Display "No room available..." if no rooms are available -->
          <option v-if="rooms.length === 0" disabled>No room available...</option>

          <!-- Rooms from the database -->
          <option v-for="room in rooms" :key="room.$id" :value="room.$id">
            {{ "Room " + room.room_number }}
          </option>
        </select>
      </div>
      
      <!--Description textarea-->
      <div v-if="selectedRoom" class="mt-3">
        <div class="d-flex justify-content-between align-items-center mb-1">
          <label for="description" class="form-label">Description:</label>
          <!-- Button to edit the description -->
          <button class="btn-edit-text classic-button" @click="toggleEditDescription">
            {{ isEditingDescription ? 'Save' : 'Edit' }}
          </button>
        </div>
        <textarea id="description" v-model="selectedRoom.description" class="box mt-1 mb-4 form-control description-textarea" :disabled="!isEditingDescription"></textarea>
      </div>

      <!-- Buttons to activate/deactivate and delete the selected room -->
      <div class="button-group mb-4" v-if="selectedRoomId">
        <button id="toggle-room-button" class="toggle-room-button btn classic-button" :class="selectedRoomDeactivated ? 'btn-activate' : 'btn-disable'" @click="toggleRoomStatus">
            <i :class="selectedRoomDeactivated ? 'bi bi-check-circle' : 'bi bi-x-circle'"></i>
            {{ selectedRoomDeactivated ? 'Activate Room' : 'Disable Room' }}
        </button>
        <button id="delete-room-button" class="delete-room-button btn classic-button" @click="deleteRoom">
          Delete Room
        </button>
      </div>

      <!-- Table to display the places -->
      <table id="places-table" class="table" v-if="places && places.length > 0">
        <thead>
          <tr>
            <th>#</th>
            <th>Place ID</th>
            <th>Features</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(place,index) in places" :key="place.$id">
            <td>{{ index + 1 }}</td>
            <td>{{ place.place_id }}</td>
            <td>
              <!-- List features by name -->
              <ul>
                <li v-for="feature in place.feature" :key="feature.$id">{{ feature.feature_name }}</li>
              </ul>
            </td>
            <td>
              <span :class="place.deactivated ? 'status-disabled' : 'status-active'" @click="togglePlaceStatus(place)">
                {{ place.deactivated ? 'Disabled' : 'Active' }}
              </span>
            </td>
            <td>
              <!--Buttons to edit and delete the specific places-->
              <div class="action-buttons">
                <button class="btn-edit classic-button" @click="editPlace(place)">
                  <i class="bi bi-pencil-square"></i>
                </button>
                &nbsp;
                <button class="btn-delete classic-button" @click="deletePlace(place.$id)">
                  <i class="bi bi-x-circle-fill"></i>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- No places found -->
      <p v-else class="mt-3">No places found...</p>

      <!-- Overlay for editing a place -->
      <Overlay v-if="isEditOverlayOpen">
        <EditPlace :place="editPlaceForm" @closeOverlay="closeEditOverlay" @updatePlace="updatePlace" />
      </Overlay>
    </div>
  </div>
</template>

<script setup>
import Sidebar from "@/components/Sidebar.vue";
import AddRoom from "./AddRoom.vue";
import AddPlace from "./AddPlace.vue";
import EditPlace from "@/views/EditPlace.vue";
import { ref, computed, onMounted } from 'vue';
import Overlay from "@/components/Overlay.vue";
import { useRoomStore } from '@/store/room';
import { useMessageStore } from '@/store/messages';
import { usePlaceStore } from '@/store/place';
import { useFeatureStore } from '@/store/feature';

/**
 * Initializes stores for managing rooms, places, and messages.
 */
const messageStore = useMessageStore();
const roomStore = useRoomStore();
const placeStore = usePlaceStore();
const featureStore = useFeatureStore();

/**
 * Reactive variables and computed properties for managing UI state.
 */
const isSidebarVisible = ref(true);
const isEditOverlayOpen = ref(false);
const rooms = ref([]);
const selectedRoomId = ref('');
const selectedRoom = computed(() => roomStore.selectedRoom);
const selectedRoomDeactivated = ref(false);
const isEditingDescription = ref(false);
const places = ref([]);
const editPlaceForm = ref({
  place_id: '',
  feature: [],
  deactivated: false,
  description: '',
  room: ''
});

/**
 * Preloaded features for the AddPlace overlay.
 * @type {ref<Array>}
 */
const preloadedFeatures = ref([]);

/**
 * Opens the overlay for editing a place.
 * @param {Object} place - The place object to edit.
 */
const editPlace = (place) => {
  openEditOverlay(place);
};

/**
 * Reactive variables for managing overlays.
 */
const isRoomOverlayOpen = ref(false);
const isPlaceOverlayOpen = ref(false);

/**
 * Opens the overlay for adding a new room.
 */
function openRoomOverlay() {
  isRoomOverlayOpen.value = true;
}

/**
 * Closes the overlay for adding a new room.
 */
function closeRoomOverlay() {
  isRoomOverlayOpen.value = false;
}

/**
 * Opens the overlay for adding a new place.
 */
function openPlaceOverlay() {
  isPlaceOverlayOpen.value = true;
}

/**
 * Closes the overlay for adding a new place.
 */
function closePlaceOverlay() {
  isPlaceOverlayOpen.value = false;
}

/**
 * Toggles the visibility of the sidebar.
 */
function toggleSidebar() {
  isSidebarVisible.value = !isSidebarVisible.value;
}

/**
 * Toggles the edit mode for the room description.
 * Saves the description when toggling off edit mode.
 */
function toggleEditDescription() {
  isEditingDescription.value = !isEditingDescription.value;
  if (!isEditingDescription.value) {
    try {
      roomStore.updateRoomDescription(selectedRoomId.value, selectedRoom.value.description);
      messageStore.showAlert('Description updated successfully!', 'success');
    } catch (error) {
      console.log(error);
      messageStore.showLongAlert(error.message, 'danger');
    }
  }
}

/**
 * Opens the overlay for editing a place.
 * @param {Object} place - The place object to edit.
 */
function openEditOverlay(place) {
  editPlaceForm.value = { ...place };
  isEditOverlayOpen.value = true;
  editPlaceForm.value.room = selectedRoomId.value;
}

/**
 * Closes the overlay for editing a place.
 */
function closeEditOverlay() {
  isEditOverlayOpen.value = false;
}

/**
 * Updates the place with the provided data.
 * @param {Object} updatedPlace - The updated place object.
 */
async function updatePlace(updatedPlace) {
  try {
    await placeStore.updatePlace(updatedPlace);
    messageStore.showAlert('Place updated successfully!', 'success');
    closeEditOverlay();
    fetchPlaces();
  } catch (error) {
    console.log(error);
    messageStore.showLongAlert(error.message, 'danger');
  }
}

/**
 * Fetches places for the selected room.
 */
const fetchPlaces = async () => {
  if (!selectedRoomId.value) return;

  try {
    const room = await roomStore.fetchSingleRoom(selectedRoomId.value);
    roomStore.setSelectedRoom(room);
    const response = await placeStore.fetchPlacesInRoom(selectedRoomId.value);
    places.value = response;
    selectedRoomDeactivated.value = room.deactivated;
  } catch (error) {
    console.log(error);
    messageStore.showLongAlert(error.message, 'danger');
  }
};

/**
 * Deletes the selected room and all related places.
 */
const deleteRoom = async () => {
  if (!selectedRoomId.value) return;

  const confirmed = confirm("Are you sure you want to delete this room and all related places? This process cannot be undone.");
  if (!confirmed) return;

  try {
    await roomStore.deleteRoom(selectedRoomId.value);
    messageStore.showAlert("Room and related places deleted successfully!", 'success');
    setTimeout(() => {
      window.location.reload();
    }, 2500);
  } catch (error) {
    console.log(error);
    messageStore.showLongAlert(error.message, 'danger');
  }
};

/**
 * Toggles the activation status of the selected room and its related places.
 */
const toggleRoomStatus = async () => {
  if (!selectedRoomId.value) return;

  try {
    await roomStore.toggleStatus(selectedRoomId.value, places.value);
    messageStore.showAlert(`Room ${!selectedRoomDeactivated.value ? 'disabled' : 'enabled'} successfully!`, 'success');

    // Refresh the rooms and places
    await roomStore.fetchRooms();
    await fetchPlaces();
  } catch (error) {
    console.log(error);
    messageStore.showLongAlert(error.message, 'danger');
  }
};

/**
 * Toggles the activation status of a specific place.
 * @param {Object} place - The place object to toggle.
 */
const togglePlaceStatus = async (place) => {
  try {
    await placeStore.toggleStatus(place);
    const newStatus = !place.deactivated;
    messageStore.showAlert(`Place ${!newStatus ? 'disabled' : 'enabled'} successfully!`, 'success');
    await placeStore.fetchPlaces();
  } catch (error) {
    console.log(error);
    messageStore.showLongAlert(error.message, 'danger');
  }
};

/**
 * Deletes a specific place by its ID.
 * @param {string} placeID - The ID of the place to delete.
 */
const deletePlace = async (placeID) => {
  const confirmed = confirm("Are you sure you want to delete this place? This process cannot be undone.");
  if (!confirmed) return;

  try {
    await placeStore.deletePlace(placeID);
    messageStore.showAlert("Place deleted successfully!", 'success');
    places.value = places.value.filter(place => place.$id !== placeID);

    // Decrement the number of places in the room
    await roomStore.decrementNumPlacesByOne(selectedRoomId.value, selectedRoom.value.num_places);
  } catch (error) {
    console.log(error);
    messageStore.showLongAlert(error.message, 'danger');
  }
};

/**
 * Lifecycle hook to fetch rooms and initialize state on component mount.
 */
onMounted(async () => {
  roomStore.setSelectedRoom(null);
  await roomStore.fetchRooms();
  rooms.value = roomStore.rooms; 
});
</script>

<style lang="scss" scoped>
@use "../../node_modules/bootstrap/scss/bootstrap" as *;
@use "../../node_modules/bootstrap-icons/font/bootstrap-icons" as *;
@import '../style/frames.scss';
@import '../style/button.scss';
@import '../style/typography.scss';
@import '../style/status.scss';

.roommanagement {
  display: flex;
  flex-direction: row;
  height: 100vh;
}

.form-label {
  font-weight: bold;
}

.box{
  border-color: #7749f8;
  border-width: 2px;
  border-radius: 6px;
  padding: 10px 20px;
  height: 100px;
  margin: 10px 0; 
}

textarea:focus {
  box-shadow: 0 0 0 0.25rem #c29ffab7 !important;
}

.btn-disable{
  background-color: $red-100  !important;
  color: $red-500  !important;
  &:hover {
    background-color: $red-200  !important;
    color: $red-600  !important;
    cursor: pointer !important;
  }
}

.btn-activate{
  background-color: $green-100  !important;
  color: $green-500  !important;
  &:hover {
    background-color: $green-200  !important;
    color: $green-600  !important;
    cursor: pointer !important;
  }
}

.button-group {
  display: flex;
  gap: 10px;
}

.btn-edit-text {
  background: none !important;
  padding: 0;
  font-weight: bold;
  &:hover {
    background: none !important;
  }
}

.btn-edit-text {
  background: none !important;
  padding: 0;
  font-weight: bold;
  &:hover {
    background: none !important;
  }
}
</style>