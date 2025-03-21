<template>
    <button class="btn classic-button" @click="openOverlay">Book Place</button>
    <Overlay @closeOverlay="closeOverlay" :showCloseButton="mode !== 'loading'" v-if="overlayState"
        @close="overlayState = false">
        <div id="overlay-content" v-if="mode === 'select'">
            <h3>Book Place {{ props.place.place_id }}</h3>
            <span v-for="feature in place.feature" :key="feature.$id" class="badge text-bg-primary">{{
                feature.feature_name }}</span>
            <div class="place-description">
                <i v-if="props.place.description == null">This place has no description</i>
                <p v-else v-html="props.place.description"></p>
            </div>
            <div class="room-description">
                <h5>Description of Room: {{ props.place.room.room_number }}</h5>
                <!-- here are some sanity checks -->
                <i v-if="!props.place.room || !props.place.room.description">This room has no description</i>
                <p v-else v-html="props.place.room.description"></p>
                <p>Number of places in the room: {{ props.place.room.num_places }}</p>
            </div>
            <h5>Select Slots:</h5>
            <div class="info-for-slots-box">
                <div class="contains-reserved-slots" v-if="containsReservedSlots">
                    <div class="blue-bar"></div>
                    <span>This place contains reserved bookings,
                        you are
                        allowed to overbook them</span>
                </div>
                <div class="booking-time" v-if="isStudent">
                    <TimeQuotaDisplay :timeQuota="user.time_quota - computeSelectedSlotsDuration">
                    </TimeQuotaDisplay>

                </div>
            </div>

            <SlotselectionContainer :place="props.place"></SlotselectionContainer>
            <footer class="overlay-buttongroup">
                <button class="btn classic-button" @click="bookPlace">Book Place</button>
                <button class="btn classic-button" @click="closeOverlay">Cancel</button>
            </footer>
        </div>
        <div class="loading" v-if="mode === 'loading'">
            <div class="spinner-border" role="status">
                <span class="sr-only"></span>
            </div>
        </div>
        <div id="overlay-content" v-if="mode === 'overview'">
            <h3>Place booked successfully</h3>
            <p>You have successfully booked the place. You can now view your bookings in the booking overview.</p>
            <h5>Accepted Slots</h5>

            <table class="table">
                <thead>
                    <tr>
                        <th scope="col">Start Time</th>
                        <th scope="col">End Time</th>
                        <th scope="col">Type</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(slot, index) in bookedSlots" :key="index">
                        <td>{{ readAbleDate(slot.start_time) }}</td>
                        <td>{{ readAbleDate(slot.end_time) }}</td>
                        <td>
                            <span v-if="slot.booking_type === 'reserved'" class="badge text-bg-warning">Reserved</span>
                            <span v-else class="badge text-bg-primary">Booked</span>
                        </td>
                    </tr>
                </tbody>
            </table>
            <div v-if="notBookedSlots.length > 0">
                <h5>Not Accepted Slots</h5>
                <table class="table">
                    <thead>
                        <tr>
                            <th scope="col">Start Time</th>
                            <th scope="col">End Time</th>
                            <th scope="col">Reason</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(slot, index) in notBookedSlots" :key="index">
                            <td>{{ readAbleDate(slot.start_time) }}</td>
                            <td>{{ readAbleDate(slot.end_time) }}</td>
                            <td>{{ slot.error }}</td>
                        </tr>
                    </tbody>
                </table>

            </div>
            <footer class="overlay-buttongroup">
                <button class="btn classic-button" @click="closeOverlay">Close</button>
            </footer>
        </div>
    </Overlay>

</template>
<script setup>
import { ref, defineProps, computed, onMounted } from 'vue';
import { usePlaceBookingStore } from '../store/placeBooking';
import { usePlaceStore } from '@/store/place';
import { useUserStore } from '../store/user';
import { useMessageStore } from '../store/messages';

import Overlay from './Overlay.vue';
import SlotselectionContainer from './SlotSelectionContainer.vue';
import TimeQuotaDisplay from './TimeQuotaDisplay.vue';

//The Container gets the index of the place to display
const props = defineProps({
    place: Object
});

//If the user is not loaded yet, we fetch the user
onMounted(async () => {
    if (userStore.user === undefined) {
        await userStore.fetchUser();
    }
});


// Here all the stores are defined
const placeBookingStore = usePlaceBookingStore();
const placeStore = usePlaceStore();
const messageStore = useMessageStore();
const userStore = useUserStore();
const overlayState = ref(false);
const mode = ref("select");


// these are used to show the results
const bookedSlots = computed(() => placeBookingStore.bookedSlots);
const notBookedSlots = computed(() => placeBookingStore.notBookedSlots);

// used to check if the user is a student, then the time quota is displayed
const user = computed(() => userStore.user);
const isStudent = computed(() => userStore.isStudent);
const computeSelectedSlotsDuration = computed(() => placeBookingStore.computeSelectedSlotsDuration);

// used to check if the available slots contain reserved slots, then a message is displayed
const containsReservedSlots = computed(() => placeBookingStore.availableSlotsContainsReservedSlots);

/**
 * Formats a date into a human-readable string.
 * @param {string|Date} date - The date to format.
 * @returns {string} The formatted date string.
 */
function readAbleDate(date) {
    return new Date(date).toLocaleString();
}

/**
 * Asynchronously books a place and updates the application state accordingly.
 * @returns {Promise<void>} A promise that resolves when the booking process is complete.
 */
async function bookPlace() {
    try {
        mode.value = 'loading';
        await placeBookingStore.bookPlace(props.place);
        // since places are now booked, we need to fetch the places again
        await placeStore.fetchPlaces();
        mode.value = 'overview';

    } catch (error) {
        mode.value = 'select';
        messageStore.showAlert(error.message, 'danger');
        return;
    }

}

/**
 * Opens the overlay and sets the mode to 'select'.
 * @returns {Promise<void>} A promise that resolves when the overlay is opened.
 */
async function openOverlay() {
    mode.value = 'select';
    overlayState.value = true;
}

/**
 * Closes the overlay, clears available slots for the place, and resets the mode to 'select'.
 */
function closeOverlay() {
    placeBookingStore.clearAvailableSlotsForPlace();
    mode.value = 'select';
    overlayState.value = false;
}

</script>
<style scoped>
@import "../style/frames.scss";
@import "../style/button.scss";
@use "../../node_modules/bootstrap/scss/bootstrap" as *;

#overlay-content {
    text-align: left !important;
}

.overlay-buttongroup {
    margin-top: 2em;
}

.room-description {
    margin-top: 1em;
    margin-bottom: 1em;
    border-radius: 1rem;
    border: 2px dashed #6610F2;
    padding: 1em;

}

.place-description {
    margin-top: 1em;
}

.loading {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
}



.info-for-slots-box {
    .booking-time {
        float: right;
    }

    display: flex;
    justify-content: space-between;

    .contains-reserved-slots {
        display: flex;
        align-items: center;

        .blue-bar {
            width: 5px;
            height: 30px;
            background-color: #0d6efd;
            margin-right: 10px;
        }
    }

}
</style>