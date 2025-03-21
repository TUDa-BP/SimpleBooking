import { describe, it, vi, expect, afterEach, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia,setActivePinia } from 'pinia'
import { createApp } from 'vue';
import { useMessageStore } from '@/stores/messages'; 
import ResetPassword from '../ResetPassword.vue';

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

describe('Reset-Password Component', () =>{

  let messageStore: ReturnType<typeof useMessageStore>;

  beforeEach(() => {
    setActivePinia(createPinia());
    messageStore = useMessageStore();
    vi.useFakeTimers(); 
  });

  it('renders properly', () => {
      // Mock
      const app = createApp(ResetPassword)
      const pinia = createPinia()
      app.use(pinia)
      const wrapper = mount(ResetPassword, {
        global: {
          plugins: [pinia], 
        },
      })
      // Expect to be on reSet password page
      expect(wrapper.text()).toContain('Reset your password')
  })

  it('check watch(): password without any letters', async () => {
    const wrapper = mount(ResetPassword);

    const passwordInput = wrapper.find('input[placeholder="Password"]');
    await passwordInput.setValue('12345678');

    expect(messageStore.message).toBe('Password must contain at least one letter and one number');
  });

  it('check watch(): password without any numbers', async () => {
    const wrapper = mount(ResetPassword);

    const passwordInput = wrapper.find('input[placeholder="Password"]');
    await passwordInput.setValue('asdfjklö'); 

    expect(messageStore.message).toBe('Password must contain at least one letter and one number');
  });

  it('check watch(): password with length < 8', async () => {
    const wrapper = mount(ResetPassword);
  
    const passwordInput = wrapper.find('input[placeholder="Password"]');
    await passwordInput.setValue('short'); 
  
    expect(messageStore.message).toBe('Password must be at least 8 characters long');
  });

  it('check confirmation: password without any letters', async () => {
    const wrapper = mount(ResetPassword, {
      global: {
        plugins: [createPinia()],
      },
    });

    // Access store
    const messageStore = useMessageStore();
    const showMessageSpy = vi.spyOn(messageStore, 'showAlert');

    // Set password without letters
    const passwordInput = wrapper.find('input[placeholder="Password"]');
    const verifyPasswordInput = wrapper.find('input[placeholder="Confirm Password"]');
    await passwordInput.setValue('12345678');
    await verifyPasswordInput.setValue('12345678');

    // Send form
    const form = wrapper.find('form');
    await form.trigger('submit.prevent');

    // Check if showMessage was called
    expect(showMessageSpy).toHaveBeenCalledWith('Password must contain at least one letter and one number','danger');

    // Check store
    expect(messageStore.message).toBe('Password must contain at least one letter and one number');
  });

  it('check confirmation: password without any numbers', async () => {
    const wrapper = mount(ResetPassword, {
      global: {
        plugins: [createPinia()],
      },
    });

    // Access store
    const messageStore = useMessageStore();
    const showMessageSpy = vi.spyOn(messageStore, 'showAlert');

    // Set password without numbers
    const passwordInput = wrapper.find('input[placeholder="Password"]');
    const verifyPasswordInput = wrapper.find('input[placeholder="Confirm Password"]');
    await passwordInput.setValue('asdfjklö');
    await verifyPasswordInput.setValue('asdfjklö');

    // Send form
    const form = wrapper.find('form');
    await form.trigger('submit.prevent');

    // Check if showMessage was called
    expect(showMessageSpy).toHaveBeenCalledWith('Password must contain at least one letter and one number','danger');

    // Check store
    expect(messageStore.message).toBe('Password must contain at least one letter and one number');
  });

  it('check confirmation: password with length < 8', async () => {
    const wrapper = mount(ResetPassword, {
      global: {
        plugins: [createPinia()],
      },
    });

    // Access store
    const messageStore = useMessageStore();
    const showMessageSpy = vi.spyOn(messageStore, 'showAlert'); // Spion auf showMessage

    // Set password with length < 8
    const passwordInput = wrapper.find('input[placeholder="Password"]');
    const verifyPasswordInput = wrapper.find('input[placeholder="Confirm Password"]');
    await passwordInput.setValue('short');
    await verifyPasswordInput.setValue('short');

    // Send form
    const form = wrapper.find('form');
    await form.trigger('submit.prevent'); // Simuliere submit.prevent auf dem Formular

    // Check if showMessage was called
    expect(showMessageSpy).toHaveBeenCalledWith('Password must be at least 8 characters long','danger');

    // Check store
    expect(messageStore.message).toBe('Password must be at least 8 characters long');
  });

  it('check missmatched passwords', async () => {
    const wrapper = mount(ResetPassword, {
      global: {
        plugins: [createPinia()],
      },
    });

    // Access store
    const messageStore = useMessageStore();
    const showMessageSpy = vi.spyOn(messageStore, 'showAlert');

    // Set different password
    const passwordInput = wrapper.find('input[placeholder="Password"]');
    const verifyPasswordInput = wrapper.find('input[placeholder="Confirm Password"]');
    await passwordInput.setValue('123wre4567dd');
    await verifyPasswordInput.setValue('123wre4567gd');

    // Send form
    const form = wrapper.find('form');
    await form.trigger('submit.prevent');

    // Check if showMessage was called
    expect(showMessageSpy).toHaveBeenCalledWith('Passwords do not match!','danger');

    // Check store
    expect(messageStore.message).toBe('Passwords do not match!');
  });

  it('check message deletion after 3 sec', async () => {
    const wrapper = mount(ResetPassword);

    const passwordInput = wrapper.find('input[placeholder="Password"]');
    await passwordInput.setValue('short'); 

    expect(messageStore.message).toBe('Password must be at least 8 characters long');

    vi.advanceTimersByTime(3000); 
    expect(messageStore.message).toBe(''); 
  });

  afterEach(() => {
    // Reset all mocked calls & timersbetween tests
    vi.clearAllMocks(); 
    vi.useRealTimers(); 
  });
    
});