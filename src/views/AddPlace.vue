<template>
    <div>
        <h1>Add Place</h1>
        <form @submit.prevent="submitForm" class="mt-4">
            <div class="form-group">
                <label for="room">Room:</label>
                <select class="form-select" id="room" v-model="room">
                    <option value="" disabled >{{ roomStore.selectedRoom ? roomStore.selectedRoom.room_number : props.room_number }}</option>
                    <option v-for="roomOption in roomStore.rooms" :key="roomOption.$id" :value="roomOption.$id">
                        {{ roomOption.room_number }}
                    </option>
                </select>

            <label for="placeId">Place&nbsp;ID:</label>
            <input
              v-model="placeId"
              type="number"
              class="form-control"
              id="placeId"
              min="1"
              step="1"
              placeholder="e.g 200"
            />
                
            </div>

            <FeatureContainer
                :title="'Features'"
                :features="allFeatures"
                :modelValue="selectedFeatures"
                @update:modelValue="updateSelectedFeatures"
            />
            
            <h6>Description:</h6>
            <div data-mdb-input-init class="form-outline" style="padding-right: 0px;">
                <textarea v-model="description" class="form-control" id="textAreaExample2" rows="8" placeholder="Write a message"></textarea>
            </div>

            <div class="button-group">
                <button type="button" class="btn classic-button" @click="addPlace">Add Place</button>
                <button type="reset" class="btn classic-button" @click="closeOverlay">Cancel</button>
            </div>
        </form>
    </div>
</template>

<script setup>
import { ref, onMounted, defineProps, computed, watch } from 'vue';
import FeatureContainer from '@/components/FeatureContainer.vue';
import { useRoomStore } from '@/store/room';
import { useMessageStore } from '@/store/messages';
import { usePlaceStore } from '@/store/place';
import { useFeatureStore } from '@/store/feature';

/**
 * Props for the AddPlace component.
 * @typedef {Object} Props
 * @property {string} room_id - The ID of the room.
 * @property {Array} preloadedFeatures - Preloaded features for faster loading.
 */
 const props = defineProps({
    room_number: {
        type: String,
        default: 'Select Room',
    }
});

/**
 * Stores the value put in the PlaceID input field.
 * @type {ref<string>}
 */
const placeId = ref(''); 

// Watch for changes in placeId
watch(placeId, (newVal) => {
  console.log('PlaceId changed:', newVal);
});

/**
 * Store references.
 */
const roomStore = useRoomStore();
const messageStore = useMessageStore();
const placeStore = usePlaceStore();
const featureStore = useFeatureStore();

/**
 * Room selection.
* Initialize with the preselected room ID if provided.
 * @type {ref<string>}
 */
const room = ref('');

/**
 * Description of the place.
 * @type {ref<string>}
 */
const description = ref('');

const allFeatures = ref([]);
const selectedFeatures = ref([]);

/**
 * Lifecycle hook to fetch rooms and features.
 */
 onMounted(async () => {
    if(props.room_number !== 'Select Room'){
        room.value = roomStore.selectedRoom.$id
    }
    await roomStore.fetchRooms();
    await featureStore.fetchFeatures();
    allFeatures.value = featureStore.features;
});

/**
 * Updates the selected features.
 * @param {Array} newSelectedFeatures - The new selected features.
 */
const updateSelectedFeatures = (newSelectedFeatures) => {
    selectedFeatures.value = newSelectedFeatures;
};

/**
 * Adds the place to the database.
 * @returns {Promise<void>}
 */
const addPlace = async () => {
  if (!room.value) {
    messageStore.showAlert('Room must be selected', 'danger');
    return;
  }
  if (!placeId.value) {
    messageStore.showAlert('Place ID must be set', 'danger');
    return;
  }
  if(placeId.value <= 0){
    messageStore.showAlert('Place ID must be a positive number', 'danger');
    return;
  }
  const placeExists = await placeStore.checkPlaceExists(room.value, parseInt(placeId.value, 10));
  if (placeExists) {
    messageStore.showAlert('Place with this placeID already exists', 'danger');
    return;
  }
  await roomStore.updateNumPlacesByOne(room.value, roomStore.rooms.find(r => r.$id === room.value).num_places);
  await placeStore.addPlace(description.value, parseInt(placeId.value, 10), room.value, selectedFeatures.value);
  messageStore.showAlert('Place added successfully', 'success');
  
  // Clear all input fields
  room.value = '';
  placeId.value = '';
  description.value = '';
  selectedFeatures.value = [];

  // Emit the closeOverlay event to notify the parent
  emit('closeOverlay');
};

/**
 * Function to close the Overlay and return to Account management page.
 */
const emit = defineEmits(['closeOverlay']);
function closeOverlay() {
  emit('closeOverlay');
}
</script>


<style lang="scss" scoped>
/**
 * Styles for the button group (AddPlace and Cancel buttons).
 */
.button-group {
    margin-top: 1.5rem;
    button {
        margin-right: 20px;
        width: 150px;
    }
}

/** Styling for the select and input field for the placeID. */
.form-group {
    display: flex;
    flex-direction: row;
    align-items: center;
    margin-bottom: 15px;
    gap: 20px;
}

/** Styling for the textual description of the room. */
textarea {
    border-radius: 6px;
    height: 150px;
    box-sizing: border-box; 
}

textarea:focus {
    box-shadow: 0 0 0 0.25rem #c29ffab7 !important;
}

:deep(.form-select) {
    background-color: #7749F8;
    color: white;
    border-radius: 0.25rem;
    padding: 0.375rem 0.75rem;
    font-size: 1rem;
    background-clip: padding-box;
    box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.075);
    transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
    appearance: none;
    /** Remove the standard arrow down by a white arrow down for the select field. */
    background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='%23ffffff' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='m2 5 6 6 6-6'/%3e%3c/svg%3e");
    background-repeat: no-repeat;
    background-position: right 0.75rem center;
    background-size: 0.75em auto;
}
</style>
