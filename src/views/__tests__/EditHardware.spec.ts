import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils';
import EditHardware from '../../views/EditHardware.vue';

describe('EditHardware.vue', () => {
  const hardware = {
    hardware_name: 'Laptop',
    stock_number: 10,
    cost_center_number: 123,
    max_booking_time: 5,
    category: 'Laptops',
    storage_id: 1,
    room_number: '101',
    shelf_slot: 2
  };

  it('renders the form with hardware data', () => {
    const wrapper = mount(EditHardware, {
      props: { hardware }
    });
    expect((wrapper.find('input#hardware_name').element as HTMLInputElement).value).toBe(hardware.hardware_name);
    expect((wrapper.find('input#stock_number').element as HTMLInputElement).value).toBe(hardware.stock_number.toString());
    expect((wrapper.find('input#cost_center_number').element as HTMLInputElement).value).toBe(hardware.cost_center_number.toString());
    expect((wrapper.find('input#max_booking_time').element as HTMLInputElement).value).toBe(hardware.max_booking_time.toString());
    expect((wrapper.find('select#category').element as HTMLSelectElement).value).toBe(hardware.category);
    expect((wrapper.find('input#storage_id').element as HTMLInputElement).value).toBe(hardware.storage_id.toString());
    expect((wrapper.find('input#room_number').element as HTMLInputElement).value).toBe(hardware.room_number);
    expect((wrapper.find('input#shelf_slot').element as HTMLInputElement).value).toBe(hardware.shelf_slot.toString());
  });

  it('emits updateHardware event with hardware data on form submit', async () => {
    const wrapper = mount(EditHardware, {
      props: { hardware }
    });
    await wrapper.find('form').trigger('submit.prevent');
    expect(wrapper.emitted().updateHardware[0]).toEqual([hardware]);
  });

  it('emits closeOverlay event when cancel button is clicked', async () => {
    const wrapper = mount(EditHardware, {
      props: { hardware }
    });
    await wrapper.find('button[type="button"]').trigger('click');
    expect(wrapper.emitted().closeOverlay).toBeTruthy();
  });
});
