<template>
    <!-- Simple button with outline effect and black border, no default button styling -->
    <button 
      class="feature-button" 
      :class="{ 'btn-lg': isLarge }" 
      @click.prevent="handleClick"
    >
      <!-- Checkbox inside the button -->
      <input 
        type="checkbox" 
        class="form-check-input me-2" 
        :checked="isChecked" 
        :disabled="disabled"
      />
      <!-- Dynamic Text inside the button -->
      <span>{{ text }}</span>
    </button>
</template>
  
<script>
export default {
    name: 'FeatureButton',
        props: {
      /**
       * Determines if the button should have a larger size.
       * @type {Boolean}
       * @default false
       */
      isLarge: {
        type: Boolean,
        default: false
      },
      /**
       * The text to display inside the button.
       * @type {String}
       * @required
       */
      text: {
        type: String,
        required: true
      },
      /**
       * The initial checked state of the checkbox.
       * @type {Boolean}
       * @default false
       */
      checked: {
        type: Boolean,
        default: false
      },
      /**
       * Determines if the button and checkbox are disabled.
       * @type {Boolean}
       * @default false
       */
      disabled: {
        type: Boolean,
        default: false
      }
    },
    /**
     * Component's internal data.
     * @returns {Object} The initial state of the component.
     */
    data() {
      return {
        /**
         * Tracks the current checked state of the checkbox.
         * @type {Boolean}
         */
        isChecked: this.checked
      };
    },
    watch: {
      /**
       * Updates the internal `isChecked` state when the `checked` prop changes.
       * @param {Boolean} newValue - The new value of the `checked` prop.
       */
      checked(newValue) {
        this.isChecked = newValue;
      }
    },
        methods: {
      /**
       * Handles the button click event.
       * Toggles the checkbox state and emits the updated state to the parent component.
       */
      handleClick() {
        if (this.disabled) {
          return; // Do nothing if the button is disabled
        }
  
        // Toggle the checkbox state when the button is clicked
        this.isChecked = !this.isChecked;
  
        // Emit the updated checked state to the parent component
        this.$emit('update:checked', this.isChecked);
      }
    }
};
</script>
  
<style scoped>
  .feature-button {
    background-color: transparent !important; /* Ensure transparent background */
    color: black !important; /* Default text color */
    border: 1px solid #d2d1d1 !important; /* Apply black border */
    padding: 0.375rem 0.75rem; /* Align with Bootstrap input padding */
    font-size: 16px; /* Set font size to 16px */
    font-family: 'Inter', sans-serif; /* Set font to Inter Regular */
    display: inline-flex;
    justify-content: center;
    align-items: center;
    cursor: pointer; /* Pointer cursor */
    outline: none; /* Remove default focus outline */
    border-radius: 8px; /* Apply rounded corners with 8px radius */
    height: 38px; /* Set height to match a Bootstrap search bar */
  }
  
  /* Checkbox inside button styling */
  .feature-button input[type="checkbox"] {
    margin-right: 10px; /* Add space between checkbox and text */
    box-shadow: none !important; /* Remove the shadow from the checkbox */
    height: 16px; /* Adjust height to match default input size */
    pointer-events: none; /* Ensure checkbox doesn't intercept clicks */
  }
  
  /* Set the checkbox color when checked */
  .feature-button input[type="checkbox"]:checked {
    background-color: #6610F2 !important; /* Set checkbox background color */
    border-color: #6610F2 !important; /* Set border color */
    color: white !important; /* Set text color */
  }
  
  /* Set the text color when the checkbox is checked */
  .feature-button input[type="checkbox"]:checked + span {
    color: #6610F2 !important;
  }
  
  /* Hover and focus effects */
  .feature-button:hover,
  .feature-button:focus {
    background-color: transparent !important;
    border-color: #6610F2 !important;
    color: #6610F2 !important; /* Set text color */
  }
  
  .feature-button.btn-lg {
    padding: 0.5rem 1.25rem;
    font-size: 1.25rem;
    height: 45px;
  }
</style>
