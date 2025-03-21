<template>
    <div class="slot-selection-container">
        <div class="slot-box" v-for="(day, index) in slots" :key="index">
            <div class="title-bar-slots"><span class="title-bar-slots-date"> {{ formatDateIfDifferent(day.date)
                    }}</span>
                <div>select all<input class="form-check-input me-2" type="checkbox" @click="selectAll(index)"></div>
            </div>
            <div class="timeslots">
                <PlaceBookingSlotButton v-for="(slot, index) in day.slots" :key="index" :slot="slot"
                    :checked="getIfSeledted(slot)" :showBookedBy="isAdminOrPhD" @update:checked="toggleSlot(slot)" />
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed, defineProps, onMounted } from 'vue';
import { usePlaceBookingStore } from '../store/placeBooking';
import PlaceBookingSlotButton from './PlaceBookingSlotButton.vue';
import { useUserStore } from '../store/user';

const userStore = useUserStore();
const placeBookingStore = usePlaceBookingStore();

const props = defineProps({
    place: Object,
});

/**
 * Lifecycle hook that runs when the component is mounted.
 * Fetches user data if not already available and retrieves available slots for the given place.
 */
onMounted(async () => {
    if (userStore.user == null) {
        await userStore.fetchUser();
    }

    placeBookingStore.getAvailableSlots(props.place);
});

/**
 * Computed property to determine if the user is an admin or a PhD student.
 * @returns {boolean} True if the user is an admin or a PhD student, false otherwise.
 */
const isAdminOrPhD = computed(() => userStore.isPhD || userStore.isAdmin);

/**
 * Computed property to retrieve available slots for the selected place.
 * @returns {Array} Array of available slots.
 */
const slots = computed(() => placeBookingStore.availableSlotsForPlace);

/**
 * Checks if a given slot is selected.
 * @param {Object} slot - The slot to check.
 * @returns {boolean} True if the slot is selected, false otherwise.
 */
function getIfSeledted(slot) {
   return slot.booking_selected_booking_type !== undefined;
}

/**
 * Toggles the selection state of a given slot.
 * @param {Object} slot - The slot to toggle.
 */
function toggleSlot(slot) {
    placeBookingStore.toggleSlotsFromSelectedSlots([slot]);
}

/**
 * Selects or deselects all slots for a given day.
 * @param {number} index - The index of the day in the slots array.
 */
function selectAll(index) {
    placeBookingStore.toggleSlotsFromSelectedSlots(slots.value[index].slots);
}

/**
 * Formats a given date into a human-readable string, indicating "Today" or "Tomorrow" if applicable.
 *
 * @param {Date} date - The date to format.
 * @returns {string} - A formatted date string. Returns "Today" if the date is today, "Tomorrow" if the date is tomorrow,
 *                     or a formatted date string (e.g., "January 1") if the date is within the current year,
 *                     and "January 1, 2023" if the date is in a different year.
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
.slot-selection-container {}

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