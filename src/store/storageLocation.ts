import { ref } from "vue";
import { defineStore } from 'pinia';
import { databases } from "../appwrite";
import { Query } from "appwrite";

export const useStorageLocationStore = defineStore('storageLocation', () => {
    
    /**
     * Reactive reference to the list of storage locations.
     * @type {import('vue').Ref<any[]>}
     */
    const storageLocaitons = ref<any[]>([]);

    /**
     * Fetches all storage locations from the database and updates the `storageLocaitons` ref.
     * @async
     * @returns {Promise<void>} Resolves when the storage locations are fetched.
     */
    const fetchStorageLocation = async () => {
        try{
            const storageResponse = await databases.listDocuments(import.meta.env.VITE_DB_ID, import.meta.env.VITE_DB_STORAGELOCATION_ID, [ Query.limit(5000) ]);
            storageLocaitons.value = storageResponse.documents;
        } catch (error) {
            console.log(error);
        }
    };

    /**
     * Fetches a storage location by its attributes or creates a new one if it doesn't exist.
     * @async
     * @param {string} storage_id - The ID of the storage.
     * @param {string} room_number - The room number (whitespace trimmed).
     * @param {string} shelf_slot - The shelf slot.
     * @returns {Promise<string>} The ID of the existing or newly created storage location.
     * @throws Will throw an error if the operation fails.
     */
    const fetchOrCreateStorageLocation = async (storage_id: string, room_number: string, shelf_slot: string): Promise<string> => {
        try {
            room_number = room_number.trim(); // Remove whitespaces at the beginning and end
            const storageLocationResponse = await databases.listDocuments(import.meta.env.VITE_DB_ID, import.meta.env.VITE_DB_STORAGELOCATION_ID, [
                Query.equal('storage_id', storage_id),
                Query.equal('room_number', room_number),
                Query.equal('shelf_slot', shelf_slot),
                Query.limit(5000)
            ]);

            if (storageLocationResponse.documents.length > 0) {
                return storageLocationResponse.documents[0].$id;
            } else {
                const newStorageLocation = await databases.createDocument(import.meta.env.VITE_DB_ID, import.meta.env.VITE_DB_STORAGELOCATION_ID, 'unique()', {
                    storage_id,
                    room_number,
                    shelf_slot,
                });
                return newStorageLocation.$id;
            }
        } catch (error) {
            console.log(error);
            throw error;
        }
    };

    return {
        storageLocaitons,
        fetchStorageLocation,
        fetchOrCreateStorageLocation
    };

});