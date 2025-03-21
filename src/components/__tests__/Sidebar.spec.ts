import { describe, it, expect, beforeEach, vi } from "vitest";
import { mount, VueWrapper } from "@vue/test-utils";
import Sidebar from "@/components/Sidebar.vue";

// Mocking UserStore to simulate the state
vi.mock("@/stores/cleaned/user", () => ({
  useUserStore: vi.fn().mockReturnValue({
    user: { role: ['admin'] }, // Ensure the user has the admin role
    fetchUser: vi.fn(),
  }),
}));

// Mocking MessageStore for displaying messages
vi.mock("@/stores/messages", () => ({
  useMessageStore: vi.fn().mockReturnValue({
    showLongAlert: vi.fn(),
  }),
}));

describe("Sidebar.vue", () => {
  let wrapper: VueWrapper<any>;

  beforeEach(() => {
    // Initialize the wrapper for the Sidebar component
    wrapper = mount(Sidebar, {
      props: { isSidebarVisible: true },
    });
  });

  it("shows Sidebar when visible", () => {
    expect(wrapper.find(".sidebar").exists()).toBe(true); // Sidebar should be visible
  });

  it("shows the Show-Button when Sidebar is not visible", async () => {
    // Create an instance of the component without prop
    const wrapper = mount(Sidebar, {
      data() {
        return {
          is_visible: false,  // Manually set to false
        };
      }
    });
  
    // Wait for the next DOM update
    await wrapper.vm.$nextTick();
  
    // Test if the Show-Button is displayed
    const showButton = wrapper.find(".show-sidebar");
  
    // Check if the button to show the sidebar exists
    expect(showButton.exists()).toBe(true);
  });

  it("hides the Sidebar when the Hide-Button is clicked", async () => {
    // Test if clicking the Hide-Button hides the Sidebar
    await wrapper.find(".hide-sidebar").trigger("click");
    expect(wrapper.find(".sidebar").exists()).toBe(false); // Sidebar should not be visible now
  });

  it("shows the Logout-Button", () => {
    expect(wrapper.find("[data-testid='logout-button']").exists()).toBe(true); // Logout-Button should always be visible
  });

  it("shows the Wave at the bottom", () => {
    expect(wrapper.find(".wave").exists()).toBe(true); // Wave image should be displayed
  });

  it("shows management links when Management button is hovered", async () => {
    // Find the Management button
    const managementButton = wrapper.find(".management-button");

    // Trigger hover event
    await managementButton.trigger("mouseenter");

    // Check if the management links are displayed
    const managementLinks = wrapper.find(".management-links");
    expect(managementLinks.exists()).toBe(true);
    expect(managementLinks.isVisible()).toBe(true);

    // Check if specific management links are displayed
    expect(wrapper.find(".management-links .sidebar-button[data-testid='room-management']").exists()).toBe(true);
    expect(wrapper.find(".management-links .sidebar-button[data-testid='hardware-management']").exists()).toBe(true);
    expect(wrapper.find(".management-links .sidebar-button[data-testid='hardware-booking-management']").exists()).toBe(true);
    expect(wrapper.find(".management-links .sidebar-button[data-testid='account-management']").exists()).toBe(true);
  });
});