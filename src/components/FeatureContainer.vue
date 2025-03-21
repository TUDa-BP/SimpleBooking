<template>
  <div :class="['feature-container', { 'feature-container-edit': isEdit }]">
    <div class="feature-header">
      <h6 class="features-heading">{{ title }}</h6>
      <a href="#" class="edit-link" @click.prevent="toggleEdit">{{ isEdit ? 'Save' : 'Edit' }}</a>
    </div>
    <div class="input-group rounded mt-4 mb-4 ">
      <span class="input-group-text" id="search-addon">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-search" viewBox="0 0 16 16">
          <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0"></path>
        </svg>
      </span>
      <input
        class="form-control search-input"
        type="search"
        placeholder="Search"
        v-model="searchQuery"
        @input="filterFeatures"
      />
    </div>

    

    <div class="feature-button-row">
      <div v-for="(feature) in filteredFeatures" :key="feature.$id">
        <FeatureButton
          :text="feature.feature_name"
          :checked="selectedFeatures.includes(feature.$id)"
          @update:checked="toggleFeatureCheck(feature.$id)"
        />
      </div>
    </div>

    <div v-if="isEdit" class="edit-feature-row">
      <div class="edit-feature-input-group">
        <input
          type="text"
          v-model="newFeature"
          class="form-control feature-input"
          placeholder="Feature Name"
        />
        <button class="btn classic-button btn-success add-feature-button" @click.prevent="addFeature">
          Add Feature
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import FeatureButton from '@/components/FeatureButton.vue';
import { databases } from '../appwrite';
import { useMessageStore } from '@/store/messages';

export default {
  name: 'FeatureContainer',
  components: {
    FeatureButton,
  },
  props: {
    /**
     * The title of the feature container.
     * @type {String}
     * @default 'Features'
     */
    title: {
      type: String,
      default: 'Features',
    },
    /**
     * The list of features to display.
     * @type {Array}
     * @default []
     */
    features: {
      type: Array,
      default: () => [],
    },
    /**
     * The list of selected feature IDs.
     * @type {Array}
     * @default []
     */
    modelValue: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      isEdit: false,
      newFeature: '',
      searchQuery: '',
      internalFeatures: [...this.features],
      filteredFeatures: [...this.features],
      selectedFeatures: [...this.modelValue],
      messageStore: useMessageStore(),
      databaseID: import.meta.env.VITE_DB_ID,
      featuresCollectionID: import.meta.env.VITE_DB_FEATURE_ID,
    };
  },
  methods: {
    /**
     * Toggles the edit mode.
     */
    toggleEdit() {
      this.isEdit = !this.isEdit;
    },
    /**
     * Adds a new feature to the list and database.
     * Displays an alert if the feature name is empty or already exists.
     */
    async addFeature() {
      if (this.newFeature.trim()) {
        const featureExists = this.internalFeatures.some(
          (feature) => feature.feature_name.toLowerCase() === this.newFeature.toLowerCase()
        );
        if (featureExists) {
          this.messageStore.showAlert('Feature with the same name already exists.', 'warning');
          return;
        }
        try {
          const newFeatureDoc = await databases.createDocument(this.databaseID, this.featuresCollectionID, 'unique()', {
            feature_name: this.newFeature,
          });
          const newFeature = { feature_name: newFeatureDoc.feature_name, $id: newFeatureDoc.$id };
          this.internalFeatures.push(newFeature);
          this.filteredFeatures.push(newFeature);
          this.newFeature = '';
          this.$emit('update:features', this.internalFeatures);
        } catch (error) {
          console.log(error);
          this.messageStore.showAlert(error.message, 'danger');
        }
      } else {
        this.messageStore.showAlert('Feature name cannot be empty.', 'warning');
        console.warn('Feature name cannot be empty.');
      }
    },
    /**
     * Toggles the selection state of a feature.
     * @param {String} featureId - The ID of the feature to toggle.
     */
    toggleFeatureCheck(featureId) {
      const index = this.selectedFeatures.indexOf(featureId);
      if (index > -1) {
        this.selectedFeatures.splice(index, 1);
      } else {
        this.selectedFeatures.push(featureId);
      }
      this.$emit('update:modelValue', [...this.selectedFeatures]);
    },
    /**
     * Filters the features based on the search query.
     */
    filterFeatures() {
      const query = this.searchQuery.toLowerCase();
      this.filteredFeatures = this.internalFeatures.filter((feature) =>
        feature.feature_name.toLowerCase().includes(query)
      );
    },
  },
  watch: {
    /**
     * Watches for changes in the `features` prop and updates the internal and filtered features.
     * @param {Array} newFeatures - The updated list of features.
     */
    features: {
      immediate: true,
      deep: true,
      handler(newFeatures) {
        this.internalFeatures = [...newFeatures];
        this.filteredFeatures = [...newFeatures];
      },
    },
    /**
     * Watches for changes in the `modelValue` prop and updates the selected features.
     * @param {Array} newSelectedFeatures - The updated list of selected feature IDs.
     */
    modelValue: {
      immediate: true,
      deep: true,
      handler(newSelectedFeatures) {
        this.selectedFeatures = [...newSelectedFeatures];
      },
    },
  },
};
</script>

<style scoped>
.feature-container {
  border: 2px dashed #7749f8;
  border-radius: 6px;
  padding: 20px;
  margin: 20px 0;
}

.feature-container-edit {
  border-color: red;
}

.feature-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.features-heading {
  margin: 0;
}

.edit-link {
  color: #7749f8;
  text-decoration: none;
  font-size: 12px;
  font-weight: bold;
}

.feature-button-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.edit-feature-row {
  margin-top: 10px;
}

.edit-feature-input-group {
  display: flex;
  gap: 10px;
}

.feature-input {
  flex: 1;
}

.add-feature-button {
  flex-shrink: 0;
}
.input-group-text{
  margin-right: 0rem !important;
}
</style>
