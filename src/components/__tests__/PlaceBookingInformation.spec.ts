import { mount, VueWrapper } from '@vue/test-utils';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import PlaceBookingInformation from '../PlaceBookingInformation.vue';
import { usePlaceBookingStore } from '../../stores/cleaned/placeBooking';
import { usePlaceStore } from '@/stores/cleaned/place';
import { useUserStore } from '../../stores/cleaned/user';
import { useMessageStore } from '../../stores/messages';

vi.mock('../../stores/cleaned/placeBooking');
vi.mock('@/stores/cleaned/place');
vi.mock('../../stores/cleaned/user');
vi.mock('../../stores/messages');

describe('PlaceBookingInformation.vue', () => {
    let wrapper: VueWrapper<any>;

    beforeEach(() => {
        usePlaceBookingStore.mockReturnValue({
            bookedSlots: [],
            notBookedSlots: [],
            computeSelectedSlotsDuration: 0,
            availableSlotsContainsReservedSlots: false,
            bookPlace: vi.fn(),
        });

        usePlaceStore.mockReturnValue({
            filteredPlaces: [
                {
                    place: {
                        id: 1,
                        feature: [{ $id: 1, feature_name: 'Feature 1' }],
                        description: 'Place description',
                        room: {
                            room_number: 101,
                            description: 'Room description',
                            num_places: 10,
                        },
                    },
                },
            ],
            fetchPlaces: vi.fn(),
        });

        useUserStore.mockReturnValue({
            user: { time_quota: 100 },
            isStudent: true,
            fetchUser: vi.fn(),
        });

        useMessageStore.mockReturnValue({
            showAlert: vi.fn(),
        });

        wrapper = mount(PlaceBookingInformation, {
            props: {
            place: {
                id: 1,
                feature: [{ $id: 1, feature_name: 'Feature 1' }],
                description: 'Place description',
                room: {
                room_number: 101,
                description: 'Room description',
                num_places: 10,
                },
            },
            },
        });
    });

    it('opens overlay on button click', async () => {
        await wrapper.find('button').trigger('click');
        expect(wrapper.findComponent({ name: 'Overlay' }).exists()).toBe(true);
    });

    it('displays place and room descriptions', async () => {
        await wrapper.find('button').trigger('click');
        expect(wrapper.html()).toContain('Place description');
        expect(wrapper.html()).toContain('Room description');
    });

    it('books place and shows overview', async () => {
        await wrapper.find('button').trigger('click');
        await wrapper.find('.overlay-buttongroup button').trigger('click');
        expect(usePlaceBookingStore().bookPlace).toHaveBeenCalled();
        expect(wrapper.html()).toContain('Place booked successfully');
    });

});