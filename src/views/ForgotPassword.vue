<template>
    <div class="forgot_password">
        
        <div class="forgot_password-container">
            <!-- E-mail form -->
            <form @submit.prevent="handleEmailRecovery">

                <div class="d-grid gap-3">
                    <h5 class="mb-4">Request Recovery Link</h5>
                    <input class="form-control" type="email" v-model="email" placeholder="User E-mail">
                    <button id="sendEmail" class="register-button btn btn-primary classic-button" type="submit">Send E-mail</button>
                </div>

            </form>

        </div>
    </div>
    <!-- Animated waves on the bottom -->
    <div class="waves"></div>
</template>

<script setup>
import { ref } from 'vue';
import { account } from '../appwrite';
import { useMessageStore } from '@/store/messages';

// Message store used for showing message in alert component
const messageStore = useMessageStore();

// Default values
const email = ref('');

/**
 * Function for handling the sending of a recovery e-mail.
 * @function handleEmailRecovery
 */
const handleEmailRecovery = () => {
    const promise = account.createRecovery(email.value , import.meta.env.VITE_RESET_LINK);

    promise.then(function (response) {
        // Success
        console.log(response);
        messageStore.showLongAlert("Please check your e-mail. You should receive a recovery link in a few minutes.", 'info');
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

.forgot_password {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
}

.forgot_password-container {
    width: 100%;
    max-width: 400px;
    padding: 20px;
}

</style>