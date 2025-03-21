<template>
  <div>
    <h1 class="title">Add Room</h1>

    <form @submit.prevent="validateAndSubmitForm" class="mt-4">
      <div class="form-wrapper">
        <div class="form-row">
          <div class="form-group">
            <label for="capacity">Capacity:</label>
            <input
              v-model="capacity"
              type="number"
              class="form-control"
              id="capacity"
              min="1"
              step="1"
              placeholder="e.g 200"
            />
          </div>
          <div class="form-group">
            <label for="buildingName">TU-Building:</label>
            <input
              v-model="buildingName"
              type="text"
              class="form-control"
              id="buildingName"
              placeholder="e.g S107"
            />
          </div>
          <div class="form-group">
            <label for="roomNumber">TU-Room-Number:</label>
            <input
              v-model.number="roomNumber"
              type="text"
              class="form-control"
              id="roomNumber"
              placeholder="e.g 212"
            />
          </div>
        </div>

        <h6 class="mt-3">Description:</h6>
        <div class="textarea-container">
          <textarea
            v-model="description"
            class="form-control"
            id="textAreaExample2"
            rows="8"
            placeholder="Write a message"
          ></textarea>
        </div>
      </div>
      <div class="button-group">
        <button type="submit" class="btn classic-button">Add Room</button>
        <button type="button" class="btn classic-button" @click="closeOverlay">Cancel</button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRoomStore } from "@/store/room";
import { useMessageStore } from "@/store/messages";

/**
 * State for form fields
 * @type {ref<number|null>}
 */
const capacity = ref(null);

/**
 * State for building name
 * @type {ref<string>}
 */
const buildingName = ref("");

/**
 * State for room number
 * @type {ref<number|null>}
 */
const roomNumber = ref(null);

/**
 * State for description
 * @type {ref<string>}
 */
const description = ref("");

/**
 * Message store instance
 * @type {ReturnType<typeof useMessageStore>}
 */
const messageStore = useMessageStore();

/**
 * Validates the form and submits it if valid.
 * @returns {Promise<void>}
 */
const validateAndSubmitForm = async () => {
  const trimmedBuildingName = buildingName.value.trim();

  // Validate Capacity, TU-Building and TU-Room-Number are not empty
  if(capacity.value === null && !trimmedBuildingName && roomNumber.value === null) {
    messageStore.showAlert( "Please enter: Capacity, TU-Building and TU-Room-Number","danger");
    return;
  }

  // Validate Capacity is not null and is a positive integer
  if (capacity.value === null || capacity.value < 0) {
    messageStore.showAlert( "Please enter a positive integer for Capacity","danger");
    return;
  }

  // Validate TU-Building and TU-Room-Number are not empty
  if (!trimmedBuildingName && roomNumber.value == null) {
    messageStore.showAlert( "Please enter: TU-Building and TU-Room-Number","danger");
    return;
  }

  // Validate TU-Building and Capacity are not empty
  if (!trimmedBuildingName && capacity.value == null) {
    messageStore.showAlert( "Please enter: TU-Building and Capacity","danger");
    return;
  }

  // Validate TU-Building is not empty
  if (!trimmedBuildingName) {
    messageStore.showAlert("Please enter TU-Building.","danger");
    return;
  }

  // Validate TU-Room-Number is not empty and room number is a positive integer
  if (roomNumber.value === null || roomNumber.value < 0) {
    messageStore.showAlert("Please enter a positive integer for TU-Room-Number.","danger");
    return;
  }
  // Check if the room already exists in the database
  await useRoomStore().fetchRooms(); // Updated store usage
  const existingRoomNumbers = useRoomStore().rooms.map(room => room.room_number); // Updated store usage
  const roomIdentifier = `${trimmedBuildingName}|${roomNumber.value}`;
  if (existingRoomNumbers.includes(roomIdentifier)) {
    messageStore.showAlert("Room with this number already exists.","danger");
    return;
  }

  // If all validations pass
  console.log("Form submitted:", {
    capacity: capacity.value,
    buildingName: trimmedBuildingName,
    roomNumber: roomNumber.value,
    description: description.value,
  });

  try {
    // Call the store method to add the room
    await useRoomStore().addRoom({
      num_places: parseInt(capacity.value, 10),
      room_number: `${trimmedBuildingName}|${roomNumber.value}`,
      description: description.value,
      deactivated: false,
    });

    // Reset the form after successful addition
    resetForm();
    messageStore.showAlert( "Room successfully added!", "success");
  } catch (error) {
    if (error.message && error.message.includes("Document with the requested ID already exists")) {
      messageStore.showAlert( "Room is already added.","danger");
    } else {
      messageStore.showAlert("An error occurred while adding the room.","danger");
    }
    console.error(error);
  }
};

/**
 * Resets the form fields to their initial state.
 */
const resetForm = () => {
  capacity.value = null;
  buildingName.value = "";
  roomNumber.value = null;
  description.value = "";
};

/**
 * Emits the 'closeOverlay' event to close the overlay and return to the Account Management page.
 */
const emit = defineEmits(['closeOverlay']);
function closeOverlay() {
  emit('closeOverlay');
}
</script>

<style scoped>
/* Form Wrapper */
.form-wrapper {
  display: flex;
  flex-direction: column;
}

/* Input Row Styling */
.form-row {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  gap: 15px;
}

.form-group {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 10px;
}

label {
  white-space: nowrap;
  font-size: 1.1rem;
}

input {
  flex: 1;
  padding: 5px;
}
textarea {
  height: 200px;
}

.textarea-container {
  margin-top: 5px;
}

textarea:focus {
  box-shadow: 0 0 0 0.25rem #c29ffab7 !important;
}

/* Button Group Styling */
.button-group {
  margin-top: 1.5rem;
}

button {
  margin-right: 20px;
  width: 150px;
}

</style>
