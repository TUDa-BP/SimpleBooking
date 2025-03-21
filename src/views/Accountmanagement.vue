<template>
  <div class="accountmanagement">
    <!-- Sidebar -->
    <Sidebar :isSidebarVisible="isSidebarVisible" @toggleSidebar="toggleSidebar"/>

    <!--Actual content for accountmanagement page-->
    <div :class="['content', { 'content-expanded': !isSidebarVisible }]">
      <header>
        <h1> Manage Accounts </h1>
      </header>

      <div class="buttons-top-right">
        <button class="overlay-button d-flex align-items-center" @click="openAccountOverlay" data-testid="add-account-button"> 
          <i class="bi bi-plus fs-3" style="line-height: 1;"></i>
          Add Account 
        </button>
        <Overlay v-if="isAccountOverlayOpen" >
          <!-- Create Account Component -->
          <CreateAccountmanually @closeOverlay="closeAccountOverlay" />
        </Overlay>

        <button class="overlay-button d-flex align-items-center" @click="openImportListOverlay" data-testid="import-csv-button"> 
          <i class="bi bi-plus fs-3" style="line-height: 1;"></i>
          Import from .csv
        </button>
        <Overlay v-if="isImportListOverlayOpen" >
          <!--Import Accounts via -csv-->
          <ImportCurseList @closeOverlay="closeImportListOverlay" />
        </Overlay>
      </div>
      
      <!--Search bar to search for users by name-->
      <div class="input-group rounded mt-4 mb-4">
        <span class="input-group-text" id="search-addon">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-search" viewBox="0 0 16 16">
            <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0"></path>
          </svg>
        </span>
        <input type="search" v-model="searchQuery" class="form-control " placeholder="Search Name" aria-label="Search" aria-describedby="search-addon" />
      </div>

      <!--Table with all users-->
      <table class="table" v-if="users.length > 0">
        <thead>
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>E-mail</th>
            <th>Role</th>
            <th>Timequota&nbsp;(min)</th>
            <th>Hardware&nbsp;eligibility</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(user, index) in searchAccounts" :key="user.$id">
            <td>{{ index + 1 }}</td>
            <td>{{ user.first_name + " " + user.last_name }}</td>
            <td>{{ user.email }}</td>
            <td>{{ user.role }}</td>
            <td>{{ user.time_quota }}</td>
            <td>
              <!--Checkbox that shows if user can borrow hardware-->
              <input 
                type="checkbox"
                :checked="user.hardware_eligibility"
                class="disabled-checkbox"
                aria-disabled="true"
              />
            </td>
            <td>
              <!--Buttons to edit and delete the specific user-->
              <div class="action-buttons">
                <button class="btn-edit classic-button" @click="editUser(user)">
                  <i class="bi bi-pencil-square"></i>
                </button>
                &nbsp;
                <button class="btn-delete classic-button" @click="deleteUser(user.$id)">
                  <i class="bi bi-x-circle-fill"></i>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      <!--In case of an empty database, this message is on screen-->
      <div v-else class="mt-3">No users found!</div>

      <!--Overlay for editing a user-->
      <Overlay v-if="isEditOverlayOpen">
        <EditUser :user="editUserForm" @closeOverlay="closeEditOverlay" @updateUser="updateUser" />
      </Overlay>

    </div>
      
  </div>
</template>

<script setup>
/**
 * Import necessary components and modules.
 */
import Sidebar from "@/components/Sidebar.vue";
import { ref, computed, onMounted } from 'vue';
import Overlay from "@/components/Overlay.vue";
import EditUser from "./EditUser.vue";
import ImportCurseList from "./ImportCurseList.vue";
import CreateAccountmanually from "./CreateAccountmanually.vue";
import { useMessageStore } from '@/store/messages';
import { useUserStore } from '@/store/user';

const messageStore = useMessageStore();
const userStore = useUserStore();

const isSidebarVisible = ref(true);
const isAccountOverlayOpen = ref(false);
const isImportListOverlayOpen = ref(false);
const isEditOverlayOpen = ref(false);

