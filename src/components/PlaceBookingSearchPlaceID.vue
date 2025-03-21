<template>
  <div class="place-booking-search-place-id">
    <input 
      value="Place ID" 
      type="button" 
      @click="toggleExpand" 
    />
    
    <transition name="expand">
      <input 
        v-if="isExpanded" 
        type="number" 
        v-model="placeID" 
        placeholder="Enter Place ID" 
        class="form-control expanding-input" 
      />
    </transition>
  </div>
</template>

<script setup>
import { ref, defineModel, watch } from 'vue';

const isExpanded = ref(false);
const placeID = defineModel();

/**
 * Toggles the expansion state of the input field.
 */
function toggleExpand() {
  isExpanded.value = !isExpanded.value;
}

</script>

<style>
.place-booking-search-place-id {
  display: flex;
  align-items: center;
  gap: 1em;
}

/* Input-Feld wächst nach rechts */
.expand-enter-active {
  animation: expandRight 0.2s ease-out;
}
.expand-leave-active {
  animation: shrinkLeft 0.2s ease-out;
}
input[type="button"] {
  padding: 0em !important;
  font-size: 0.9em;
}

@keyframes expandRight {
  from {
    width: 0;
    opacity: 0;
  }
  to {
    width: 150px;
    opacity: 1;
  }
}

@keyframes shrinkLeft {
  from {
    width: 150px;
    opacity: 1;
  }
  to {
    width: 0;
    opacity: 0;
  }
}

.expanding-input {
  width: 150px;
}
</style>
