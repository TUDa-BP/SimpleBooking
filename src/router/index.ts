import { createRouter, createWebHistory } from 'vue-router'
import { account } from '../appwrite';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'login',
      component: () => import('@/views/Login.vue')
    },
    {
      path: '/register/:token?', // token is optional that is why we use ?
      name: 'register',
      component: () => import('@/views/Register.vue')
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('@/views/Dashboard.vue')
    },
    {
      path: '/forgot-password',
      name: 'forgotPassword',
      component: () => import('@/views/ForgotPassword.vue')
    },
    {
      path: '/reset-password',
      name: 'resetPassword',
      component: () => import('@/views/ResetPassword.vue')
    },
    {
      path: '/hardware-booking-management',
      name: 'hardware-booking-management',
      component: () => import('@/views/HardwareBookingManagement.vue')
    },
    {
      path: '/hardwaremanagement',
      name: 'hardwaremanagement',
      component: () => import('@/views/Hardwaremanagement.vue')
    },
    {
      path: '/roommanagement',
      name: 'roommanagement',
      component: () => import('@/views/Roommanagement.vue')
    },
    {
      path: '/accountmanagement',
      name: 'accountmanagement',
      component: () => import('@/views/Accountmanagement.vue')
    },
    {
      path: '/room-booking',
      name: 'roomBooking',
      component: () => import('@/views/RoomBooking.vue')
    },
    {
      path: '/place-booking',
      name: 'place-booking',
      component: () => import('@/views/PlaceBooking.vue')
    },
    { path: '/hardware-booking',
      name: 'hardware-booking',
      component: () => import('@/views/HardwareBooking.vue')
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('@/views/Settings.vue')
    }
  ],
})

// Route Guard
router.beforeEach(async (to, from, next) => {
  try {
    const user = await account.get();
    console.log(user)
    if (to.path === "/" && user) {
      return next("/dashboard");
    }

    if(user.labels.includes("student") && to.path === "/room-booking"){
      return next("/dashboard");
    }

    if(!user.labels.includes("admin") && to.path.includes("management")){
      return next("/dashboard");
    }

    next();
  } catch (error) {

    const isWhitelisted = to.path === "/" || to.path === "/forgot-password" || to.path === "/reset-password" || to.path === "/register";
    if (!isWhitelisted) {
      return next("/");
    }

    next();
  }
});

export default router
