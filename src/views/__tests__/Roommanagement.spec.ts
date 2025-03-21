import { mount } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Roommanagement from '@/views/Roommanagement.vue';
import { createPinia, setActivePinia, defineStore } from 'pinia';
import { nextTick } from 'vue';
import { useRoomStore } from '@/stores/cleaned/room';

// Erstelle Mock-Stores mit Pinia
const useMockRoomStore = defineStore('room', {
    state: () => ({
      rooms: [] as Array<{ 
        $id: string; 
        room_number: number; 
        description: string; 
        deactivated: boolean; 
      }>,
      selectedRoom: null as { 
        $id: string; 
        room_number: number; 
        description: string; 
        deactivated: boolean; 
      } | null,
    }),
    actions: {
      fetchRooms: vi.fn(),
      fetchSingleRoom: vi.fn(),
      setSelectedRoom: vi.fn(),
      updateRoomDescription: vi.fn(),
      toggleStatus: vi.fn(),
      deleteRoom: vi.fn(),
    },
  });
  

const useMockPlaceStore = defineStore('place', {
    state: () => ({
        places: [] as Array<{ $id: string; features: string[]; status: string }>,
      }),
  actions: {
    fetchPlacesInRoom: vi.fn(),
    updatePlace: vi.fn(),
    toggleStatus: vi.fn(),
    deletePlace: vi.fn(),
  },
});


let roomStore: ReturnType<typeof useMockRoomStore>;
let placeStore: ReturnType<typeof useMockPlaceStore>;

beforeEach(() => {
  setActivePinia(createPinia());
  roomStore = useMockRoomStore(); 
  placeStore = useMockPlaceStore();
});

describe('Roommanagement.vue', () => {
  it('renders correctly', async () => {
    roomStore.rooms = [{ $id: 'room1', room_number: 101, description: 'Test Room', deactivated: false }];
    
    const wrapper = mount(Roommanagement);
    await nextTick();

    expect(wrapper.text()).toContain('Manage Rooms');
    expect(wrapper.find('h1').text()).toBe('Manage Rooms');
    expect(wrapper.findAll('option').length).toBeGreaterThan(0);

    // Check for Add Room button
    const addRoomButton = wrapper.find('#add-room-button');
    expect(addRoomButton.exists()).toBe(true);
    expect(addRoomButton.text()).toContain('Add Room');

    // Check for Add Place button
    const addPlaceButton = wrapper.find('#add-place-button');
    expect(addPlaceButton.exists()).toBe(true);
    expect(addPlaceButton.text()).toContain('Add Place');

    // Check for the dropdown
    const dropdown = wrapper.find('select.form-select');
    expect(dropdown.exists()).toBe(true);
    expect(dropdown.find('option').text()).toBe('Select Room');
  });

  it('fetches rooms on mount', async () => {
    const roomStore = useRoomStore();
    vi.spyOn(roomStore, 'fetchRooms').mockResolvedValue(); // Mock Funktion

    mount(Roommanagement);
    await nextTick();

    expect(roomStore.fetchRooms).toHaveBeenCalled();
  });

  it('opens and closes the add room overlay', async () => {
    const wrapper = mount(Roommanagement);

    // Ensure the overlay is not visible initially
    expect(wrapper.findComponent({ ref: 'addRoomOverlay' }).exists()).toBe(false);

    // Click the button to open the overlay
    await wrapper.find('button#add-room-button').trigger('click');
    await nextTick();

    // Now the overlay should be visible
    expect(wrapper.findComponent({ ref: 'addRoomOverlay' }).exists()).toBe(true);
    
    // Find the button in the overlay and close the overlay
    await wrapper.findComponent({ ref: 'addRoomOverlay' }).vm.$emit('closeOverlay');
    await nextTick();

    // Check if the overlay is closed again
    expect(wrapper.findComponent({ ref: 'addRoomOverlay' }).exists()).toBe(false);
  });

  it('opens and closes the add place overlay', async () => {
    const wrapper = mount(Roommanagement);

    // Ensure the overlay is not visible initially
    expect(wrapper.findComponent({ ref: 'addPlaceOverlay' }).exists()).toBe(false);

    // Click the button to open the overlay
    await wrapper.find('button#add-place-button').trigger('click');
    await nextTick();

    // Now the overlay should be visible
    expect(wrapper.findComponent({ ref: 'addPlaceOverlay' }).exists()).toBe(true);
    
    // Find the button in the overlay and close the overlay
    await wrapper.findComponent({ ref: 'addPlaceOverlay' }).vm.$emit('closeOverlay');
    await nextTick();

    // Check if the overlay is closed again
    expect(wrapper.findComponent({ ref: 'addPlaceOverlay' }).exists()).toBe(false);
  });

  it('shows everything correctly when a room is selected', async () => {
    roomStore.rooms = [{ $id: 'room1', room_number: 101, description: 'Test Room', deactivated: false }];
    roomStore.selectedRoom = roomStore.rooms[0];
  
    const wrapper = mount(Roommanagement);
    await nextTick();
  
    // Simulate selecting a room
    wrapper.find('select.form-select').setValue('room1');
    wrapper.vm.selectedRoomId = 'room1';
    await nextTick();
  
    // Sicherstellen, dass das richtige HTML gerendert wird
    console.log(wrapper.html());
  
    // Check if buttons exist
    expect(wrapper.find('#toggle-room-button').exists()).toBe(true);
    expect(wrapper.find('#delete-room-button').exists()).toBe(true);
  
    // Mock and call fetchPlacesInRoom
    const places = [
      { $id: 'place1', features: ['Feature 1', 'Feature 2'], status: 'active' },
      { $id: 'place2', features: ['Feature 3'], status: 'inactive' },
    ];
    vi.spyOn(placeStore, 'fetchPlacesInRoom').mockImplementation(() => {
        placeStore.places = places; // Ensure the places array is populated
    });
  
    await placeStore.fetchPlacesInRoom();
    wrapper.vm.places = placeStore.places; 
    await nextTick();
  
    // Check if table rows exist
    const placeRows = wrapper.findAll('table#places-table tbody tr');
    
    expect(placeRows.length).toBe(places.length);
  });
});
