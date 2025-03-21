<template>
    <button class="classic-button btn" @click="openOverlay">Book Room</button>
    <Overlay @closeOverlay="closeOverlay" :showCloseButton="mode !== 'loading'" v-if="overlayState"
        @close="overlayState = false">
        <div id="overlay-content" v-if="mode === 'select'">
            <h3>Book Room {{ room?.room_number }}</h3>
            <div class="room-description">
                <h5>Description: </h5>
                <!-- here are some sanity checks -->
                <i v-if="!room?.description">This room has no description</i>
                <p v-else v-html="room.description"></p>
                <p>Number of places in the room: {{ room?.num_places }}</p>
            </div>
            <h5>Select Slots:</h5>

            <RoomSlotselectionContainer :index="props.index"></RoomSlotselectionContainer>
            <footer class="overlay-buttongroup">
                <button id="book" style="margin-right:5px;" class="btn classic-button" @click="bookRoom">Book Room</button>
                <button class="btn classic-button" @click="closeOverlay">Cancel</button>
            </footer>
        </div>
        <div class="loading" v-if="mode === 'loading'">
            <div class="spinner-border" role="status">
                <span class="sr-only"></span>
            </div>
        </div>
        <div id="overlay-content" v-if="mode === 'overview'">
            <h3>Room booked successfully</h3>
            <p>You have successfully booked the room. You can now view your bookings in the booking overview.</p>
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
                            <span class="badge text-bg-primary">Booked</span>
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
                <button id="closeOverlay" class="btn classic-button" @click="closeOverlay">Close</button>
            </footer>
        </div>
    </Overlay>

</template>
<script setup>
import { ref, defineProps, computed, onMounted } from 'vue';
import { useRoomBookingStore } from '../store/roomBooking';
import { useRoomStore } from '@/store/room';
import { useUserStore } from '../store/user';
import { useMessageStore } from '../store/messages';

import Overlay from './Overlay.vue';
import RoomSlotselectionContainer from './RoomSlotselectionContainer.vue';

//The Container gets the index of the place to display
const props = defineProps({
    index: Number,
});

//If the user is not loaded yet, we fetch the user
onMounted(async () => {
    console.log
    if (userStore.user === undefined) {
        await userStore.fetchUser();
    }
});


// Here all the stores are defined
const roomBookingStore = useRoomBookingStore();
const roomStore = useRoomStore();
const messageStore = useMessageStore();
const userStore = useUserStore();
const overlayState = ref(false);
const mode = ref("select");

// Here are the computed values
const room = computed(() => roomStore.filteredRooms[props.index]);

// these are used to show the results
const bookedSlots = computed(() => roomBookingStore.bookedSlots);
const notBookedSlots = computed(() => roomBookingStore.notBookedSlots);

/**
 * Converts a date string into a human-readable format.
 * @param {string} date - The date string to format.
 * @returns {string} The formatted date string.
 */
function readAbleDate(date) {
    return new Date(date).toLocaleString();
}

/**
 * Asynchronously books a room and updates the application state accordingly.
 * @returns {Promise<void>} A promise that resolves when the booking process is complete.
 */
async function bookRoom() {
    try {
        mode.value = 'loading';
        await roomBookingStore.bookRoom(room.value);
        // since places are now booked, we need to fetch the places again
        await roomStore.fetchRooms();
        mode.value = 'overview';

    } catch (error) {
        mode.value = 'select';
        messageStore.showAlert(error.message, 'danger');
        return;
    }

}

/**
 * Opens the overlay and sets the mode to 'select'.
 */
function openOverlay() {
    mode.value = 'select';
    overlayState.value = true;
}

/**
 * Closes the overlay, resets the mode to 'select', and toggles slots from selected slots.
 */
function closeOverlay() {
    roomBookingStore.toggleSlotsFromSelectedSlots(roomBookingStore.selectedSlots)
    mode.value = 'select';
    overlayState.value = false;
}

</script>

<style scoped>
@use "../../node_modules/bootstrap/scss/bootstrap" as *;
@import "../style/frames.scss";


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