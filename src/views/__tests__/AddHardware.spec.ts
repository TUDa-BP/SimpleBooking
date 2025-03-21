import { mount } from '@vue/test-utils';
import { describe, it, expect, vi } from 'vitest';
import AddHardware from '@/views/AddHardware.vue';
import { useHardwareStore } from '@/stores/cleaned/hardware';

vi.mock('@/appwrite');
vi.mock('@/stores/messages', () => ({
  useMessageStore: vi.fn(() => ({
    showLongAlert: vi.fn(),
  })),
}));

vi.mock('@/stores/cleaned/storageLocation', () => ({
  useStorageLocationStore: vi.fn().mockReturnValue({
    fetchOrCreateStorageLocation: vi.fn().mockResolvedValue('storageLocationID'),
  }),
}));


vi.mock('@/stores/cleaned/hardware', () => ({
  useHardwareStore: vi.fn().mockReturnValue({
    addHardware: vi.fn(),
  }),
}));

describe('AddHardware.vue', () => {
  it('renders the form correctly', () => {
    const wrapper = mount(AddHardware);

    expect(wrapper.find('input#hardware_name').exists()).toBe(true);
    expect(wrapper.find('input#stock_number').exists()).toBe(true);
    expect(wrapper.find('input#cost_center_number').exists()).toBe(true);
    expect(wrapper.find('input#max_booking_time').exists()).toBe(true);
    expect(wrapper.find('select#category').exists()).toBe(true);
    expect(wrapper.find('input#storage_id').exists()).toBe(true);
    expect(wrapper.find('input#room_number').exists()).toBe(true);
    expect(wrapper.find('input#shelf_slot').exists()).toBe(true);
  });

  it('emits closeOverlay event when cancel button is clicked', async () => {
    const wrapper = mount(AddHardware);
    await wrapper.find('button[type="button"]').trigger('click');
    expect(wrapper.emitted().closeOverlay).toBeTruthy();
  });

  it('calls addHardware method on form submit', async () => {
    const hardwareStore = useHardwareStore();
    const wrapper = mount(AddHardware);
  
    // Form absenden
    await wrapper.find('form').trigger('submit.prevent');
    await wrapper.vm.$nextTick();
  
    // Prüfen, ob addHardware im Store aufgerufen wurde
    expect(hardwareStore.addHardware).toHaveBeenCalled();
  });
  
  
});
