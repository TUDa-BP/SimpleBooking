import { mount, VueWrapper } from '@vue/test-utils';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import Settings from '@/views/Settings.vue';
import { useUserStore } from '@/stores/cleaned/user';
import { useMessageStore } from "@/stores/messages";
import { setActivePinia, createPinia } from 'pinia';
import router from '@/router';
import { type User } from '@/stores/cleaned/user';

const mockUser: User = {
    first_name: 'John',
    last_name: 'Doe',
    time_quota: null,
    activation_code: null,
    hardware_eligibility: false,
    role: ['user'],
    email: 'john.doe@example.com',
    placeBooking: null,
    hardwareBooking: null,
    $id: 'mockId',
    $createdAt: new Date().toISOString(),
    $updatedAt: new Date().toISOString(),
    $permissions: [],
    $databaseId: 'mockDatabaseId',
    $collectionId: 'mockCollectionId',
};



describe('Settings.vue', () => {
    let wrapper: VueWrapper<any>;
    let userStore: ReturnType<typeof useUserStore>;
    let messageStore: ReturnType<typeof useMessageStore>;

    beforeEach(() => {
        setActivePinia(createPinia());
        userStore = useUserStore();
        messageStore = useMessageStore();
        vi.spyOn(userStore, 'fetchUser').mockResolvedValue();
        userStore.user = mockUser;

        wrapper = mount(Settings, {
            global: {
                plugins: [router],
                stubs: {
                    'router-link': true,
                },
            },
        });
    });
    it('renders the component', () => {
        expect(wrapper.exists()).toBe(true);
    });

    it('toggles sidebar visibility', async () => {
        const toggleButton = wrapper.findComponent({ name: 'Sidebar' }).vm.$emit('toggleSidebar');
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.isSidebarVisible).toBe(false);
    });

    it('renders user personal data correctly', async () => {
        await wrapper.vm.$nextTick();
        console.log(wrapper.html());
        expect((wrapper.find('#firstName').element as HTMLInputElement).value).toBe('John');
        expect((wrapper.find('#lastName').element as HTMLInputElement).value).toBe('Doe');
        expect((wrapper.find('#email').element as HTMLInputElement).value).toBe('john.doe@example.com');
        expect(wrapper.text()).toContain('user');
        expect(wrapper.text()).toContain('No');
    });

    it('renders hardware eligibility message when user is not eligible', async () => {
        await wrapper.vm.$nextTick();
        expect(wrapper.text()).toContain('You are not authorized to borrow hardware. Activate your access now!');
    });
});
