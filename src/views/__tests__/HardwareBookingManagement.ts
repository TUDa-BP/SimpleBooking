import { mount } from '@vue/test-utils';
import { describe, it, vi, expect, afterEach } from 'vitest';
import HardwareBookingManagement from '../HardwareBookingManagement.vue';
import { createPinia } from 'pinia'
import { nextTick,createApp } from 'vue';
import { useRouter } from 'vue-router';
import { beforeEach } from 'node:test';

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


describe('HardwareBookingManagement', () => {
    it('renders correctly', () => {
        // Mock
        const app = createApp(HardwareBookingManagement)
        const pinia = createPinia()
        app.use(pinia)
        const wrapper = mount(HardwareBookingManagement, {
          global: {
            plugins: [pinia], 
          },
        })
        expect(wrapper.exists()).toBe(true);
    });

    it('renders the correct title', () => {
        // Mock
        const app = createApp(HardwareBookingManagement)
        const pinia = createPinia()
        app.use(pinia)
        const wrapper = mount(HardwareBookingManagement, {
          global: {
            plugins: [pinia], 
          },
        })
        const title = wrapper.find('h1');
        expect(title.text()).toBe('Manage Hardware Bookings');
    });

    it('displays "No hardware bookings found!" when there are no bookings', async () => {
        const wrapper = mount(HardwareBookingManagement, {
          global: {
            mocks: {
              $store: {
                state: {
                  hardwareBookingStore: {
                    bookings: []
                  }
                },
                dispatch: vi.fn()
              }
            }
          }
        });
    
        await wrapper.vm.$nextTick();
    
        expect(wrapper.html()).toContain('No hardware bookings found!');
      });

});