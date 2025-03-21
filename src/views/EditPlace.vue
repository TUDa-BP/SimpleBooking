<template>
  <!--Header-->
  <h1 class="title">Edit Place</h1>

  <!--Form-->
  <form @submit.prevent="submitForm" class="mt-4">
    <div class="form-container">
      <!--Room dropdown selection and Place ID input-->
      <div class="form-group">
        <label for="room">Room:</label>
        <select class="form-select" id="room" v-model="place.room">
          <option value="" disabled>Select a room</option>
          <option v-for="room in roomStore.rooms" :key="room.$id" :value="room.$id" test-id="room-option">
            {{ room.room_number }}
          </option>
        </select>

        <label for="place_id">Place&nbsp;ID:</label>
        <input
          v-model.number="place.place_id"
          type="number"
          class="form-control"
          id="place_id"
          min="1"
          step="1"
          placeholder="e.g 200"
          @input="validatePlaceId"
        />
      </div>
            
      <!--Features container-->
      <FeatureContainer
        :title="'Features'"
        :features="featureStore.features"
        :modelValue="selectedFeatures"
        @update:modelValue="updateSelectedFeatures"
      />
            
      <!--Description textarea-->
      <h6>Description:</h6>
      <div data-mdb-input-init class="form-outline" style="padding-right: 0px;">
        <textarea id="description" v-model="place.description" class="box form-control description-textarea"></textarea>
      </div>
    </div>
        
    <!--Buttons at the bottom-->
    <footer class="button-group mt-3">
      <button type="submit" class="btn classic-button btn-primary flex-grow-1 me-2">Update Place</button>
      <button type="button" class="btn classic-button btn-secondary flex-grow-1" @click="closeOverlay">Cancel</button>
    </footer>
  </form>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { defineProps, defineEmits } from 'vue';
import { useRoomStore } from '@/store/room';
import { useFeatureStore } from '@/store/feature';
import { useMessageStore } from '@/store/messages';
import { usePlaceStore } from '@/store/place';
import FeatureContainer from '@/components/FeatureContainer.vue';

/**
 * Props
 * @property {Object} place - The place object to be edited.
 */
const props = defineProps({
  place: Object
});

/**
 * Emits for Event Handling
 * @event closeOverlay - Emitted to close the overlay.
 * @event updatePlace - Emitted to update the place details.
 */
const emit = defineEmits(['closeOverlay', 'updatePlace']);

// Stores
const roomStore = useRoomStore();
const featureStore = useFeatureStore();
const messageStore = useMessageStore();
const placeStore = usePlaceStore();

// Data
const selectedFeatures = ref([]);
let originalPlaceId = null;

/**
 * Initialize rooms and features on component mount.
 */
onMounted(async () => {
  await roomStore.fetchRooms();
  await featureStore.fetchFeatures();

  // Initialize selected features based on place.feature
  if (props.place && props.place.feature) {
    selectedFeatures.value = props.place.feature.map(feature => feature.$id);
  }

  // Store the original place_id
  if (props.place) {
    originalPlaceId = props.place.place_id;
  }
});

/**
 * Close the overlay.
 */
function closeOverlay() {
  emit('closeOverlay');
}

/**
 * Update selected features.
 * @param {Array} newSelectedFeatures - The new selected features.
 */
function updateSelectedFeatures(newSelectedFeatures) {
  selectedFeatures.value = newSelectedFeatures;
}

/**
 * Validate Place ID.
 */
async function validatePlaceId() {
  if (props.place.place_id < 0 || !Number.isInteger(props.place.place_id)) {
    props.place.place_id = '';
    messageStore.showAlert('Place ID must be a non-negative integer', 'danger');
  }
}

/**
 * Submit form to update place details.
 */
async function submitForm() {
  try {
    // Validate place ID only if it has been changed
    if (props.place.place_id !== originalPlaceId) {
      const exists = await placeStore.checkPlaceExists(props.place.room, props.place.place_id);
      if (exists) {
        messageStore.showAlert('Place ID already exists in the selected room', 'danger');
        return;
      }
    }

    // Update place with new features
    const updatedPlace = {
      ...props.place,
      feature: selectedFeatures.value.map(featureID => ({
        $id: featureID,
      })),
    };

    emit('updatePlace', updatedPlace);
    closeOverlay();
  } catch (error) {
    console.log(error);
    messageStore.showAlert(error.message, 'danger');
  }
}
</script>

<style lang="scss" scoped>
@import '../style/select.scss'; 

.room-select {
  width: 20%;
}

textarea{
  border-radius: 6px;
  height: 150px;
  box-sizing: border-box;
}

textarea:focus {
  box-shadow: 0 0 0 0.25rem #c29ffab7 !important;
}

.form-label {
  font-weight: bold;
}

.button-group {
    button {
        margin-right: 20px;
        width: 150px;
    }
}

.place-id-input {
  width: 20%;
  margin-left: 10px;
}

.form-group {
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-bottom: 15px;
  gap: 20px;
}
</style>