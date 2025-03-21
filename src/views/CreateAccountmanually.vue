<template>
   
    <div class="mt-0 create-account">
        <h1> Create Account</h1>
        <form @submit.prevent="handleSubmit">
            <div class="block">
                <input type="text" class="form-control" id="first_name" v-model="first_name" placeholder="First Name">
            </div>
            <div class="block">
                <input type="text" class="form-control" id="last_name" v-model="last_name" placeholder="Last Name">
            </div>
            <div class="block">
                <input type="email" class="form-control" id="email" v-model="email" placeholder="E-Mail">
            </div>
            <div class="block d-flex align-items-center">
                <label for="role" class="form-label me-2 role-label mb-0">Role:</label>
                <select class="form-select" id="role" v-model="role">
                    <option value="" disabled>Select Role</option>
                    <option value="admin">Admin</option>
                    <option value="phd">PhD</option>
                    <option value="student">Student</option>
                </select>
            </div>
            <footer class="button-group">
                <button type="submit" class="btn classic-button flex-grow-1 me-2">Add Account</button>
                <button type="button" class="btn classic-button flex-grow-1" @click="closeOverlay">Cancel</button>
            </footer>
        </form>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { useMessageStore } from '@/store/messages';
import { Functions } from "appwrite";
import { client, account } from "../appwrite";
const functions = new Functions(client);

const first_name = ref('');
const last_name = ref('');
const email = ref('');
const role = ref(''); // Default value for the role is empty

const isloading = ref(false);
const warningmessage= useMessageStore();

/**
 * Validates an email address using a regular expression.
 *
 * @param {string} email - The email address to validate.
 * @returns {boolean} - Returns true if the email address is valid, otherwise false.
 */
const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
};

const handleSubmit = async () => {
    // Validate required fields
    /**
     * Validates the input fields for creating an account manually.
     * 
     * - Checks if the first name is provided and shows an alert if not.
     * - Checks if the last name is provided and shows an alert if not.
     * - Checks if the email address is provided and shows an alert if not.
     * - Validates the email format and shows an alert if invalid.
     * - Checks if a role is selected and shows an alert if not.
     * 
     * @returns {void}
     */
    if (!first_name.value.trim()) {
        warningmessage.showAlert('Please enter a first name.','danger');
        return;
    }
    if (!last_name.value.trim()) {
        warningmessage.showAlert('Please enter a last name.','danger');
        return;
    }
    if (!email.value.trim()) {
        warningmessage.showAlert('Please enter an email address.','danger');    
        return;
    }
    if (!validateEmail(email.value)) {
        warningmessage.showAlert('Please enter a valid email address.','danger');
        return;
    }
    if (!role.value) {
        warningmessage.showAlert('Please select a role.','danger');
        return;
    }

    try {
        const accountData = {
            first_name: first_name.value,
            last_name: last_name.value,
            email: email.value,
            role: role.value
        };
        console.log(accountData);

        isloading.value = true;
        const promise = await functions.createExecution(
            import.meta.env.VITE_CLOUDFUNCTION_ACCOUNTMANAGEMENT_ID,
            JSON.stringify(accountData),  // body (optional)
            false,  // async (optional)
            import.meta.env.VITE_CLOUDFUNCTION_ACCOUNTMANAGEMENT_ENDPOINTCREATEACCOUNT,  // path (optional)
            'POST',
            {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            }
        );
        console.log(promise);
        const body = JSON.parse(promise.responseBody);
        isloading.value = false;
        if (body.success) {
            warningmessage.showAlert('Account created successfully.','success');
        }
        
        else {
            throw new Error(body.error);
        }
    } catch (error) {
        isloading.value = false;
        
        console.error('Error creating account:', error);
        warningmessage.showAlert(error.message, 'danger');
    }
};

/**
 * Emits an event to close the overlay and return to the account management page.
 */
const emit = defineEmits(['closeOverlay']);
function closeOverlay() {
  emit('closeOverlay');
}
</script>

<style lang="scss" scoped>
@use "../../node_modules/bootstrap/scss/bootstrap" as *;
@import"../style/select.scss";

.create-account {

    .block {
        /* changes from tims styling (1em)*/
        margin-top: 1.5em;
    }

    .button-group {
        margin-top: 5em;

        button {
            height: 2.5em;
            margin-right: 0.5em;
            padding: 0 2em;
        }
    }

    .role-label {
        font-size: 1.25rem;
    }
}
</style>
