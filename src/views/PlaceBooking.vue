<template>
  <div class="place-booking">
    <Sidebar :isSidebarVisible="isSidebarVisible" @toggleSidebar="toggleSidebar" />
    <div :class="['content', { 'content-expanded': !isSidebarVisible }]">

      <div :class="`search-field ${isFeatureSearchVisible ? 'featuresearchmode' : ''}`">
        <!--Search button in Card header-->
        <div class="search-bar">
          <PlaceBookingSearchPlaceID v-model="filterPlaceID" />
          <CalendarPlacebooking v-model:date="start_time" :initialDate="start_time" label="From:" />
          <CalendarPlacebooking v-model:date="end_time" :initialDate="end_time" label="Until:" />
          <input type="button" value="Select Features" :class="`${isFeatureSearchVisible ? 'selectfeatures' : ''}`"
            @click="toggleFeatureSearch" />
          <button type="button" class="btn btn-primary search" value="select features" @click="search">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-search"
              viewBox="0 0 16 16">
              <path
                d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0">
              </path>
            </svg>
            Search
          </button>
        </div>
        <FeaturesSearchPlacebooking v-if="isFeatureSearchVisible" />
      </div>
      <!-- is shown if lastBookedPlaces are avaiable -->
      <div v-if="lastBookedPlaces.length > 0" class="last-booked-places">
        <div class="last-header">
          Last Booked Places
        </div>
        <div class="last-body">
          <PlaceBookingTable :places="lastBookedPlaces" />
        </div>
      </div>
      <!-- is shown if no places are avaiable -->
      <p v-if="filteredPlaces.length == 0" class="text-center">
        No places available for the selected time period or features or the given PlaceID
      </p>
      <!-- is shown if places are avaiable -->
      <PlaceBookingTable :places="filteredPlaces" v-else />

    </div>
  </div>

</template>

<script setup>
/**
 * Imports necessary Vue components and stores for the PlaceBooking view.
 */
import { ref, onMounted, computed } from 'vue';
import Sidebar from "@/components/Sidebar.vue";
import CalendarPlacebooking from "@/components/CalendarPlacebooking.vue";
import FeaturesSearchPlacebooking from "@/components/FeaturesSearchPlacebooking.vue";
import PlaceBookingTable from '@/components/PlaceBookingTable.vue';
import PlaceBookingSearchPlaceID from '@/components/PlaceBookingSearchPlaceID.vue';

import { usePlaceBookingStore } from '@/store/placeBooking';
import { usePlaceStore } from '@/store/place';
import { useMessageStore } from '@/store/messages';
import { useFeatureStore } from '@/store/feature';
import { useUserStore } from '@/store/user';

/**
 * Reactive references for start and end times of the booking.
 */
const start_time = ref(new Date());
const end_time = ref(new Date(new Date().setMonth(new Date().getMonth() + 1)));

/**
 * Stores used for managing place booking, places, messages, features, and user data.
 */
const placeBookingStore = usePlaceBookingStore();
const placeStore = usePlaceStore();
const messageStore = useMessageStore();
const featureStore = useFeatureStore();
const userStore = useUserStore();

/**
 * Lifecycle hook to fetch initial data when the component is mounted.
 */
onMounted(async () => {
  await placeStore.fetchPlaces();
  placeBookingStore.setDefaultDateTimeInterval();

  if (!userStore.user) {
    await userStore.fetchUser();
  }

  // Fetch last booked places for the current user.
  await placeStore.getLastBookedPlaces(userStore.user);
});

/**
 * Computed property to get filtered places based on the search criteria.
 */
const filteredPlaces = computed(() => placeStore.filteredPlaces);

/**
 * Reactive reference for filtering by PlaceID.
 */
const filterPlaceID = ref('');

/**
 * Computed property to get the last booked places.
 */
const lastBookedPlaces = computed(() => placeStore.lastBookedPlaces);

/**
 * Reactive references for sidebar and feature search visibility.
 */
const isSidebarVisible = ref(true);
const isFeatureSearchVisible = ref(false);

/**
 * Toggles the visibility of the feature search section.
 */
function toggleFeatureSearch() {
  isFeatureSearchVisible.value = !isFeatureSearchVisible.value;
}

/**
 * Toggles the visibility of the sidebar.
 */
function toggleSidebar() {
  isSidebarVisible.value = !isSidebarVisible.value;
}

/**
 * Executes the search functionality based on the selected filters.
 * Validates the date range and applies filters for features and PlaceID.
 * Displays an alert if the start date is greater than or equal to the end date.
 */
function search() {
  try {
    if (start_time.value >= end_time.value) {
      throw new Error('Start date should be less than end date');
    }

    // Set the start time to the beginning of the day and end time to the end of the day.
    start_time.value.setHours(0, 0, 0, 0);
    end_time.value.setHours(23, 59, 59, 999);

    placeBookingStore.setStartDate(start_time.value);
    placeBookingStore.setEndDate(end_time.value);

    let filterObject = {
      features: featureStore.checkedFeatures,
      duration: {
        start_time: start_time.value,
        end_time: end_time.value
      }
    };

    if (filterPlaceID.value != undefined && filterPlaceID.value != "") {
      console.log("PlaceID");
      console.log(filterPlaceID.value);
      filterObject.place_id = filterPlaceID.value;
    }

    placeStore.filterPlaces(filterObject);

  } catch (error) {
    messageStore.showAlert(error.message, 'warning');
  }
}
</script>

<style scoped>
@import "../style/frames.scss";

.place-booking {
  display: flex;
  flex-direction: row;
}

.text-center {
  margin-top: 2em;
}

.btn {
  background-color: #6610f2 !important;
  color: white !important;
}

.last-booked-places {
  margin-top: 1em;
  margin-bottom: 1em;
  border-radius: 1rem;
  border: 2px dashed #6610F2;
  padding: 1em;

}

.search-bar {
  position: relative;
  width: 100%;
  top: -1.5rem;
  display: flex;
  padding: 0.5em 0.5em 0.5em 1em;
  justify-content: space-between;
  background-color: #ebe5fc;
  border-radius: 2.5em;

  .search {
    border-radius: 2em;
    padding: 0.5em !important;
    &:active {
      color: #6c1ced !important;
    }
  }

  input[type="button"] {
    padding: 0em !important;
    font-size: 0.9em;
  }

}

.featuresearchmode {
  border-radius: 1.5em;
  border-top-left-radius: 0;
  border-top-right-radius: 0;
  border: solid 1px #dee2e6;
  border-top: none;
}

.search-field {
  margin-top: 4rem;
}

.selectfeatures {
  color: #6610f2;
}
</style>