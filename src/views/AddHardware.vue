<template>
    <div>
      <!--Add Hardware Form-->
      <h1>Add Hardware</h1>
      <form @submit.prevent="addHardware" class="mt-4">
        <div class="form-container">
          <!--Form fields for hardware details on the left side-->
          <div class="form-left">
            <div class="form-group">
              <label for="hardware_name">Hardware Name:</label>
              <input type="text" class="form-control" id="hardware_name" v-model="hardwareName" required />
            </div>
            <div class="form-group">
              <label for="stock_number">Stock Number:</label>
              <input type="number" class="form-control" id="stock_number" v-model="stockNumber" required min="0"/>
            </div>
            <div class="form-group">
              <label for="cost_center_number">Cost Center Number:</label>
              <input type="number" class="form-control" id="cost_center_number" v-model="costCenterNumber" required min="0"/>
            </div>
            <div class="form-group">
              <label for="max_booking_time">Max Booking Time:</label>
              <input type="number" class="form-control" id="max_booking_time" v-model="maxBookingTime" required min="0"/>
            </div>
            <div class="form-group">
              <label for="category">Category:</label>
              <select id="category" class="form-select" v-model="category" required>
                <option v-for="option in categoryOptions" :key="option" :value="option">
                  {{ option }}
                </option>
              </select>
            </div>
            
          </div>
        
          <!--Form fields for storage location and availability on the right side-->
          <div class="form-right">
            <h3>Storage Location:</h3>
            <div class="form-group">
              <label for="storage_id">Storage ID:</label>
              <input type="number" class="form-control" id="storage_id" v-model.number="storageID" required min="0"/>
            </div>
            <div class="form-group">
              <label for="room_number">Room Number:</label>
              <input type="text" class="form-control" id="room_number" v-model="roomNumber" required />
            </div>
            <div class="form-group">
              <label for="shelf_slot">Shelf Slot:</label>
              <input type="number" class="form-control" id="shelf_slot" v-model.number="shelfSlot" required min="0"/>
            </div>
          </div>
        </div>
        <footer class="button-group">
          <button type="submit" class="btn classic-button flex-grow-1 me-2">Add Hardware</button>
           <button type="button" class="btn classic-button flex-grow-1" @click="closeOverlay">Cancel</button>
        </footer>
        
      </form>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  import { useMessageStore } from '@/store/messages';
  import { useStorageLocationStore } from '@/store/storageLocation';
  import { useHardwareStore } from '@/store/hardware';
  
  // for the allert messages
  const messageStore = useMessageStore();
  const storageLocationStore = useStorageLocationStore();
  const hardwareStore = useHardwareStore();
  
  // Form fields
  const hardwareName = ref('');
  const stockNumber = ref('');
  const costCenterNumber = ref('');
  const maxBookingTime = ref('');
  const category = ref('');
  const storageID = ref('');
  const roomNumber = ref('');
  const shelfSlot = ref('');
  
  // Category Options
  const categoryOptions = ['Laptops', 'AR/VR-Glasses', 'Measurement-Hardware', 'Others'];
  
  /**
   * Function to reset the form fields
   */
  const resetForm = () => {
    hardwareName.value = '';
    stockNumber.value = '';
    costCenterNumber.value = '';
    maxBookingTime.value = '';
    category.value = '';
    storageID.value = '';
    roomNumber.value = '';
    shelfSlot.value = '';
  };
  
  /**
   * Function to add hardware to the database
   * @returns {Promise<void>}
   */
  const addHardware = async () => {
    console.log('addHardware function called');
    try {
      const storageLocationID = await storageLocationStore.fetchOrCreateStorageLocation(
        storageID.value,
        roomNumber.value,
        shelfSlot.value
      );
  
      // Create the new hardware document
      const newHardware = {
        hardware_name: hardwareName.value,
        stock_number: stockNumber.value,
        cost_center_number: costCenterNumber.value,
        max_booking_time: maxBookingTime.value,
        category: category.value,
        storageLocation: storageLocationID,
      };
  
      // Use the hardware store to add the new hardware document
      await hardwareStore.addHardware(newHardware);
  
      // Show success message and reset the form
      console.log('Hardware added successfully');
      messageStore.showLongAlert('Hardware added successfully', 'success');
      resetForm();
    } catch (error) {
      console.log('Error adding hardware:', error.message);
      messageStore.showLongAlert(error.message, 'danger');
    }
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
  @use "../../node_modules/bootstrap/scss/bootstrap" as *;
  @import "../style/select.scss";
  
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