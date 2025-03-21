<template>
    <div class="register">
        <div class="row align-items-center register-container">
            <h1 class="mb-4">Register</h1>
            <form class="d-grid gap-3 ">
                <input name="first_name" class="form-control" type="text" v-model="first_name" placeholder="First Name">
                <input name="last_name" class="form-control" type="text" v-model="last_name" placeholder="Last Name">
                <input name="email" class="form-control" type="email" v-model="email" placeholder="E-mail" readonly>
                <input name="password" class="form-control" type="password" v-model="password" placeholder="Password">
                <input name="activation_code" class="form-control" type="text" v-model="activation_code" placeholder="Code">
                <!-- This has to be a button since we need to have the submit event to trigger the form validation -->
                <button  v-if="!isLoading" id="register" class="button btn btn-primary classic-button" @click="register">Register</button>
                <div v-else class="spinner-border register-loading" role="status">
                    <span class="sr-only"></span>
                </div>
            </form>
        </div>
    </div>
    <div class="waves"></div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { jwtDecode } from "jwt-decode";
import { useMessageStore } from "@/store/messages";
import { Functions } from "appwrite";
import { client, account } from "../appwrite";

const messageStore = useMessageStore();

const functions = new Functions(client);

/**
 * Reactive variables for form fields and loading state.
 */
const first_name = ref('');
const last_name = ref('');
const activation_code = ref('');
const email = ref('');
const password = ref('');
const isLoading = ref(false); // This variable will be used to show the loading spinner
var id = "";

const router = useRouter();
const route = useRoute();

/**
 * Decodes a JWT token and populates form fields with the decoded data.
 * @param {string} jwtString - The JWT token to decode.
 */
function decodeJWT(jwtString) {
    const decoded = jwtDecode(jwtString);
    email.value = decoded.email ?? '';
    first_name.value = decoded.first_name ?? '';
    last_name.value = decoded.last_name ?? '';
    id = decoded.id ?? '';
}

/**
 * Lifecycle hook that runs when the component is mounted.
 * Checks for a token in the URL and decodes it.
 */
onMounted(() => {
    if (route.params !== undefined && route.params.token !== undefined && route.params.token !== '') {
        console.log(route.params.token);
        activation_code.value = route.params.token;
        decodeJWT(route.params.token);   
    }
});


// Regex for the Password Rule: ^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8}$
// checks if the password is at least 8 characters long and contains at least one letter and one number
watch([password], ([password]) => {
    const check = testPassword(password);
    if (check != '') {
        messageStore.showAlert(check, 'danger');
    }
});

/**
 * Watches the activation_code field and decodes the JWT token when it changes.
 */
watch([activation_code], ([activation_code]) => {
    decodeJWT(activation_code);   
});

/**
 * Handles the registration process.
 * Validates form fields, sends a request to the backend, and logs in the user.
 */
const register = async () => {
    try {
        if (first_name.value == '') throw new Error('First name is required');
        if (last_name.value == '') throw new Error('Last name is required');
        if (email.value == '') throw new Error('Email is required');
        if (password.value == '') throw new Error('Password is required');
        if (testPassword(password.value) != '') throw new Error(testPassword(password.value));

        const requestBody = {
            first_name: first_name.value,
            last_name: last_name.value,
            email: email.value,
            password: password.value,
            activation_code: activation_code.value,
            id: id
        };
        isLoading.value = true;

        const promise = await functions.createExecution(
            import.meta.env.VITE_CLOUDFUNCTION_REGISTER_ID,
            JSON.stringify(requestBody),
            false,
            import.meta.env.VITE_CLOUDFUNCTION_REGISTER_ENDPOINTREGISTER,
            'POST',
            {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            }
        );
        const body = JSON.parse(promise.responseBody);
        isLoading.value = false;

        if (body.success) {
            messageStore.showAlert(body.message, 'success');
            account.get().then(async () => {
                await account.deleteSessions();
                await account.createEmailPasswordSession(email.value, password.value);
            }).catch(async (e) => {
                console.log(e);
                await account.createEmailPasswordSession(email.value, password.value);
                router.push('/dashboard');
            });
        } else {
            throw new Error(body.error);
        }
    } catch (error) {
        messageStore.showAlert(error.message, 'danger');
        return false;
    }
};

/**
 * Validates the password against specific rules.
 * @param {string} Password - The password to validate.
 * @returns {string} - An error message if invalid, or an empty string if valid.
 */
function testPassword(Password) {
    if (Password.length < 8) {
        return 'Password must be at least 8 characters long';
    } else if (Password && !/(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8}/.test(Password)) {
        return 'Password must contain at least one letter and one number';
    } else {
        return '';
    }
}
</script>

<style lang="scss" scoped>
@use "../../node_modules/bootstrap/scss/bootstrap" as *;
@import "@/style/animations.scss";
@import "@/style/button.scss";

.register {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
}

.register-container {
    width: 100%;
    max-width: 400px;
    padding: 20px;
}

.register-loading {
    margin: 0 auto;
    display: block;
}
</style>
