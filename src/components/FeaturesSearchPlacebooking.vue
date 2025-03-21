<template>
  <div class="features-search-placebooking">
    <div class="card-body">
      <h5 class="card-title">Features</h5>
      <div class="input-group">
        <span class="input-group-text" id="basic-addon1">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-search"
            viewBox="0 0 16 16" >
            <path
              d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0">
            </path>
          </svg>
        </span>
        <input type="text" class="form-control" placeholder="Feature" aria-label="Input group example"
          aria-describedby="basic-addon1" @input="filterFeatures($event.target.value)">
      </div>
      <!--Feature List-->
      <div class="feature-list">
        <FeatureButton @update:checked="toggleCheck(feature.feature_name)" v-for="(feature, index) in filteredFeatures" :key="index" :text=feature.feature_name></FeatureButton>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted, computed } from 'vue';
import FeatureButton from './FeatureButton.vue';
import { useFeatureStore } from '@/store/feature';

// Use the featureStore to fetch features
const featureStore = useFeatureStore();

const features = computed(() => featureStore.features);
const filteredFeatures = ref([]);

// Fetch features when the component is mounted
onMounted(async () => {
  await featureStore.fetchFeatures();
  filteredFeatures.value = features.value;
});

/**
 * Filters the features based on the search query.
 * @param {string} query - The search query to filter features.
 */
function filterFeatures(query) {
  filteredFeatures.value = features.value.filter((feature) => {
    return feature.feature_name.toLowerCase().includes(query.toLowerCase());
  });
}

/**
 * Toggles the checked state of a feature.
 * @param {string} featureName - The name of the feature to toggle.
 */
function toggleCheck(featureName) {
  featureStore.toggleCheck(featureName);
}

</script>
<style scoped>
.features-search-placebooking {
  padding: 0 1em 1em;
}

.feature-list{
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: flex-start;
  gap: 5px;
  margin-top: 10px;
}
.input-group-text{
  margin-right: 0rem !important;
}
.card-title {
  margin-bottom: 0.5em;
}

.card-body {
  margin-top: 0.5em;
}
</style>