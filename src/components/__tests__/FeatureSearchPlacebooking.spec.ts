import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import FeaturesSearchPlacebooking from '../FeaturesSearchPlacebooking.vue';
import { useFeatureStore } from '@/stores/cleaned/feature';
import { setActivePinia, createPinia } from 'pinia';

describe('FeaturesSearchPlacebooking.vue', () => {
    let wrapper: any;
    let featureStore: any;

    beforeEach(() => {
        setActivePinia(createPinia());
        wrapper = mount(FeaturesSearchPlacebooking, {
            global: {
                mocks: {
                    $store: {
                        state: {
                            features: [],
                        },
                        dispatch: vi.fn(),
                    },
                },
            },
        });
        featureStore = useFeatureStore();
    });

    it('renders correctly', () => {
        expect(wrapper.exists()).toBe(true);
    });

    it('filters features based on search query', async () => {
        featureStore.features = [
            { feature_name: 'Feature 1' },
            { feature_name: 'Feature 2' },
        ];
        await wrapper.vm.$nextTick();

        const input = wrapper.find('input');
        await input.setValue('Feature 1');
        expect(wrapper.vm.filteredFeatures).toEqual([{ feature_name: 'Feature 1' }]);
    });
});