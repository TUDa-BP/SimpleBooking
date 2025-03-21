import { mount } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AddRoom from '../AddRoom.vue';
import { useRoomStore } from '@/stores/cleaned/room';
import { useMessageStore } from '@/stores/messages';

vi.mock('@/stores/cleaned/room', () => ({
  useRoomStore: vi.fn(() => ({
    fetchRooms: vi.fn(),
    addRoom: vi.fn(),
    rooms: [],
  })),
}));

vi.mock('@/stores/messages', () => ({
  useMessageStore: vi.fn(() => ({
    showAlert: vi.fn(),
  })),
}));

describe('AddRoom.vue', () => {

  it('renders the form correctly', () => {
    const wrapper = mount(AddRoom);
    expect(wrapper.find('h1.title').text()).toBe('Add Room');
    expect(wrapper.find('form').exists()).toBe(true);
    expect(wrapper.find('input#capacity').exists()).toBe(true);
    expect(wrapper.find('input#buildingName').exists()).toBe(true);
    expect(wrapper.find('input#roomNumber').exists()).toBe(true);
    expect(wrapper.find('textarea#textAreaExample2').exists()).toBe(true);
    expect(wrapper.find('button[type="submit"]').exists()).toBe(true);
    expect(wrapper.find('button[type="button"]').exists()).toBe(true);
  });
  
  it('emits closeOverlay event when cancel button is clicked', async () => {
    const wrapper = mount(AddRoom);
    await wrapper.find('button[type="button"]').trigger('click');
    expect(wrapper.emitted()).toHaveProperty('closeOverlay');
  });
});
