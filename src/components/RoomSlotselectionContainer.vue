<template>
    <div class="slot-box" v-for="(day, index) in slots" :key="index">
        <div class="title-bar-slots"><span class="title-bar-slots-date"> {{ formatDateIfDifferent(day.date)
                }}</span>
            <div>select all<input class="form-check-input me-2" type="checkbox" @click="selectAll(index)"></div>
        </div>
        <div class="timeslots">
            <RoomBookingSlotButton v-for="(slot, index) in day.slots" :key="index" :slot="slot"
                :checked="getIfSelected(slot)" @update:checked="toggleSlot(slot)" />
        </div>
    </div>
</template>

<script setup>
import { computed, defineProps, onMounted, ref } from 'vue';
import { useRoomBookingStore } from '../store/roomBooking';
import RoomBookingSlotButton from './PlaceBookingSlotButton.vue';
import { useUserStore } from '../store/user';

const userStore = useUserStore();
const roomBookingStore = useRoomBookingStore();

const props = defineProps({
    index: Number,
});
onMounted(async () => {
    await userStore.fetchUser();
    roomBookingStore.getAvailableSlots(props.index);    
});

const slots = computed(() => roomBookingStore.availableSlotsForRoom);

/**
 * Determines if a slot is selected based on its booking type.
 * @param {Object} slot - The slot object to check.
 * @returns {boolean} - True if the slot is selected, false otherwise.
 */
function getIfSelected(slot) {
    //console.log("slot: ",slot)
    console.log("booking selected booking type",slot.booking_selected_booking_type);
   return slot.booking_selected_booking_type !== undefined;
}

/**
 * Toggles the selection state of a given slot.
 * @param {Object} slot - The slot object to toggle.
 */
function toggleSlot(slot) {
    roomBookingStore.toggleSlotsFromSelectedSlots([slot]);
}

/**
 * Selects or deselects all slots for a given day index.
 * @param {number} index - The index of the day whose slots should be toggled.
 */
function selectAll(index) {
    roomBookingStore.toggleSlotsFromSelectedSlots(slots.value[index].slots);
}

/**
 * Formats a date to display "Today", "Tomorrow", or a formatted date string.
 * @param {Date} date - The date to format.
 * @returns {string} - The formatted date string.
 */
function formatDateIfDifferent(date) {
    if (!date) return ''; // Return an empty string if no date is provided.

    const now = new Date(); // Get the current date.

    // Helper function to check if two dates fall on the same calendar day.
    const isSameDay = (a, b) =>
        a.getDate() === b.getDate() &&
        a.getMonth() === b.getMonth() &&
        a.getFullYear() === b.getFullYear();

    // Check if the date is today.
    if (isSameDay(date, now)) return 'Today';

    // Calculate tomorrow's date.
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1); // Adjust the date to tomorrow.

    // Check if the date is tomorrow.
    if (isSameDay(date, tomorrow)) return 'Tomorrow';

    // Format the date with the day and month, and add the year if it's not the current year.
    const options = { day: 'numeric', month: 'long', year: 'numeric' }; // Formatting options.
    const formattedDate = date.toLocaleDateString('en-US', options).replace(/,\s\d{4}$/, ''); // Remove the year for same-year dates.

    // Append the year only if the date is not in the current year.
    return date.getFullYear() === now.getFullYear() ? formattedDate : `${formattedDate} ${date.getFullYear()}`;
}

</script>

<style scoped>


.slot-box {
    .title-bar-slots {
        margin-bottom: 0.5rem;
        display: flex;
        justify-content: space-between;

        span {
            font-size: 1.25em;
        }

        input {
            margin-left: 0.5em;
        }
    }

    .timeslots {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 5px;
    }

    padding-top: 1em;
    padding-bottom: 5px;
    border-bottom: 1px solid #d2d1d1;

    &:last-child {
        border-bottom: none;
    }
}
</style>