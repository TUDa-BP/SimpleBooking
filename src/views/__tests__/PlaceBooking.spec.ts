import { mount } from '@vue/test-utils';
import PlaceBooking from '@/views/PlaceBooking.vue';
import { setActivePinia, createPinia } from 'pinia';
import { describe, it, expect, beforeEach } from 'vitest';
import router from '@/router';
import { type Place } from '../../stores/cleaned/place';
import { usePlaceStore } from '../../stores/cleaned/place';


export const mockPlaces: Place[] = [
    {
        place_id: 1,
        description: "Co-working Space A",
        deactivated: false,
        placeBooking: [],
        room: {
            room_number: "A1",
            num_places: 4,
            description: "Small meeting room",
            deactivated: false,
            $id: "room_001",
            $createdAt: new Date().toISOString(),
            $updatedAt: new Date().toISOString(),
            $permissions: ["read"],
            $databaseId: "db_004",
            $collectionId: "col_005",
        },
        feature: [
            {
                feature_name: "Projector",
                $id: "feature_001",
                $createdAt: new Date().toISOString(),
                $updatedAt: new Date().toISOString(),
          $permissions: ["read"],
          $databaseId: "db_006",
          $collectionId: "col_007",
        },
      ],
      $id: "place_001",
      $createdAt: new Date().toISOString(),
      $updatedAt: new Date().toISOString(),
      $permissions: ["read"],
      $databaseId: "db_008",
      $collectionId: "col_009",
    },
  ];

describe('PlaceBooking.vue', () => {
    let wrapper : any;

    beforeEach(() => {
        setActivePinia(createPinia());
        wrapper = mount(PlaceBooking, {
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


    it('shows no places available message when filteredPlaces is empty', async () => {
        wrapper.vm.filteredPlaces = [];
        await wrapper.vm.$nextTick();
        const message = wrapper.find('p.text-center');
        expect(message.exists()).toBe(true);
        expect(message.text()).toBe('No places available for the selected time period or features or the given PlaceID');
    });

    it('renders places table when filteredPlaces is not empty', async () => {
        const placeStore = usePlaceStore();
        placeStore.filteredPlaces = mockPlaces;
        await wrapper.vm.$nextTick();
        const table = wrapper.find('table');
        
        expect(table.exists()).toBe(true);
        const rows = wrapper.findAll('tbody tr');
        expect(rows.length).toBe(1);

        expect(true).toBe(true);
    });
});
