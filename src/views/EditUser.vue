<template>
  <h1>Edit User</h1>
  <form @submit.prevent="submitForm" class="mt-4">
    <div class="form-container">
      <div class="form-left">
        <div class="form-group">	
          <label for="firstName">First Name:</label>
          <input type="text" class="form-control" v-model="editUserForm.firstName" id="firstName" required />
        </div>
        <div class="form-group"> 
          <label for="lastName">Last Name:</label>
          <input type="text" class="form-control" v-model="editUserForm.lastName" id="lastName" required />
        </div>
        <div class="form-group">
          <label for="email">Email:</label>
          <input type="email" class="form-control" v-model="editUserForm.email" id="email" required />
        </div>
      </div>
      <div class="form-right">
        <div class="form-group">
          <label for="role" class="form-label me-2 role-label mb-0">Role:</label>
          <select id="role" class="form-select" v-model="editUserForm.role">
            <option value="admin">Admin</option>
            <option value="phd">PhD</option>
            <option value="student">Student</option>
          </select>
        </div>
        <div class="form-group" v-if="editUserForm.role === 'student'">
          <label for="timeQuota" class="form-label me-2 role-label mb-0">Time Quota (min):</label>
          <input type="number" class="form-control" v-model="editUserForm.timeQuota" id="timeQuota" min="0" />
        </div>
        <div class="mt-4">
          <label for="hardwareEligibility" class="form-label me-2 role-label mb-0">Hardware Eligibility:</label>
          <input type="checkbox" v-model="editUserForm.hardwareEligibility" id="hardwareEligibility" />
        </div>
      </div>
    </div>
    <footer class="button-group">
      <button type="submit" class="btn classic-button flex-grow-1 me-2">Update User</button>
      <button type="button" class="btn classic-button flex-grow-1" @click="closeOverlay">Cancel</button>
    </footer>
  </form>
</template>

<script setup>
import { ref, watch } from 'vue';
import { defineProps, defineEmits } from 'vue';

/**
 * Props
 * @typedef {Object} Props
 * @property {Object} user - The user object to be edited.
 */
const props = defineProps({
  user: Object
});

/**
 * Emits closeOverlay and updateUser events.
 * @typedef {Object} Emits
 * @property {Function} closeOverlay - Emits an event to close the overlay.
 * @property {Function} updateUser - Emits an event to update the user.
 */
const emit = defineEmits(['closeOverlay', 'updateUser']);

/**
 * @typedef {Object} EditUserForm
 * @property {string} firstName - The first name of the user.
 * @property {string} lastName - The last name of the user.
 * @property {string} email - The email of the user.
 * @property {string} role - The role of the user.
 * @property {number} timeQuota - The time quota for the user (only for students).
 * @property {boolean} hardwareEligibility - The hardware eligibility of the user.
 */

/**
 * Define editUserForm
 * @type {import('vue').Ref<EditUserForm>}
 */
const editUserForm = ref({
  firstName: '',
  lastName: '',
  email: '',
  role: '',
  timeQuota: 0,
  hardwareEligibility: false,
});

/**
 * Watch for changes in props.user and update editUserForm
 * @param {Props.user} newUser - The new user object.
 */
watch(() => props.user, (newUser) => {
  if (newUser) {
    editUserForm.value = { 
      ...newUser,
      role: Array.isArray(newUser.role) ? newUser.role[0] : newUser.role
    };
  }
}, { immediate: true });

/**
 * Close Overlay
 */
function closeOverlay() {
  emit('closeOverlay');
}

/**
 * Update User
 */
function submitForm() {
  emit('updateUser', { ...editUserForm.value });
}
</script>

<style lang="scss" scoped>
@use "../../node_modules/bootstrap/scss/bootstrap" as *;
@import"../style/select.scss";

.form-container {
  display: flex;
  justify-content: space-between;
}

.form-left,
.form-right {
  width: 45%;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  margin-bottom: 3px;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 6px;
}

.button-group {
  margin-top: 1rem;
  .button {
    height: 2.5em;
    padding: 0 1rem;
  }
}
</style>
