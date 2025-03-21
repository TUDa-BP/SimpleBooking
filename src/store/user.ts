import { ref, computed } from "vue";
import { defineStore } from 'pinia'
import { Query, ExecutionMethod } from "appwrite";
import { account, databases, functions } from '../appwrite';

export interface User {
  first_name: string;
  last_name: string;
  time_quota: number | null;
  activation_code: string | null;
  hardware_eligibility: boolean;
  role: string[];
  email: string;
  roomBooking: any[] | null;
  placeBooking: any[] | null;
  hardwareBooking: any[] | null;
  maxTimeQuota: any | null;
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  $permissions: string[];
  $databaseId: string;
  $collectionId: string;
}

export const useUserStore = defineStore('user', () => {
  // State
  const user = ref<User|null>(null)
  const placeBookings = ref<any[]>([]);
  const hardwareBookings = ref<any[]>([]);
  const default_time_quota = ref<number | null>(null);

  const isAdmin = computed(() => user.value?.role.includes('admin'));
  const isStudent = computed(() => user.value?.role.includes('student'));
  const isPhD = computed(() => user.value?.role.includes('phd'));

  /**
   * Fetches the current user data.
   * @returns {Promise<void>}
   */
  const fetchUser = async () => {
    try {
      const result = await account.get()
      const queryResponse = await databases.getDocument(import.meta.env.VITE_DB_ID, import.meta.env.VITE_DB_USER_ID, result.$id);

      user.value = queryResponse as User;
    } catch (error) {
      console.error(error);
    }
  };

  /**
   * Fetches all users.
   * @returns {Promise<any[]>}
   */
  const fetchAllUsers = async () => {
    try {
      const response = await databases.listDocuments(import.meta.env.VITE_DB_ID, import.meta.env.VITE_DB_USER_ID, [ Query.limit(5000) ]);
      return response.documents;
    } catch (error) {
      console.log(error);
    }
  };


  /**
   * Fetches the default time quota.
   * @returns {Promise<void>}
   */
  const getDeafultTimeQuota = async () => {
    const docs = await databases.listDocuments(import.meta.env.VITE_DB_ID, import.meta.env.VITE_DB_TIME_QUOTA_ID);
    if (docs.documents.length > 0) {
      default_time_quota.value = docs.documents[0].max_value;
    }
    else {
      throw new Error("No default time quota found");
    } 
  };

  /**
   * Sets the default time quota.
   * @param {number} time_quota
   * @returns {Promise<void>}
   */
  const setDefaultTimeQuota = async (time_quota: number) => {
    if(time_quota <= 0){
      throw new Error("Time quota must be greater than 0");
    }
    // Id of the time quota document:
    await databases.updateDocument(
      import.meta.env.VITE_DB_ID, // databaseId
      import.meta.env.VITE_DB_TIME_QUOTA_ID, // collectionId
      import.meta.env.VITE_DB_TIME_QUOTA_DOC_ID, // documentId
      { max_value: time_quota }, // data (optional)
    );
    default_time_quota.value = time_quota;
  };


  /**
   * Deletes a user.
   * @param {string} id
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  const deleteUser = async (id: string) => {
    try {
      const promise = await functions.createExecution(
        import.meta.env.VITE_CLOUDFUNCTION_ACCOUNTMANAGEMENT_ID, 
        JSON.stringify({ userId: id }),
        false,
        import.meta.env.VITE_CLOUDFUNCTION_ACCOUNTMANAGEMENT_ENDPOINTDELETEACCOUNT,
        ExecutionMethod.POST,
        {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        }
      );
      
      const body = JSON.parse(promise.responseBody);
      if (body.success) {
        return { success: true };
      } else {
        return { success: false, error: body.error };
      }
    } catch (error) {
      console.log(error);
      return { success: false, error: (error as Error).message };
    }
  }

  /**
   * Updates a user.
   * @param {Object} updatedUser
   * @param {any} updatedUser.id
   * @param {any} updatedUser.firstName
   * @param {any} updatedUser.lastName
   * @param {any} updatedUser.email
   * @param {any} updatedUser.role
   * @param {any} updatedUser.timeQuota
   * @param {any} updatedUser.hardwareEligibility
   * @param {boolean} emailChanged
   * @returns {Promise<void>}
   */
  const updateUser = async (updatedUser: { id: any; firstName: any; lastName: any; email: any; role: any; timeQuota: any; hardwareEligibility: any; }, emailChanged: boolean) => {
    const requestBody = {
      userId: updatedUser.id,
      first_name: updatedUser.firstName,
      last_name: updatedUser.lastName,
      email: updatedUser.email,
      role: updatedUser.role,
      time_quota: parseInt(updatedUser.timeQuota, 10),
      hardware_eligibility: updatedUser.hardwareEligibility,
      emailChanged: emailChanged,
    };
    console.log('Req Body:', requestBody);
    try {
      const promise = await functions.createExecution(
        import.meta.env.VITE_CLOUDFUNCTION_ACCOUNTMANAGEMENT_ID,  // functionId
        JSON.stringify(requestBody),  // body (optional)
        true,  // async (optional)
        import.meta.env.VITE_CLOUDFUNCTION_ACCOUNTMANAGEMENT_ENDPOINTUPDATEACCOUNT,  // path (optional)
        ExecutionMethod.POST,
        {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        }
      );
      console.log(promise);
      // Removed call to updateAfterCloudFunction
    } catch (error) {
      console.log(error);
      if (error instanceof Error) {
        throw new Error(error.message);
      } else {
        throw new Error(String(error));
      }
    }
  }

  // Actions
  return {
    user,
    placeBookings,
    hardwareBookings,
    fetchUser,
    fetchAllUsers,
    default_time_quota,
    getDeafultTimeQuota,
    setDefaultTimeQuota,
    isAdmin,
    isStudent,
    isPhD,
    deleteUser,
    updateUser
  };
});