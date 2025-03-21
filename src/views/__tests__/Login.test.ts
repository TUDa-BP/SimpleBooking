// LoginPage.spec.ts
import { describe, it, vi, expect, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import LoginPage from '../Login.vue';
import { createPinia } from 'pinia'
import { nextTick,createApp } from 'vue';
import { useRouter } from 'vue-router';

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


describe('Login Component', () => {

  it('renders properly', () => {
    // Mock
    const app = createApp(LoginPage)
    const pinia = createPinia()
    app.use(pinia)
    const wrapper = mount(LoginPage, {
      global: {
        plugins: [pinia], 
      },
    })
    
    // Expect to be on login page
    expect(wrapper.text()).toContain('Login')
  })
  
  it('redirect to register page', async () => {
    // Mock
    const pushMock = vi.fn();
    const useRouterMock = useRouter as jest.Mock<any, any>;
    useRouterMock.mockReturnValue({ push: pushMock });

    // Mount login page
    const wrapper = mount(LoginPage);

    // Click of register button
    await wrapper.find('button[id="register"]').trigger('click');
    await nextTick();

    // Expect to be on register page
    expect(pushMock).toHaveBeenCalledTimes(1);
    expect(pushMock).toHaveBeenCalledWith({ name: 'register' });
    expect(wrapper.text()).toContain('Register')
  });

  afterEach(() => {
    // Reset all mocked calls between tests
    vi.clearAllMocks(); 
  });
});
