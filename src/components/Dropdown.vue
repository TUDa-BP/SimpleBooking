<template>
  <div class="dropdown-container">
    <label v-if="label" :for="id" class="dropdown-label">{{ label }}</label>
    <select
      :id="id"
      v-model="selectedOption"
      class="dropdown"
      @change="emitChange"
    >
      <option value="all">All</option>
      <option v-for="option in options" :key="option" :value="option">
        {{ option }}
      </option>
    </select>
  </div>
</template>

<script>
export default {
  props: {
    /**
     * The label for the dropdown. If empty, no label is displayed.
     * @type {string}
     * @default ""
     */
    label: {
      type: String,
      default: "",
    },
    /**
     * The list of options to display in the dropdown.
     * @type {Array<string>}
     * @required
     */
    options: {
      type: Array,
      required: true, 
    },
    /**
     * A unique ID to identify the dropdown.
     * @type {string}
     * @required
     */
    id: {
      type: String,
      required: true,
    },
    /**
     * The currently selected value. Defaults to "all".
     * @type {string}
     * @default "all"
     */
    modelValue: {
      type: String,
      default: "all",
    },
  },
  data() {
    return {
      /**
       * Local copy of the modelValue for two-way binding.
       * @type {string}
       */
      selectedOption: this.modelValue, 
    };
  },
  watch: {
    /**
     * Watches for changes in the modelValue prop and updates the local selectedOption.
     * @param {string} newValue - The new value of modelValue.
     */
    modelValue(newValue) {
      this.selectedOption = newValue;
    },
  },
  methods: {
    /**
     * Emits an event to update the modelValue when the selection changes.
     */
    emitChange() {
      this.$emit("update:modelValue", this.selectedOption); 
    },
  },
};
</script>

<style scoped>
.dropdown-container {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  margin-top: 10px;
  margin-bottom: 10px;
}

.dropdown-label {
  font-size: 16px;
  font-weight: bold;
  padding-top: 5px;
  margin-right: 10px;
}

.dropdown {
  background-color: #8a4af3; /* Purple background */
  color: white !important;
  font-size: 16px;
  padding: 8px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  appearance: none;
}

.dropdown:invalid {
  color: rgba(255, 255, 255, 0.7) !important;
}

.dropdown option {
  color: rgb(255, 255, 255)!important;
}

/* Optional: Style for the placeholder in the expanded menu */
.dropdown option[value=""] {
  color: rgb(255, 255, 255)!important;
}
</style>
