import { ref } from 'vue';
import { mount } from '@vue/test-utils';
import { describe, it, expect } from 'vitest';
import RoomBookingSlotButton from '@/components/PlaceBookingSlotButton.vue';

describe('RoomBookingSlotButton.vue', () => {
    const slot = ref({
        isBookableForYou: true,
        start_time: new Date('2023-10-10T10:00:00'),
        end_time: new Date('2023-10-10T11:00:00'),
        booking_selected_booking_type: 'room',
        booking: {
            booking_type: 'room'
        }
    });
    const checked = ref(false);
    const showBookedBy = ref(true);

    const handleUpdateChecked = (newChecked: boolean) => {
        checked.value = newChecked;
    };

    it('renders correctly when slot is bookable', () => {
        const wrapper = mount(RoomBookingSlotButton, {
            props: {
                slot: slot.value,
                checked: checked.value,
                showBookedBy: showBookedBy.value
            }
        });
        expect(wrapper.find('button').exists()).toBe(true);
        expect((wrapper.find('input[type="checkbox"]').element as HTMLInputElement).checked).toBe(false);
        expect(wrapper.find('span').text()).toBe('10:00 - 11:00');
    });

    it('renders correctly when slot is not bookable', () => {
        slot.value.isBookableForYou = false;
        const wrapper = mount(RoomBookingSlotButton, {
            props: {
                slot: slot.value,
                checked: checked.value,
                showBookedBy: showBookedBy.value
            }
        });
        expect(wrapper.find('div.disabled').exists()).toBe(true);
        expect(wrapper.find('span').text()).toBe('10:00 - 11:00');
    });

    it('toggles checkbox state on button click', async () => {
        slot.value.isBookableForYou = true;
        const wrapper = mount(RoomBookingSlotButton, {
            props: {
                slot: slot.value,
                checked: checked.value,
                showBookedBy: showBookedBy.value,
                'onUpdate:checked': handleUpdateChecked
            }
        });
        await wrapper.find('button').trigger('click');
        expect(checked.value).toBe(true);
        await wrapper.find('button').trigger('click');
        expect(checked.value).toBe(false);
    });

    it('applies correct class based on booking type', () => {
        const wrapper = mount(RoomBookingSlotButton, {
            props: {
                slot: slot.value,
                checked: checked.value,
                showBookedBy: showBookedBy.value
            }
        });
        expect(wrapper.find('button').classes()).toContain('booking-type-room');
    });
});