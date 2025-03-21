import { mount } from '@vue/test-utils';
import { describe, it, expect } from 'vitest';
import TimeQuotaDisplay from '@/components/TimeQuotaDisplay.vue';

describe('TimeQuotaDisplay.vue', () => {
    it('renders correctly with positive timeQuota', () => {
        const wrapper = mount(TimeQuotaDisplay, {
            props: {
                timeQuota: 1500
            }
        });
        expect(wrapper.text()).toContain('1d 1h 0min');
        expect(wrapper.classes()).toContain('alert-success');
    });

    it('renders correctly with zero timeQuota', () => {
        const wrapper = mount(TimeQuotaDisplay, {
            props: {
                timeQuota: 0
            }
        });
        expect(wrapper.text()).toContain('0 min');
        expect(wrapper.classes()).toContain('alert-danger');
    });

    it('renders correctly with negative timeQuota', () => {
        const wrapper = mount(TimeQuotaDisplay, {
            props: {
                timeQuota: -10
            }
        });
        expect(wrapper.text()).toContain('0 min');
        expect(wrapper.classes()).toContain('alert-danger');
    });

    it('renders correctly with timeQuota less than a day', () => {
        const wrapper = mount(TimeQuotaDisplay, {
            props: {
                timeQuota: 90
            }
        });
        expect(wrapper.text()).toContain('1h 30min');
        expect(wrapper.classes()).toContain('alert-success');
    });
});
