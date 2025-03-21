import { ref } from "vue";
import { defineStore } from 'pinia';
import { databases, functions } from "../appwrite";
import { ExecutionMethod, Query } from "appwrite";

export const useHardwareStore = defineStore('hardware', () => {

    /**
     * Reactive list of hardware items.
     */
    const hardwareList = ref<any[]>([]);

    /**
     * Fetches the list of hardware from the database and updates the hardwareList.
     * @async
     * @returns {Promise<void>} Resolves when the hardware list is fetched and updated.
     */
    const fetchHardware = async () => {
        try {
            // Fetch hardware documents and expand the storage_location relationship
            const hardwareResponse = await databases.listDocuments(import.meta.env.VITE_DB_ID, import.meta.env.VITE_DB_HW_ID, [ Query.limit(5000) ]);

            // Map the response directly in the hardware data
            hardwareList.value = hardwareResponse.documents.map((hardware) => ({
                id: hardware.$id,
                name: hardware.hardware_name,
                stockNumber: hardware.stock_number,
                costCenterNumber: hardware.cost_center_number,
                maxBookingTime: hardware.max_booking_time,
                roomNumber: hardware.storageLocation?.room_number,
                storageID: hardware.storageLocation?.storage_id,
                shelfSlot: hardware.storageLocation?.shelf_slot,
                category: hardware.category,
                deactivated: hardware.deactivated,
                is_available: hardware.is_available,
            }));
        } catch (error) {
            console.log(error);
        }
    };

    /**
     * Updates a hardware document in the database.
     * @async
     * @param {Object} newData - The new data to update the hardware with.
     * @param {string} id - The ID of the hardware document to update.
     * @returns {Promise<void>} Resolves when the hardware is updated and the list is refreshed.
     */
    const updateHardware = async (newData: any, id: string) => {
        try {
            await databases.updateDocument(
                import.meta.env.VITE_DB_ID, // databaseId
                import.meta.env.VITE_DB_HW_ID, // collectionId
                id, // documentId
                newData, // data (optional)
            );
            await fetchHardware();
        } catch (error) {
            console.log(error);
        }
    };

    /**
     * Deletes a hardware document using a cloud function.
     * @async
     * @param {string} id - The ID of the hardware document to delete.
     * @returns {Promise<string | undefined>} Resolves with the execution ID of the cloud function or undefined if an error occurs.
     */
    const deleteHardware = async (id: string) => {
        try {
            console.log("create execution of cloud function");
            const requestBody = {
                hwId: id
            };

            const promise = await functions.createExecution(
                import.meta.env.VITE_CLOUDFUNCTION_HWMANAGEMENT_ID,  // functionId
                JSON.stringify(requestBody),  // body (optional)
                true,  // async (optional)
                import.meta.env.VITE_CLOUDFUNCTION_HWMANAGEMENT_ENDPOINTDELETEHW,  // path (optional)
                ExecutionMethod.POST,
                {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                }
            );

            return promise.$id.toString();
        } catch (error) {
            console.log(error);
        }
    };

    /**
     * Adds a new hardware document to the database.
     * @async
     * @param {Object} newHardware - The data for the new hardware document.
     * @returns {Promise<void>} Resolves when the hardware is added and the list is refreshed.
     */
    const addHardware = async (newHardware: any) => {
        try {
            await databases.createDocument(
                import.meta.env.VITE_DB_ID, // databaseId
                import.meta.env.VITE_DB_HW_ID, // collectionId
                'unique()', // documentId
                newHardware // data
            );
            await fetchHardware();
        } catch (error) {
            console.log(error);
            throw error;
        }
    };

    /**
     * Toggles the deactivated status of a hardware item.
     * @async
     * @param {Object} hardware - The hardware item to toggle.
     * @returns {Promise<void>} Resolves when the status is toggled and updated in the database.
     */
    const toggleStatus = async (hardware: any) => {
        try {
            const newStatus = !hardware.deactivated;

            if (newStatus === true) {
                console.log("create execution of cloud function");
                const requestBody = {
                    hwId: hardware.id
                };

                await functions.createExecution(
                    import.meta.env.VITE_CLOUDFUNCTION_HWMANAGEMENT_ID,  // functionId
                    JSON.stringify(requestBody),  // body (optional)
                    true,  // async (optional)
                    import.meta.env.VITE_CLOUDFUNCTION_HWMANAGEMENT_ENDPOINTTOGGLEHW,  // path (optional)
                    ExecutionMethod.POST,
                    {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                    }
                );
            }
            await databases.updateDocument(
                import.meta.env.VITE_DB_ID, // databaseId
                import.meta.env.VITE_DB_HW_ID, // collectionId
                hardware.id, // documentId
                { deactivated: newStatus } // data
            );
            hardware.deactivated = newStatus;
        } catch (error) {
            console.log(error);
            throw error;
        }
    };

    return {
        hardwareList,
        fetchHardware,
        updateHardware,
        deleteHardware,
        addHardware,
        toggleStatus
    };
});