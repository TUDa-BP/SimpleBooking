import { mount } from '@vue/test-utils';
import EditAccount from '@/views/EditUser.vue';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/stores/user', () => ({
    useUserStore: vi.fn().mockReturnValue({
      fetchUser: vi.fn(),
    }),
}));
  
vi.mock('@/stores/messages', () => ({
    useMessageStore: vi.fn().mockReturnValue({
      showLongAlert: vi.fn(),
    }),
}));
  

describe('EditAccount.vue', () => {
  it('renders the edit form correctly', () => {
    const user = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      role: 'admin',
      timeQuota: 60,
      hardwareEligibility: true,
    };

    const wrapper = mount(EditAccount, {
      props: { user },
    });

    // Überprüfe, ob die Eingabefelder existieren und die Werte korrekt sind
    expect((wrapper.find('input#firstName').element as HTMLInputElement).value).toBe('John');
    expect((wrapper.find('input#lastName').element as HTMLInputElement).value).toBe('Doe');
    expect((wrapper.find('input#email').element as HTMLInputElement).value).toBe('john@example.com');
    expect((wrapper.find('select#role').element as HTMLSelectElement).value).toBe('admin');
    expect((wrapper.find('input#timeQuota').element as HTMLInputElement).value).toBe('60');
    expect((wrapper.find('input#hardwareEligibility').element as HTMLInputElement).checked).toBe(true);

    // Überprüfe, ob die Buttons existieren
    expect(wrapper.find('button[type="submit"]').exists()).toBe(true);
    expect(wrapper.find('button[type="button"]').exists()).toBe(true);
  });
});
