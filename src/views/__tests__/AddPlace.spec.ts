import { mount } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AddPlace from '@/views/AddPlace.vue';
import { createPinia, setActivePinia, defineStore } from 'pinia';
import { nextTick } from 'vue';
import { useRoomStore } from '@/stores/cleaned/room';
import { usePlaceStore } from '@/stores/cleaned/place';
import { useMessageStore } from '@/stores/messages';
import { useFeatureStore } from '@/stores/cleaned/feature';

// Create mock stores with Pinia
const useMockRoomStore = defineStore('room', {
  state: () => ({
    rooms: [] as Array<{ $id: string; room_number: number }>,
    selectedRoom: null as { $id: string; room_number: number } | null,
  }),
  actions: {
    fetchRooms: vi.fn(),
    updateNumPlacesByOne: vi.fn(),
  },
});

const useMockPlaceStore = defineStore('place', {
  state: () => ({
    places: [] as Array<{ $id: string; features: string[]; status: string }>,
  }),
  actions: {
    checkPlaceExists: vi.fn(),
    addPlace: vi.fn(), // Ensure addPlace is a mock function
  },
});

const useMockMessageStore = defineStore('message', {
  actions: {
    showAlert: vi.fn(),
  },
});

const useMockFeatureStore = defineStore('feature', {
  state: () => ({
    features: [] as Array<{ $id: string; name: string }>,
  }),
  actions: {
    fetchFeatures: vi.fn(),
  },
});

let roomStore: ReturnType<typeof useMockRoomStore>;
let placeStore: ReturnType<typeof useMockPlaceStore>;
let messageStore: ReturnType<typeof useMockMessageStore>;
let featureStore: ReturnType<typeof useMockFeatureStore>;

beforeEach(() => {
  setActivePinia(createPinia());
  roomStore = useMockRoomStore();
  placeStore = useMockPlaceStore();
  messageStore = useMockMessageStore();
  featureStore = useMockFeatureStore();

  // Mock fetchRooms and fetchFeatures as spies
  vi.spyOn(roomStore, 'fetchRooms').mockImplementation(() => Promise.resolve());
  vi.spyOn(featureStore, 'fetchFeatures').mockImplementation(() => Promise.resolve());
});

describe('AddPlace.vue', () => {
  it('renders the form correctly', () => {
    const wrapper = mount(AddPlace, {
      global: {
        plugins: [createPinia()],
      },
    });
    
    expect(wrapper.find('h1').text()).toBe('Add Place');
    expect(wrapper.find('form').exists()).toBe(true);
    expect(wrapper.find('select#room').exists()).toBe(true);
    expect(wrapper.find('input#placeId').exists()).toBe(true);
    expect(wrapper.find('input[type="search"]').exists()).toBe(true);
    expect(wrapper.find('textarea#textAreaExample2').exists()).toBe(true);
    expect(wrapper.find('button[type="button"]').text()).toBe('Add Place');
    expect(wrapper.find('button[type="reset"]').text()).toBe('Cancel');
  });

  it('emits closeOverlay event when cancel button is clicked', async () => {
    const wrapper = mount(AddPlace, {
      global: {
        plugins: [createPinia()],
      },
    });
    await wrapper.find('button[type="reset"]').trigger('click');
    expect(wrapper.emitted()).toHaveProperty('closeOverlay');
  });

  it('calls fetchRooms and fetchFeatures on mount', async () => {
    // Set up Pinia store
    const pinia = createPinia();
    setActivePinia(pinia);
    
    // Mock the store methods
    const roomStore = useRoomStore();
    const featureStore = useFeatureStore();
    vi.spyOn(roomStore, 'fetchRooms').mockResolvedValue(undefined);
    vi.spyOn(featureStore, 'fetchFeatures').mockResolvedValue(undefined);

    // Mount the component with Pinia
    mount(AddPlace, {
      global: {
        plugins: [pinia],
      },
    });

    // Wait for the next tick to ensure all promises are resolved
    await nextTick();

    // Check if fetchRooms and fetchFeatures were called
    expect(roomStore.fetchRooms).toHaveBeenCalled();
    expect(featureStore.fetchFeatures).toHaveBeenCalled();
  });

});

