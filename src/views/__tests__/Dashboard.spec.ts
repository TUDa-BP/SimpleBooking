import { mount } from '@vue/test-utils';
import { describe, it, expect, beforeEach,vi } from 'vitest';
import Dashboard from '../Dashboard.vue';
import { setActivePinia, createPinia } from 'pinia';
import { useRouter } from 'vue-router';
import { nextTick } from 'vue';

// Mocken des vue-router Moduls
vi.mock("vue-router", () => ({
  useRoute: vi.fn(() => ({
    path: '/dashboard',
    })),
    useRouter: vi.fn(() => ({
        push: vi.fn(),
    })),
}));
  

describe('Dashboard', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('renders table headers correctly', () => {

    const wrapper = mount(Dashboard);
    const headers = wrapper.findAll('th');
    expect(headers.length).toBe(16);

    expect(headers[0].text()).toBe('#');
    expect(headers[1].text()).toBe('Time Slot');
    expect(headers[2].text()).toBe('Room');
    expect(headers[3].text()).toBe('Number of Places');
    expect(headers[4].text()).toBe('Action');
    expect(headers[5].text()).toBe('#');
    expect(headers[6].text()).toBe('Time Slot');
    expect(headers[7].text()).toBe('Room');
    expect(headers[8].text()).toBe('Place');
    expect(headers[9].text()).toBe('Action');
    expect(headers[10].text()).toBe('#');
    expect(headers[11].text()).toBe('Booking Duration');
    expect(headers[12].text()).toBe('Item');
    expect(headers[13].text()).toBe('[SN/CCN]');    
    expect(headers[14].text()).toBe('Storage Location');
    expect(headers[15].text()).toBe('Action');
  });

  it('renders card headers correctly', () => {
    const wrapper = mount(Dashboard);
    const cardHeaders = wrapper.findAll('.card-header');
    expect(cardHeaders.length).toBe(3);
    expect(cardHeaders[0].text()).toBe('Room Booking');
    expect(cardHeaders[1].text()).toBe('Place Booking');
    expect(cardHeaders[2].text()).toBe('Hardware Booking');
  });

  it('button forwarding room booking', async () => {
    const pushMock = vi.fn();
    const useRouterMock = useRouter as vi.Mock<any, any>;
    useRouterMock.mockReturnValue({ push: pushMock });

    const wrapper = mount(Dashboard);
    const button = wrapper.find('#bookRoom')

    expect(button.text()).toContain("Book Room Now");
    await button.trigger("click");
    await nextTick();

    // Expect to be on register page
    expect(pushMock).toHaveBeenCalledTimes(1);
    expect(pushMock).toHaveBeenCalledWith("/room-booking");
  });

  it('button forwarding place booking', async () => {
    const pushMock = vi.fn();
    const useRouterMock = useRouter as vi.Mock<any, any>;
    useRouterMock.mockReturnValue({ push: pushMock });

    const wrapper = mount(Dashboard);
    const button = wrapper.find('#bookPlace')

    expect(button.text()).toContain("Book Place Now");
    await button.trigger("click");
    await nextTick();

    // Expect to be on register page
    expect(pushMock).toHaveBeenCalledTimes(1);
    expect(pushMock).toHaveBeenCalledWith("/place-booking");
  });

  it('button forwarding hardware booking', async () => {
    const pushMock = vi.fn();
    const useRouterMock = useRouter as vi.Mock<any, any>;
    useRouterMock.mockReturnValue({ push: pushMock });

    const wrapper = mount(Dashboard);
    const button = wrapper.find('#bookHardware')

    expect(button.text()).toContain("Book Hardware Now");
    await button.trigger("click");
    await nextTick();

    // Expect to be on register page
    expect(pushMock).toHaveBeenCalledTimes(1);
    expect(pushMock).toHaveBeenCalledWith("/hardware-booking");
  });

});
