import { mount } from '@vue/test-utils';
import AccountManagement from '@/views/AccountManagement.vue';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { ref, computed, type Ref } from 'vue';

vi.mock('@/stores/cleaned/user', () => ({
    useUserStore: vi.fn().mockReturnValue({
      fetchUser: vi.fn(),
    }),
}));
  
vi.mock('@/stores/messages', () => ({
    useMessageStore: vi.fn().mockReturnValue({
      showLongAlert: vi.fn(),
    }),
}));

let users: Ref<{ $id: number; first_name: string; last_name: string; email: string; role: string; time_quota: number; hardware_eligibility: boolean; }[], { $id: number; first_name: string; last_name: string; email: string; role: string; time_quota: number; hardware_eligibility: boolean; }[] | { $id: number; first_name: string; last_name: string; email: string; role: string; time_quota: number; hardware_eligibility: boolean; }[]>;

beforeEach(() => {
  users = ref([
    { $id: 1, first_name: 'John', last_name: 'Doe', email: 'john@example.com', role: 'admin', time_quota: 60, hardware_eligibility: true },
  ]);
});

describe('AccountManagement.vue', () => {
  it('renders correctly', async () => {
    const wrapper = mount(AccountManagement, {
      setup() {
        const searchQuery = ref('');
        const searchAccounts = computed(() => {
          return users.value.filter((user) => {
            const query = searchQuery.value.toLowerCase();
            return (
              user.first_name.toLowerCase().includes(query) ||
              user.last_name.toLowerCase().includes(query)
            );
          });
        });
        return { users, searchQuery, searchAccounts };
      },
    });

    // Wait for the next DOM update cycle
    await wrapper.vm.$nextTick();

    // Set searchQuery to an empty string to ensure no filtering is applied
    wrapper.vm.searchQuery = '';
    await wrapper.vm.$nextTick();

    // Log the length of the users array
    console.log('Users length:', wrapper.vm.users.length);

    // Check if the header exists
    expect(wrapper.find('h1').text()).toBe('Manage Accounts');

    // Check if the search bar exists
    expect(wrapper.find('input[type="search"]').exists()).toBe(true);

    // Update the selector to use the data-testid attribute
    const AccountButton = wrapper.find('[data-testid="add-account-button"]');
    expect(AccountButton.exists()).toBe(true);
    const ImportButton = wrapper.find('[data-testid="import-csv-button"]');
    expect(ImportButton.exists()).toBe(true);

    // Wait for the next DOM update cycle again to ensure the table is rendered
    await wrapper.vm.$nextTick();

    // Check if the table exists
    const table = wrapper.find('table');
    expect(table.exists()).toBe(true);

    // Check if the user is rendered in the table
    const rows = wrapper.findAll('tbody tr');
    console.log('Table rows count:', rows.length);
    expect(rows.length).toBeGreaterThan(0);
    expect(wrapper.text()).toContain('John Doe');
    expect(wrapper.text()).toContain('john@example.com');
    expect(wrapper.text()).toContain('admin');
  });

  it('should toggle sidebar visibility', async () => {
    const wrapper = mount(AccountManagement);

    const sidebarButton = wrapper.find('button');
    expect(sidebarButton.exists()).toBe(true); // Ensure the button exists
    await sidebarButton.trigger('click');

    await sidebarButton.trigger('click');
    expect(wrapper.vm.isSidebarVisible).toBe(true);
  });
  
  it('should open ImportCourseList overlay on button click', async () => {
    const wrapper = mount(AccountManagement);

    // Find the button using the data-testid attribute
    const overlayButton = wrapper.find('[data-testid="import-csv-button"]');
    expect(overlayButton.exists()).toBe(true);

    // Initial state of the overlay
    expect(wrapper.vm.isImportListOverlayOpen).toBe(false);

    // Simulate button click
    await overlayButton.trigger('click');

    // Wait for DOM update
    await wrapper.vm.$nextTick();

    // Check if the overlay is rendered
    const overlay = wrapper.findComponent({ name: 'Overlay' });
    expect(overlay.exists()).toBe(true);
    expect(wrapper.vm.isImportListOverlayOpen).toBe(true);
  });

  it('should open Add Account overlay on button click', async () => {
    const wrapper = mount(AccountManagement);

    // Find the button using the data-testid attribute
    const overlayButton = wrapper.find('[data-testid="add-account-button"]');
    expect(overlayButton.exists()).toBe(true);

    // Initial state of the overlay
    expect(wrapper.vm.isAccountOverlayOpen).toBe(false);

    // Simulate button click
    await overlayButton.trigger('click');

    // Wait for DOM update
    await wrapper.vm.$nextTick();

    // Check if the overlay is rendered
    const overlay = wrapper.findComponent({ name: 'Overlay' });
    expect(overlay.exists()).toBe(true);
    expect(wrapper.vm.isAccountOverlayOpen).toBe(true);
  });

});
