<template>
    <table class="table">
        <thead>
            <tr>
                <th>#</th>
                <th>Room</th>
                <th>ID</th>
                <th>Features</th>
                <th>Utilization</th>
                <th></th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="(place, index) in props.places" :key="place.$id">
                <td>{{ index + 1 }}</td>
                <td>{{ place.room?.room_number || 'N/A' }}</td>
                <td>@{{ place.place_id }}</td>
                <td>
                    <span v-if="place.feature === undefined">N/A</span>
                    <span v-else v-for="feature of place.feature" :key="feature.$id" class="badge text-bg-primary">{{
                        feature.feature_name }}</span>
                </td>
                <td class="utilization">
                    <span>{{ place.utilization }}</span>
                    <img class="utilization-icon" v-if="place.utilization === 'low'" src="@/assets/low-utilization.svg"
                        alt="Low Utilization" />
                    <img class="utilization-icon" v-else-if="place.utilization === 'medium'"
                        src="@/assets/medium-utilization.svg" alt="Medium Utilization" />
                    <img class="utilization-icon" v-else src="@/assets/high-utilization.svg" alt="High Utilization" />
                </td>
                <td>
                    <PlaceBookingInformation :place="place"></PlaceBookingInformation>
                </td>
            </tr>
        </tbody>
    </table>
</template>

<script setup>
import { defineProps } from 'vue';
import PlaceBookingInformation from './PlaceBookingInformation.vue';

/**
 * Props for the PlaceBookingTable component.
 * @typedef {Object} Props
 * @property {Array} places - An array of place objects to display in the table.
 */
const props = defineProps({
    places: {
        type: Array,
        required: true
    }
});
</script>

<style scoped>
.table {
  margin-top: 1em;
  border-collapse: collapse;

  button {
    float: right;
  }

  td:last-child {
    text-align: right;
  }
  .utilization {
    img {
      width: 1.5em;
    }
  }
}

</style>