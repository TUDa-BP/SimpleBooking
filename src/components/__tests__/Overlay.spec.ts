import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, VueWrapper } from '@vue/test-utils';
import Overlay from '@/components/Overlay.vue'; // Path anpassen

describe('Overlay.vue', () => {
  let wrapper: VueWrapper<any>;

  // Setup before each test
  beforeEach(() => {
    wrapper = mount(Overlay, {
      props: {
        showCloseButton: false,
      },
    });
  });

  // Test if the overlay is displayed
  it('displays the overlay', () => {
    expect(wrapper.find('.overlay').exists()).toBe(true); 
  });

  // Test if the close button is displayed when showCloseButton is true
  it('displays the close button when showCloseButton is true', async () => {
    await wrapper.setProps({ showCloseButton: true });
    const closeButton = wrapper.find('.close-button');
    expect(closeButton.exists()).toBe(true);
  });

  // Test if the close button is not displayed when showCloseButton is false
  it('does not display the close button when showCloseButton is false', () => {
    const closeButton = wrapper.find('.close-button');
    expect(closeButton.exists()).toBe(false);
  });

  // Test if the "closeOverlay" event is emitted when the close button is clicked
  it('emits the "closeOverlay" event when the close button is clicked', async () => {
    await wrapper.setProps({ showCloseButton: true });
    const closeButton = wrapper.find('.close-button');
    await closeButton.trigger('click');

    // Check if the event was emitted
    expect(wrapper.emitted().closeOverlay).toBeTruthy();
  });

  // Test the slot feature (optional)
  it('displays the slot content', async () => {
    const wrapperWithSlot = mount(Overlay, {
      props: { showCloseButton: false },
      slots: {
        default: '<div class="slot-content">Slot Content</div>',
      },
    });

    const slotContent = wrapperWithSlot.find('.slot-content');
    expect(slotContent.exists()).toBe(true);
  });
});
