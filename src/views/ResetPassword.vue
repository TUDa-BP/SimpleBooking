<template>
    <div class="reset_password">
        
        <div class="reset_password-container">
            <!-- Password recovery form -->
            <form @submit.prevent="handleReset">

                <div class="d-grid gap-3">

                    <h5 class="mb-4">Reset Password</h5>
                    <input class="form-control" type="text" v-model="password" placeholder="Password">
                    <input class="form-control" type="password" v-model="verify_password" placeholder="Confirm Password">
                    <button id="resetPassword" class="register-button btn btn-primary classic-button" type ="submit">Reset</button>
                
                </div>

            </form>

        </div>
    </div>
    <!-- Animated waves on the bottom -->
    <div class="waves"></div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { account } from '../appwrite';
import { useRouter } from 'vue-router';
import { useMessageStore } from '@/store/messages';

/**
 * Message store used for showing messages in the alert component.
 */
const messageStore = useMessageStore();

/**
 * Vue Router instance for navigation.
 */
const router = useRouter();

/**
 * Reactive reference for the password input field and the password confirmation input field.
 * @type {import('vue').Ref<string>}
 */
const password = ref('');
const verify_password = ref('');

/**
 * Watches the password field for changes and validates its requirements.
 * Displays an alert if the password does not meet the criteria.
 */
watch([password], ([password]) => {
    if (password && password.length < 8) {
        messageStore.showAlert("Password must be at least 8 characters long", 'danger');
    } else if (password && !/(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8}/.test(password)) {
        messageStore.showAlert("Password must contain at least one letter and one number", 'danger');
    }
});

/**
 * Handles the password reset process.
 * Validates the password and confirmation fields, retrieves necessary parameters,
 * and calls the Appwrite API to update the recovery.
 */
const handleReset = () => {        
    if (password.value !== verify_password.value) {
        messageStore.showAlert('Passwords do not match!', 'danger');
        return;
    } 
    if (password && password.value.length < 8) {
        messageStore.showAlert("Password must be at least 8 characters long", 'danger');
        return;
    } 
    if (password && !/^(?=.*[A-Za-z])(?=.*\d).+$/.test(password.value)) {
        messageStore.showAlert("Password must contain at least one letter and one number", 'danger');
        return;
    }
    
    // Get required parameters for password recovery
    const urlParams = new URLSearchParams(window.location.search);
    const secret = urlParams.get('secret');
    const userId = urlParams.get('userId');

    // Call Appwrite API to update recovery
    const promise = account.updateRecovery(
        userId,
        secret,
        password.value,
        verify_password.value
    );

    promise.then(function (response) {
        // Success
        console.log(response);

        // Redirect to login after 2 seconds
        messageStore.showLongAlert("Recovery successful. You will be redirected to login.", 'success');
        setTimeout(() => {
            router.push({ name: 'login' });
        }, 2000);
    }, function (error) {
        // Failure
        console.log(error);
        messageStore.showAlert(error.message, 'danger');
    });
};

</script>

<style lang="scss" scoped>
@use "../../node_modules/bootstrap/scss/bootstrap" as *;
@import "../style/animations.scss";

.reset_password {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
}

.reset_password-container {
    width: 100%;
    max-width: 400px;
    padding: 20px;
}

</style>