<template>
  <!-- A dropdown component for selecting dates -->
  <div class="dateDropdown">
    <span>{{ label }}</span>
    <VueDatePicker v-model="date" :min-date="mindate" :max-date="maxdate" :start-date="date" :enable-time-picker="false" prevent-min-max-navigation></VueDatePicker>
  </div>
</template>

<script setup>
import { defineProps, defineModel, ref, watch } from 'vue';
import VueDatePicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';

/**
 * Props accepted by the component.
 * @property {string} label - The label displayed next to the date picker.
 * @property {Date} initialDate - The initial date value for the date picker.
 */
const props = defineProps(['label', 'initialDate']);

/**
 * The model for the selected date.
 */
const dateModel = defineModel('date');

/**
 * Reactive reference for the selected date.
 * Initialized with the value of `initialDate` prop.
 */
const date = ref(props.initialDate);

/**
 * Minimum selectable date (current date).
 */
const mindate = ref(new Date());

/**
 * Maximum selectable date (one month from the current date).
 */
const maxdate = ref(new Date(new Date().setMonth(new Date().getMonth() + 1)));

/**
 * Watches for changes in the `date` value and updates the `dateModel`.
 * @param {Date} newDate - The new date selected by the user.
 */
watch(date, (newDate) => {
  dateModel.value = newDate;
});
</script>

<style>
.dateDropdown {
  margin: 0.5em;
  font-size: 0.9em;
  display: flex;
  align-items: center;
}

input {
  border: none;
  background-color: transparent;
}

input:focus {
  outline: none;
  /* Removes the outline */
  box-shadow: none;
  /* Removes the shadow effect */
}

span {
  margin-right: 0.8em;
}

/* Removes the calendar icon in the input field */
</style>
