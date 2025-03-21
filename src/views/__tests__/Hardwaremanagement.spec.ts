import { mount } from '@vue/test-utils';
import HardwareManagement from '@/views/HardwareManagement.vue';
import { describe, expect, it, vi } from 'vitest';

// Mocking der verwendeten Stores (wir nutzen hier einfache Mocks)
vi.mock('@/stores/cleaned/user', () => ({
  useUserStore: vi.fn().mockReturnValue({
    fetchUser: vi.fn(),
  }),
}));

vi.mock('@/stores/messages', () => ({
  useMessageStore: vi.fn().mockReturnValue({
    showLongAlert: vi.fn(),
  }),
}));

vi.mock('@/stores/cleaned/hardware', () => ({
  useHardwareStore: vi.fn().mockReturnValue({
    hardwareList: [
      { id: 1, name: 'Laptop A', category: 'Laptops', stockNumber: '123', roomNumber: '101', is_available: true, deactivated: false },
      { id: 2, name: 'Phone B', category: 'Others', stockNumber: '456', roomNumber: '102', is_available: false, deactivated: false },
    ],
    fetchHardware: vi.fn(),
    toggleAvailability: vi.fn(),
    updateHardware: vi.fn(),
    deleteHardware: vi.fn(),
  }),
}));

vi.mock('@/stores/cleaned/storageLocation', () => ({
  useStorageLocationStore: vi.fn().mockReturnValue({
    fetchOrCreateStorageLocation: vi.fn().mockResolvedValue('storageLocationID'),
  }),
}));

describe('HardwareManagement.vue', () => {
  it('should render correctly', async () => {
    // Testet das grundlegende Rendern der Komponenten
    const wrapper = mount(HardwareManagement);

    // Überprüft, ob der Titel des Headers korrekt ist
    expect(wrapper.find('header h1').text()).toBe('Manage Hardware');

    // Überprüft, ob der Button zum Öffnen des Overlays existiert
    const overlayButton = wrapper.find('.overlay-button');
    expect(overlayButton.exists()).toBe(true);

    // Überprüft, ob das Suchfeld existiert
    const searchInput = wrapper.find('.search-input');
    expect(searchInput.exists()).toBe(true);

    // Überprüft, ob eine Tabelle existiert
    const table = wrapper.find('table');
    expect(table.exists()).toBe(true);

    // Überprüft, ob mindestens ein Hardware-Eintrag in der Tabelle vorhanden ist
    const hardwareItems = wrapper.findAll('tbody tr');
    expect(hardwareItems.length).toBeGreaterThan(0); // Es gibt mindestens einen Eintrag

    // Überprüft, ob der erste Eintrag den Namen "Laptop A" enthält
    expect(hardwareItems[0].text()).toContain('Laptop A');
  });

  it('should toggle sidebar visibility', async () => {
    const wrapper = mount(HardwareManagement);

    const sidebarButton = wrapper.find('button');
    expect(sidebarButton.exists()).toBe(true); // Ensure the button exists
    await sidebarButton.trigger('click');

    await sidebarButton.trigger('click');
    expect(wrapper.vm.isSidebarVisible).toBe(true);
  });

  it('should open Add Hardware overlay on button click', async () => {
    const wrapper = mount(HardwareManagement);

    // Überprüfen, ob der Button zum Öffnen des Overlays existiert
    const overlayButton = wrapper.find('.overlay-button');
    expect(overlayButton.exists()).toBe(true); // Sicherstellen, dass der Button existiert

    // Initialer Zustand des Overlays (sollte geschlossen sein)
    expect(wrapper.vm.isHardwareOverlayOpen).toBe(false);

    // Simulieren des Klicks auf den Button
    await overlayButton.trigger('click');

    // Warten, bis der DOM aktualisiert wurde
    await wrapper.vm.$nextTick();

    // Überprüfen, ob das Overlay existiert, wenn isHardwareOverlayOpen auf true gesetzt wurde
    const overlay = wrapper.findComponent({ name: 'Overlay' }); // Sucht nach dem Overlay-Tag
    expect(overlay.exists()).toBe(true);  // Sicherstellen, dass das Overlay im DOM vorhanden ist

    // Überprüfen, ob das Overlay sichtbar ist (es wird nur gerendert, wenn `isHardwareOverlayOpen` true ist)
    expect(overlay.element.style.display).not.toBe('none');  // Sicherstellen, dass das Overlay sichtbar ist
    expect(wrapper.vm.isHardwareOverlayOpen).toBe(true); // Sicherstellen, dass der Zustand korrekt geändert wurde
  });

});
