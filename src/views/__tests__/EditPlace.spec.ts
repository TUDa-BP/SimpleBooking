import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import EditPlace from '../../views/EditPlace.vue';

describe('EditPlace.vue', () => {
  const place = {
    room: {
      room_number: '101',
      num_places: 10,
      description: 'Conference Room',
      deactivated: false,
      place: [],
      roomBooking: [],
      $id: 'room1',
      $createdAt: '2023-01-01T00:00:00Z',
      $updatedAt: '2023-01-01T00:00:00Z',
      $permissions: [],
      $databaseId: 'db1',
      $collectionId: 'col1'
    },
    place_id: 1,
    description: 'Test description',
    feature: []
  };

  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('renders the form with place data', () => {
    const wrapper = mount(EditPlace, {
      props: { place }
    });
    console.log(wrapper.html());
    console.log(place);
    expect(wrapper.find('form').exists()).toBe(true);
    //expect((wrapper.find('#room').element as HTMLSelectElement).value).toBe(place.room.$id);
    expect((wrapper.find('#place_id').element as HTMLInputElement).value).toBe(place.place_id.toString());
    expect((wrapper.find('#description').element as HTMLTextAreaElement).value).toBe(place.description);
  });

  it('emits closeOverlay event when cancel button is clicked', async () => {
    const wrapper = mount(EditPlace, {
      props: { place }
    });
    await wrapper.find('button[type="button"]').trigger('click');
    expect(wrapper.emitted().closeOverlay).toBeTruthy();
  });
});

