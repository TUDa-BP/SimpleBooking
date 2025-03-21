<template>
  <!--wrapper for the overlay-->
  <div class="overlay">
    <div class="overlay-content">
      <!--optional close button for the overlay-->
      <button v-if="showCloseButton" class="fixed close-button classic-button" @click="$emit('closeOverlay')">
        <i class="bi bi-x h2" style="line-height: 1;"></i>
      </button>
      <!--slot for the content of the overlay-->
      <slot @close="$emit('closeOverlay')"></slot>
    </div>
    
  </div>
</template>

<script setup>
import { defineProps } from 'vue';

/**
 * Props for the Overlay component.
 * @typedef {Object} Props
 * @property {boolean} showCloseButton - Determines if the close button should be displayed.
 */
const props = defineProps({
  showCloseButton: {
    type: Boolean,
    default: false
  }
});

</script>

<style lang="scss" scoped>
@use "../../node_modules/bootstrap/scss/bootstrap" as *;
@use "../../node_modules/bootstrap-icons/font/bootstrap-icons" as *;

//styles for the overlay and the background
.overlay {
position: fixed;
top: 0;
left: 0;
width: 100%;
height: 100%;
background: rgba(0, 0, 0, 0.8);
backdrop-filter: blur(2px);
display: flex;
justify-content: center;
align-items: center;
z-index: 1000;
}

//styles for the overlay content
.overlay-content {
height: 80vh;
width: 90vw;
background: white;
overflow-y: scroll;
position: relative;
padding: 1rem;
border-radius: 26px;
}

//optional Close Button for the Overlay
.close-button {
	position: sticky;
	top: 0rem;
	right: 0rem;
  background-color: transparent !important;
	width: 2rem;
	height: 2rem;
  i{
    display: flex;
    justify-content: center;
    align-content: center;
  }
	&:hover {
    background-color: $indigo-200 !important;
    i {
      color: white;
    }
    border-radius: 10px;
    transform: scale(1.1);
	}
}
</style>