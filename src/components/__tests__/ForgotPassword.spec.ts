import { describe, it, vi, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import ForgotPassword from '../ForgotPassword.vue';
import { createPinia } from 'pinia'
import { createApp } from 'vue';

// Mock router
vi.mock('vue-router', () => {
  return {
      useRoute: vi.fn(() => ({
          path: '/',
      })),
      useRouter: vi.fn(() => ({
          push: vi.fn(),
      })),
  };
});

describe('Forgot-Password Component', () =>{

    it('renders properly', () => {
        // Mock
        const app = createApp(ForgotPassword)
        const pinia = createPinia()
        app.use(pinia)
        const wrapper = mount(ForgotPassword, {
          global: {
            plugins: [pinia], 
          },
        })
        // Expect to be on forgot password page
        expect(wrapper.text()).toContain('Request a password recovery link')
    })
  
})
