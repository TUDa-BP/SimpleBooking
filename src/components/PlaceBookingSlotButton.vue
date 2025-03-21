<template>
    <!-- Simple button with outline effect and black border, no default button styling -->
    <button v-if="slot.isBookableForYou" @click="handleClick" :class="['slot-selection-button', getClass(slot)]">
      <!-- Checkbox inside the button -->
      <input type="checkbox" class="form-check-input me-2" :checked="isChecked" />
      <!-- Dynamic Text inside the button -->
      <span>{{ getFormattedTimeInterval(slot.start_time, slot.end_time) }}</span>
    </button>
    <div v-else class="disabled">
      <span>{{ getFormattedTimeInterval(slot.start_time, slot.end_time) }}</span> <br>
      <span class="booked-by" v-if="showBookedBy && slot.booking">booked by {{ slot.booking.user.first_name }} {{ slot.booking.user.last_name }}</span>
    </div>
  </template>
  
  <script setup>
  import { ref, watch, defineProps, defineEmits } from 'vue';
  
  const props = defineProps({
    slot: {
      type: Object,
      required: true
    },
    checked: {
      type: Boolean,
      required: true
    },
    showBookedBy: {
      type: Boolean,
      required: true
    }
  });
  
  
  const emit = defineEmits(['update:checked']);
  const isChecked = ref(props.checked);
  
  watch(() => props.checked, (newValue) => {
    isChecked.value = newValue;
  });
  
  /**
   * Formats a time interval into a string.
   * @param {Date} from - The start time.
   * @param {Date} to - The end time.
   * @returns {string} The formatted time interval (e.g., "12:00 - 14:00").
   */
  function getFormattedTimeInterval(from, to) {
    const formatTime = time => time.toTimeString().slice(0, 5);
    return `${formatTime(from)} - ${formatTime(to)}`;
  }
  
  /**
   * Determines the CSS class for a slot based on its booking type.
   * @param {Object} slot - The slot object.
   * @returns {string} The CSS class for the slot.
   */
  function getClass(slot) {
    //If the user selected the slot then this is stored in the attribute booking_selected_booking_type
    if (slot.booking_selected_booking_type === "reserved") {
      return 'booking-type-reserved';
    } else if (slot.booking_selected_booking_type === "blocked") {
      return 'booking-type-blocked';
    } else if (slot.booking_selected_booking_type === "fix") {
      return 'booking-type-fix';
    } else if (slot.booking_selected_booking_type === "room") {
      return 'booking-type-room';
    }
    //Otherwise if the slot is not selected, we check if it is reserved, blocked or fix in the existing booking
    if (slot.booking !== undefined) {
      if (slot.booking.booking_type === 'reserved') {
        return 'booking-type-reserved';
      } else if (slot.booking.booking_type === 'blocked') {
        return 'booking-type-blocked';
      } else if (slot.booking.booking_type === 'fix') {
        return 'booking-type-fix';
      } else if (slot.booking_selected_booking_type === "room") {
      return 'booking-type-room';
      }
    }
    return '';
  }
  
  /**
   * Handles the click event on the button.
   * Toggles the checkbox state and emits the updated state.
   */
  const handleClick = () => {
    // Toggle the checkbox state when the button is clicked
    isChecked.value = !isChecked.value;
    // Emit the updated checked state to the parent component
    emit('update:checked', isChecked.value);
  };
  </script>
  
  <style scoped>
  .slot-selection-button {
    background-color: transparent !important;
    color: black !important;
    border: 1px solid #d2d1d1 !important;
    padding: 0.375rem 0.75rem;
    font-size: 16px;
    text-align: center;
    cursor: pointer;
    outline: none;
    border-radius: 8px;
  }
  
  /* Checkbox inside button styling */
  .slot-selection-button input[type="checkbox"] {
    margin-right: 10px;
    box-shadow: none !important;
    height: 16px;
    pointer-events: none;
  }
  
  /* Set the checkbox color when checked */
  .slot-selection-button input[type="checkbox"]:checked {
    background-color: #6610F2 !important;
    border-color: #6610F2 !important;
    color: white !important;
  }
  
  /* Set the text color when the checkbox is checked */
  .slot-selection-button input[type="checkbox"]:checked+span {
    color: #6610F2 !important;
  }
  
  .disabled {
    text-align: center;
    border: 1px solid #d2d1d1 !important;
    border-radius: 8px;
    color: #6c757d !important;
    border-color: #ff0000 !important;
    cursor: not-allowed;
    padding: 0.375rem 0.75rem;
  }
  
  /* Hover and focus effects */
  .slot-selection-button:hover {
    background-color: transparent !important;
    border-color: #6610F2 !important;
    color: #6610F2 !important;
  }
  
  .booking-type-reserved {
    border-color: #0d6efd !important;
  }
  
  .booking-type-blocked {
    border-color: #198754 !important;
  }
  
  .booking-type-room,
  .booking-type-fix {
    border-color: #ff0000 !important;
  }
  
  .booked-by {
    color: #6c757d;
    font-size: 0.8em;
  }
  </style>