const editUserForm = ref({
  id: null,
  firstName: '',
  lastName: '',
  email: '',
  role: [],
  timeQuota: 0,
  hardwareEligibility: false,
});

const users = ref([]);

const searchQuery = ref(""); 

/**
 * Toggle the visibility of the sidebar.
 */
function toggleSidebar() {
  isSidebarVisible.value = !isSidebarVisible.value;
}

/**
 * Open the overlay for adding a new account.
 */
function openAccountOverlay() {
  isAccountOverlayOpen.value = true;
}

/**
 * Close the overlay for adding a new account.
 */
function closeAccountOverlay() {
  isAccountOverlayOpen.value = false;
}

/**
 * Open the overlay for importing a list of accounts.
 */
function openImportListOverlay() {
  isImportListOverlayOpen.value = true;
}

/**
 * Close the overlay for importing a list of accounts.
 */
function closeImportListOverlay() {
  isImportListOverlayOpen.value = false;
}

/**
 * Open the overlay for editing an account.
 * @param {Object} user - The user object to be edited.
 */
function openEditOverlay(user) {
  editUserForm.value = {
    id: user.$id,
    firstName: user.first_name,
    lastName: user.last_name,
    email: user.email,
    role: user.role,
    timeQuota: user.time_quota,
    hardwareEligibility: user.hardware_eligibility,
  };
  isEditOverlayOpen.value = true;
}

/**
 * Close the overlay for editing an account.
 */
function closeEditOverlay() {
  isEditOverlayOpen.value = false;
}

/**
 * Fetch all users when the component is mounted.
 */
onMounted(async () => {
  try {
    users.value = await userStore.fetchAllUsers();
  } catch (error) {
    console.log(error);
    messageStore.showLongAlert(error.message, 'danger');
  }
});

/**
 * Open the edit overlay for a specific user.
 * @param {Object} user - The user object to be edited.
 */
const editUser = (user) => {
  openEditOverlay(user);
};

/**
 * Update the user information.
 * @param {Object} updatedUser - The updated user object.
 */
async function updateUser(updatedUser) {
  const originalUser = users.value.find(user => user.$id === updatedUser.id);
  const emailChanged = originalUser.email.trim() !== updatedUser.email.trim();

  try {
    await userStore.updateUser(updatedUser, emailChanged);
    messageStore.showLongAlert('User updated', 'success');
    closeEditOverlay();
    // Refresh the user list
    users.value = await userStore.fetchAllUsers();
  } catch (error) {
    console.log(error);
    messageStore.showLongAlert(error.message, 'danger');
  }
}

/**
 * Delete a user by ID.
 * @param {string} id - The ID of the user to be deleted.
 */
const deleteUser = async (id) => {
  if (confirm("Are you sure you want to delete this user?")) {
    try {
      const response = await userStore.deleteUser(id);
      if (response.success) {
        messageStore.showLongAlert("User deleted", 'success');
      } else {
        throw new Error(response.error);
      }
      // Refresh the user list
      users.value = await userStore.fetchAllUsers();
    } catch (error) {
      console.log(error);
      messageStore.showLongAlert(error.message, 'danger');
    }
  }
};

/**
 * Computed property to filter users based on the search query.
 * @returns {Array} - The filtered list of users.
 */
const searchAccounts = computed(() => {
  return users.value.filter((users) => {
    const query = searchQuery.value.toLowerCase();
    return (
      users.first_name.toLowerCase().includes(query) ||
      users.last_name.toLowerCase().includes(query)
    );
  });
});

</script>

<style lang="scss" scoped>
@use "../../node_modules/bootstrap/scss/bootstrap" as *;
@use "../../node_modules/bootstrap-icons/font/bootstrap-icons" as *;
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap");
@import '@/style/frames.scss';
@import '@/style/button.scss';
@import '@/style/typography.scss';

.accountmanagement {
  display: flex;
  flex-direction: row;
  height: 100vh;
}

.input-group-text{
  margin-right: 0rem !important;
}

.disabled-checkbox {
  cursor: default; 
  pointer-events: none; 
  opacity: 1; 
  accent-color: green;
}
</style>