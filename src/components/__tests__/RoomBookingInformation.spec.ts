import { mount, VueWrapper } from '@vue/test-utils';
import { nextTick } from 'vue';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import RoomBookingInformation from '../RoomBookingInformation.vue';
import { useRoomBookingStore } from '@/stores/cleaned/roomBooking';
//import { useRoomStore } from '@/stores/cleaned/room';
//import { useUserStore } from '@/stores/cleaned/user';
//import { useMessageStore } from '@/stores/messages';

vi.mock('../../stores/cleaned/roomBooking', () => ({
    useRoomBookingStore: vi.fn().mockReturnValue({
        bookedSlots: [],
            notBookedSlots: [],
            computeSelectedSlotsDuration: 0,
            bookRoom: vi.fn(),
    })
}));

vi.mock('@/stores/cleaned/room', () => ({
    useRoomStore: vi.fn().mockReturnValue(
        { 
            filteredRooms: [
            {
                room_number: "S101",
                num_places: 14,
                description: 'Room description',
                place: []
            },
        ],
        fetchRooms: vi.fn()
    })
}
));

vi.mock('../../stores/cleaned/user', () => ({
    useUserStore: vi.fn().mockReturnValue({
        user: { time_quota: 100 },
        isStudent: true,
        fetchUser: vi.fn(),
    })
}
));

vi.mock('../../stores/messages', () => ({
    useMessageStore: vi.fn().mockReturnValue({
        showAlert: vi.fn(),
    })
}
));

describe('RoomBookingInformation.vue', () => {
    let wrapper: VueWrapper<any>;

    beforeEach(() => {
        wrapper = mount(RoomBookingInformation, {
            props: {
                index: 0,
            },
        });
    });

    it('opens overlay on button click', async () => {
        await wrapper.find('button').trigger('click');
        expect(wrapper.findComponent({ name: 'Overlay' }).exists()).toBe(true);
    });

    it('displays place and room descriptions', async () => {
        await wrapper.find('button').trigger('click');
        expect(wrapper.html()).toContain('Room description');
    });


    it('books place and shows overview', async () => {
        const roomBookingStore = useRoomBookingStore();
        const showRoomBookingSpy = vi.spyOn(roomBookingStore, 'bookRoom');
        let button = wrapper.find('button');
        expect(button.exists()).toBe(true);
        await button.trigger('click');
        button = wrapper.find('.overlay-buttongroup button');
        expect(button.exists()).toBe(true);
        await button.trigger('click');
        expect(showRoomBookingSpy).toHaveBeenCalled();
        expect(wrapper.html()).toContain('Room booked successfully');
    });

    it('closes overlay on cancel button click', async () => {
        const closeOverlaySpy = vi.spyOn(wrapper.vm, 'closeOverlay');
        
        let button = wrapper.find('button');
        expect(button.exists()).toBe(true);
        await button.trigger('click');

        button = wrapper.find('.overlay-buttongroup button:last-child');
        expect(button.exists()).toBe(true);
        await button.trigger('click');

        expect(closeOverlaySpy).toHaveBeenCalled();
    });

});