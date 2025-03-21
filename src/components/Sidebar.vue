<template>
  <div>

    <!-- Button to show Sidebar -->
    <button v-if="!is_visible" class="icon-button show-sidebar classic-button" @click="toggleSidebar">
      <i class="bi bi-list"></i>
    </button>

    <!-- Transition Wrapper um die Sidebar -->
    <transition name="sidebar-slide">
      <aside v-if="is_visible" class="sidebar">
        <!-- Button to hide Sidebar -->
        <button class="icon-button hide-sidebar classic-button" @click="toggleSidebar">
          <i class="bi bi-list"></i>
        </button>

        <!-- Navigation -->
        <div class="mt-5">
          <ul class="nav flex-column">
            <router-link to="/dashboard" class="sidebar-button">
              <i class="bi bi-house-door"></i> 
              <span class="text"> &nbsp; Dashboard </span>
            </router-link>

            <router-link to="/place-booking" class="sidebar-button">
              <i class="bi bi-calendar-event"></i> 
              <span class="text"> &nbsp; Place Booking </span>
            </router-link>

            <!-- Room Booking only visible for admins and phd students -->
            <template v-if="userStore.user?.role.includes('admin') || userStore.user?.role.includes('phd')">
              <router-link to="/room-booking" class="sidebar-button">
                <i class="bi bi-door-open"></i> 
                <span class="text"> &nbsp; Room Booking </span>
              </router-link>
            </template>

            <router-link to="/hardware-booking" class="sidebar-button">
              <i class="bi bi-cpu"></i> 
              <span class="text"> &nbsp; Hardware Booking </span>
            </router-link>

            <!-- Hidden part of the navigation, only visible for admins -->
            <template v-if="userStore.user?.role.includes('admin')">
              <div class="management-button">
                <button class="sidebar-button classic-button">
                  <i class="bi bi-clipboard-data"></i> 
                  <span class="text"> &nbsp; Management </span>
                </button>
                <div class="management-links">
                  <router-link to="/roommanagement" class="sidebar-button" data-testid="room-management">
                    <i class="bi bi-key"></i> 
                    <span class="text"> &nbsp; Room Management </span>
                  </router-link>

                  <router-link to="/hardwaremanagement" class="sidebar-button" data-testid="hardware-management">
                    <i class="bi bi-tools"></i> 
                    <span class="text"> &nbsp; Hardware Management </span>
                  </router-link>

                  <router-link to="/hardware-booking-management" class="sidebar-button" data-testid="hardware-booking-management">
                    <i class="bi bi-usb-drive"></i> 
                    <span class="text"> &nbsp; Booked Hardware </span>
                  </router-link>

                  <router-link to="/accountmanagement" class="sidebar-button" data-testid="account-management">
                    <i class="bi bi-person"></i> 
                    <span class="text"> &nbsp; Account Management </span>
                  </router-link>
                </div>
              </div>
            </template>

          </ul>
        </div>

        <!-- Bottom navigation -->
        <div class="bottom-navigation">
          <ul class="nav flex-column">

            <router-link to="/settings" class="sidebar-button">
              <i class="bi bi-gear"></i>
              <span class="text"> &nbsp; Settings </span>
            </router-link>

            <!-- button instead of router-link for the logout function -->
            <button class="sidebar-button classic-button" @click="handleLogout" data-testid="logout-button">
              <i class="bi bi-door-closed"></i>
              <span class="text"> &nbsp; Logout </span>
            </button>
          
          </ul>
        </div>

        <!-- Wave on the Bottom of the sidebar-->
        <img src="@/assets/wave-sidebar.svg" alt="Wave" class="wave" />

      </aside>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { account} from '../appwrite';
import { useMessageStore } from '@/store/messages';
import { useUserStore } from '@/store/user';

const userStore = useUserStore();
const router = useRouter();
const messageStore = useMessageStore();

const emit = defineEmits(['toggleSidebar']);

/**
 * Props and sidebar visibility
 * @typedef {Object} Props
 * @property {boolean} isSidebarVisible - Determines if the sidebar is visible
 */
const props = defineProps({
  isSidebarVisible: {
    type: Boolean,
    required: true
  }
});
const is_visible = ref(props.isSidebarVisible);

/**
 * Retrieves user information for admin recognition
 */
onMounted(() => {
  userStore.fetchUser();
});

/**
 * Function to toggle the sidebar visibility
 */
function toggleSidebar() {
  is_visible.value = !is_visible.value;
  emit('toggleSidebar');
}

/**
 * Function to handle user logout
 */
const handleLogout = async () => {
  try {
    await account.deleteSession('current');
    router.push('/');
  } catch (error) {
    console.log(error);
    messageStore.showLongAlert(error.message, 'danger');
  }
};
</script>

<style lang="scss" scoped>
@use "../../node_modules/bootstrap/scss/bootstrap" as *;
@use "../../node_modules/bootstrap-icons/font/bootstrap-icons" as *;

// Icons
.bi {
  font-size: 24px;
  color: #54595e;
}

// Menu-button to toggle the sidebar
.icon-button{
  background-color: transparent !important;
	width: 3rem;
	height: 3rem;
  z-index: 10;
	&:hover {
		background-color: $indigo-200 !important;
    i {
      color: white;
    }
    border-radius: 10px;
    transform: scale(1.1);
	}
}

// Button to show the sidebar
.show-sidebar {
  position: fixed; 
  top: 0.5rem;
  left: 0.5rem;
}

// Common styling for sidebar buttons
.sidebar-button {
  display: flex;
  align-items: center;
  text-decoration: none;
  padding: 0.5rem 1rem;
  background: none !important;
  width: 100%;	
  z-index: 10;
  &:hover {
    background-color: $indigo-200 !important; 
    border-radius: 10px;
    i, .text {
      color: $indigo-600;
    }
  }
  &.router-link-exact-active {
    background-color: #6610f2 !important;
    border-radius: 10px;
		i, .text {
			color: white;
		}
  }
}

// Management button and links
.management-button {
  position: relative;
  z-index: 10;
}
.management-links {
  display: none;
  flex-direction: column;
  position: fixed;
  top: 271px;
  left: 254px;
  border-radius: 10px;
  background-color: #ebe5fc;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.5);
  z-index: 2000; 
}

.management-button:hover .management-links {
  display: flex;
}

// Sidebar and everything it contains
.sidebar {
  display: flex;
  flex-direction: column;
  width: 270px;
  height: 100vh; 
  background-color: #ebe5fc;
  color: #54595e;

  padding: 1rem;
  position: fixed;
  overflow: hidden;
  top: 0;
  left: 0;
  overflow-y: auto;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}

// Text for the navigation links
.text {
  color: #54595e;
  text-decoration: none;
}

// Button to hide the sidebar
.hide-sidebar {
  position: absolute; 
  top: 0.5rem;
  left: 0.5rem;
}

// Bottom navigation and everything it contains
.bottom-navigation {
  margin-top: auto;
  z-index: 10;
}

// Wave at the bottom of the sidebar
.wave {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: auto;
  z-index: 1;
}

// Transition animation for the sidebar
.sidebar-slide-enter-active, 
.sidebar-slide-leave-active {
  transition: transform 0.5s ease, opacity 0.5s ease;
}
.sidebar-slide-enter-from,
.sidebar-slide-leave-to {
  transform: translateX(-100%);
  opacity: 0;
}
.sidebar-slide-enter-to,
.sidebar-slide-leave-from{
  transform: translateX(0);
  opacity: 1;
}
</style>