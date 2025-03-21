<template>
  <div>
    <!--Edit Hardware Form-->
    <h1>Edit Hardware</h1>
    <form @submit.prevent="submitForm" class="mt-4">
      <div class="form-container">
        <div class="form-left">
          <div class="form-group">
            <label for="hardware_name">Hardware Name:</label>
            <input type="text" class="form-control" id="hardware_name" v-model="hardware.hardware_name" required />
          </div>
          <div class="form-group">
            <label for="stock_number">Stock Number:</label>
            <input type="number" class="form-control" id="stock_number" v-model="hardware.stock_number" required min="0"/>
          </div>
          <div class="form-group">
            <label for="cost_center_number">Cost Center Number:</label>
            <input type="number" class="form-control" id="cost_center_number" v-model="hardware.cost_center_number" required min="0"/>
          </div>
          <div class="form-group">
            <label for="max_booking_time">Max Booking Time:</label>
            <input type="number" class="form-control" id="max_booking_time" v-model="hardware.max_booking_time" required min="0"/>
          </div>
          <div class="form-group">
            <label for="category">Category:</label>
            <select id="category" class="form-select" v-model="hardware.category" required>
              <option v-for="option in categoryOptions" :key="option" :value="option">
                {{ option }}
              </option>
            </select>
          </div>
          
        </div>
        <div class="form-right">
          <h3>Storage Location:</h3>
          <div class="form-group">
            <label for="storage_id">Storage ID:</label>
            <input type="number" class="form-control" id="storage_id" v-model.number="hardware.storage_id" required min="0"/>
          </div>
          <div class="form-group">
            <label for="room_number">Room Number:</label>
            <input type="text" class="form-control" id="room_number" v-model="hardware.room_number" required />
          </div>
          <div class="form-group">
            <label for="shelf_slot">Shelf Slot:</label>
            <input type="number" class="form-control" id="shelf_slot" v-model.number="hardware.shelf_slot" required min="0"/>
          </div>
        </div>
      </div>
      <footer class="button-group">
        <button type="submit" class="btn classic-button flex-grow-1 me-2">Update Hardware</button>
        <button type="button" class="btn classic-button flex-grow-1" @click="closeOverlay">Cancel</button>
      </footer>
    </form>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';

/**
 * Props for the component.
 * @typedef {Object} Props
 * @property {Object} hardware - The hardware object to be edited.
 */
const props = defineProps({
  hardware: Object
});

/**
 * Emits for event handling.
 * @typedef {Object} Emits
 * @property {Function} closeOverlay - Emit event to close the overlay.
 * @property {Function} updateHardware - Emit event to update the hardware.
 */
const emit = defineEmits(['closeOverlay', 'updateHardware']);

/**
 * Category options for the hardware.
 * @type {string[]}
 */
const categoryOptions = ['Laptops', 'AR/VR-Glasses', 'Measurement-Hardware', 'Others'];

/**
 * Close the overlay.
 */
function closeOverlay() {
  emit('closeOverlay');
}

/**
 * Submit the form to update hardware.
 */
function submitForm() {
  emit('updateHardware', props.hardware);
}
</script>

<style lang="scss" scoped>
@use "../../node_modules/bootstrap/scss/bootstrap" as *;
@import"../style/select.scss";

.form-container {
  display: flex;
  justify-content: space-between;
}

.form-left,
.form-right {
  width: 45%;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  margin-bottom: 3px;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 6px;
}

.button-group {
  margin-top: 1rem;
  .button {
    height: 2.5em;
    padding: 0 1rem;
  }
}
</style>
