import { ref } from "vue";
import { defineStore } from "pinia";
import { Query } from "appwrite";
import { databases } from "../appwrite";

/**
 * Interface representing a Feature object.
 */
export interface Feature {
  feature_name: string;
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  $permissions: string[];
  $databaseId: string;
  $collectionId: string;
}

/**
 * Pinia store for managing features.
 */
export const useFeatureStore = defineStore('featureStore', () => {
    const features = ref<Feature[]>([]);
    const checkedFeatures = ref<string[]>([]);

    /**
     * Fetches the list of features from the database.
     * @async
     * @returns {Promise<void>} Resolves when the features are fetched and stored.
     */
    const fetchFeatures = async () => {
        try {
            const response = await databases.listDocuments(import.meta.env.VITE_DB_ID, import.meta.env.VITE_DB_FEATURE_ID, [ Query.limit(5000) ]);
            features.value = response.documents as Feature[];
        } catch (error) {
            console.error(error);
        }
    };

    /**
     * Toggles the checked state of a feature.
     * @param {string} feature - The ID of the feature to toggle.
     */
    const toggleCheck = async (feature: string) => {
        if (checkedFeatures.value.includes(feature)) {
            checkedFeatures.value = checkedFeatures.value.filter((item) => item !== feature);
        } else {
            checkedFeatures.value.push(feature);
        }
    };

    /**
     * Resets the checked features list to an empty array.
     */
    const resetCheck = () => {
        checkedFeatures.value = [];
    };

    return {
        features,
        checkedFeatures,
        fetchFeatures,
        toggleCheck,
        resetCheck
    };
});