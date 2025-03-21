<template>
  <!-- Login page container -->
  <div class="login">
    <div class="login-container">
      <h1 class="mb-4">Login</h1>

      <!-- Login form -->
      <form @submit.prevent="handleLogin">
        <div class="d-grid gap-3">
          <!-- Email input field -->
          <input class="form-control" type="email" v-model="email" placeholder="E-mail">
          <!-- Password input field -->
          <input class="form-control" type="password" v-model="password" placeholder="Password">
          <!-- Link to forgot password page -->
          <a href="/forgot-password" class="forgot-password">Forgot password</a>
          <!-- Submit button -->
          <button id="signIn" class="button btn btn-primary classic-button" type="submit">Sign in</button>
        </div>
      </form>

      <hr class="solid center">

      <!-- Registration section -->
      <div class="d-grid gap-3">
        <p class="p-login">
          Don’t have an account yet? <br>
          Sign up now
        </p>
        <!-- Button to navigate to the registration page -->
        <button id="register" class="button btn btn-primary classic-button" @click="refRegister">Register</button>
      </div>
    </div>
    <div class="waves"></div>
  </div>
</template>

<script>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { account } from '../appwrite';
import { useMessageStore } from '@/store/messages';

export default {
  setup() {
    const router = useRouter();
    const messageStore = useMessageStore();

    // Reactive variables for email and password input fields
    const email = ref('');
    const password = ref('');

    /**
     * @function refRegister
     * @description Navigates the user to the registration page.
     */
    const refRegister = () => {
      router.push({ name: 'register' });
    };

    /**
     * @function handleLogin
     * @description Handles the login process by creating an email-password session.
     * Displays success or error messages based on the response.
     */
    const handleLogin = async () => {
      const promise = account.createEmailPasswordSession(email.value, password.value);

      promise.then(
        function (response) {
          // Success: Navigate to the dashboard
          console.log(response);
          router.push('/dashboard');
        },
        function (error) {
          // Failure: Show error message
          console.log(error);
          messageStore.showAlert(error.message, "danger");
        }
      );
    };

    return {
      email,
      password,
      refRegister,
      handleLogin,
      messageStore
    };
  }
};
</script>

<style lang="scss" scoped>
@use "../../node_modules/bootstrap/scss/bootstrap" as *;
@import "@/style/typography.scss";
@import "@/style/animations.scss";

.login {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}

.login-container {
  width: 100%;
  max-width: 350px;
  padding: 20px;
}

.forgot-password {
  margin-top: -4%;
  float: right;
  margin-left: auto;
  margin-right: 0px;
  color: var(--Gray-500, #ADB5BD);
  @include font_properties(10px, 14px, 400);
}
</style>
