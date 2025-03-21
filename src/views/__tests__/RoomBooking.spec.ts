import { mount } from '@vue/test-utils';
import RoomBooking from '@/views/RoomBooking.vue';
import { setActivePinia, createPinia } from 'pinia';
import { describe, it, expect, beforeEach } from 'vitest';
import router from '@/router';
import { type Room } from '../../stores/cleaned/room';
import { useRoomStore } from '../../stores/cleaned/room';

export const mockRooms: Room[] = [
    {
      room_number: "A1",
      description: "Small meeting room",
      num_places: 4,
      deactivated: false,
      place: [ ],
      $id: "room_001",
      $createdAt: new Date().toISOString(),
      $updatedAt: new Date().toISOString(),
      $permissions: ["read"],
      roomBooking: [
        {
          booking_type: "Meeting",
          start_time: new Date("2025-02-25T09:00:00Z"),
          end_time: new Date("2025-02-25T11:00:00Z"),
          $id: "booking_001",
          $createdAt: new Date().toISOString(),
          $updatedAt: new Date().toISOString(),
          $permissions: ["read"],
          user: {
              first_name: "John",
              last_name: "Doe",
              email: "john.doe@example.com",
              time_quota: null,
              activation_code: null,
              hardware_eligibility: false,
              role: [],
              placeBooking: null,
              hardwareBooking: null,
              maxTimeQuota: null,
              $id: '',
              $createdAt: '',
              $updatedAt: '',
              $permissions: [],
              $databaseId: '',
              $collectionId: '',
              roomBooking: null
          },
          $databaseId: "db_010",
          $collectionId: "col_011",
        }
      ],
      $databaseId: "db_004",
      $collectionId: "col_005",
      slots: [],
    }
  ];
  
describe('RoomBooking.vue', () => {
    let wrapper : any;

    beforeEach(() => {
        setActivePinia(createPinia());
        wrapper = mount(RoomBooking, {
            global: {
                plugins: [router],
                stubs: {
                    'router-link': true,
                },
            },
        });
    });

    it('hasAvailableSlot should return false if there are bookings from 8 to 20 for 5 consecutive days and duration is 5 days', () => {
        const store = useRoomStore()
        const bookings = [
            {
              booking_type: "room",
              start_time: new Date('2025-01-01T08:00:00.000+01:00'),
              end_time: new Date('2025-01-01T20:00:00.000+01:00'),
              $id: "1",
              $createdAt: "",
              $updatedAt: "",
              $permissions: [],
              user: undefined,
              $databaseId: "",
              $collectionId: ""
            },
            {
              booking_type: "room",
              start_time: new Date('2025-01-02T08:00:00.000+01:00'),
              end_time: new Date('2025-01-02T20:00:00.000+01:00'),
              $id: "2",
              $createdAt: "",
              $updatedAt: "",
              $permissions: [],
              user: undefined,
              $databaseId: "",
              $collectionId: ""
            },
            {
              booking_type: "room",
              start_time: new Date('2025-01-03T08:00:00.000+01:00'),
              end_time: new Date('2025-01-03T20:00:00.000+01:00'),
              $id: "3",
              $createdAt: "",
              $updatedAt: "",
              $permissions: [],
              user: undefined,
              $databaseId: "",
              $collectionId: ""
            },
            {
              booking_type: "room",
              start_time: new Date('2025-01-04T08:00:00.000+01:00'),
              end_time: new Date('2025-01-04T20:00:00.000+01:00'),
              $id: "4",
              $createdAt: "",
              $updatedAt: "",
              $permissions: [],
              user: undefined,
              $databaseId: "",
              $collectionId: ""
            },
            {
              booking_type: "room",
              start_time: new Date('2025-01-05T08:00:00.000+01:00'),
              end_time: new Date('2025-01-05T20:00:00.000+01:00'),
              $id: "5",
              $createdAt: "",
              $updatedAt: "",
              $permissions: [],
              user: undefined,
              $databaseId: "",
              $collectionId: ""
            }
          ];
          
          const duration = {
            start_time: new Date('2025-01-01T00:00:00.000+01:00'),
            end_time: new Date('2025-01-05T23:59:59.000+01:00')
          };
          
        const result = store.hasAvailableSlot(bookings, duration, 30)
        expect(result).toBe(false)
      })

    it('renders the component', () => {
        expect(wrapper.exists()).toBe(true);
    });

    it('toggles sidebar visibility', async () => {
        const toggleButton = wrapper.findComponent({ name: 'Sidebar' }).vm.$emit('toggleSidebar');
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.isSidebarVisible).toBe(false);
    });

    it('shows no places available message when filteredPlaces is empty', async () => {
        wrapper.vm.filteredRooms = [];
        await wrapper.vm.$nextTick();
        const message = wrapper.find('p.text-center');
        expect(message.exists()).toBe(true);
        expect(message.text()).toBe('No rooms available for the selected time period');
    });

    it('renders places table when filteredPlaces is not empty', async () => {
        const roomStore = useRoomStore();
        roomStore.filteredRooms = mockRooms;
        await wrapper.vm.$nextTick();
        const table = wrapper.find('table');
        
        expect(table.exists()).toBe(true);
        const rows = wrapper.findAll('tbody tr');
        expect(rows.length).toBe(1);

        expect(true).toBe(true);
    });
});
