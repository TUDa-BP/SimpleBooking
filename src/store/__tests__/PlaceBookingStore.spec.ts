import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { usePlaceBookingStore } from '../placeBooking'
import { type Place } from '../place'

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
  

vi.mock('../cleaned/place', () => ({
  usePlaceStore: vi.fn(() => ({
    filteredPlaces: mockPlaces
  }))
}))

vi.mock('../cleaned/feature', () => ({
  useFeatureStore: vi.fn(() => ({}))
}))

vi.mock('../cleaned/user', () => ({
  useUserStore: vi.fn(() => ({
    user: {
      time_quota: 120
    }
  }))
}))

const beginBookingTime = 8;
const endBookingTime = 20;
const timeSlotSize = 30;
vi.stubGlobal('import.meta', {
    env: {
        VITE_BEGIN_BOOKINGTIME: beginBookingTime,
        VITE_END_BOOKINGTIME: endBookingTime,
        VITE_TIMESLOT_SIZE: timeSlotSize
    }
})

describe('PlaceBookingStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('should get available slots for a place', () => {
    const store = usePlaceBookingStore()
    store.setStartDate(new Date('2025-01-01T00:00:00Z'))
    store.setEndDate(new Date('2025-01-10T00:00:00Z'))

    //Get Slots for the first place

    const place = mockPlaces[0]
    store.getAvailableSlots(place)
    const numeberOfSlotsForFreeDay = (endBookingTime - beginBookingTime) * 60 / timeSlotSize
    
    // 9 Days are expected
    expect(store.availableSlotsForPlace.length).toBe(9)
    for (let i = 0; i < store.availableSlotsForPlace.length; i++) {
      expect(store.availableSlotsForPlace[i].slots.length).toBe(numeberOfSlotsForFreeDay)
    }

    expect(store.availableSlotsContainsReservedSlots).toBe(false)
  })

  it('should throw an error if start and end dates are not set', () => {
    const store = usePlaceBookingStore()

    expect(() => store.getAvailableSlots(0)).toThrow('Start and end dates are required.')
  })
it('should mark slots as booked if they are reserved', () => {
    const store = usePlaceBookingStore()
    store.setStartDate(new Date('2025-01-01T00:00:00Z'))
    store.setEndDate(new Date('2025-01-10T00:00:00Z'))

    // Mock a booking for the first place
    mockPlaces[0].placeBooking.push({
        start_time: new Date('2025-01-02T10:00:00Z'),
        end_time: new Date('2025-01-02T11:00:00Z'),
        $id: 'booking_001',
        $createdAt: new Date().toDateString(),
        $updatedAt: new Date().toDateString(),
        $permissions: ["read"],
        $databaseId: "db_010",
        $collectionId: "col_011",
        booking_type: "reserved",
    })

    // Get Slots for the first place
    const place = mockPlaces[0]
    store.getAvailableSlots(place)
    const numeberOfSlotsForFreeDay = (endBookingTime - beginBookingTime) * 60 / timeSlotSize

    // 9 Days are expected
    expect(store.availableSlotsForPlace.length).toBe(9)
    for (let i = 0; i < store.availableSlotsForPlace.length; i++) {
        if (i === 1) { // Second day has a booking
            expect(store.availableSlotsForPlace[i].slots.some(slot => slot.booking != undefined)).toBe(true)
            // Check if the booking is marked as reserved
            expect(store.availableSlotsForPlace[i].slots.some(slot => slot.booking?.booking_type === 'reserved')).toBe(true)

            // check if this are 2 slots from 10:00 to 11:00
            expect(store.availableSlotsForPlace[i].slots[6].booking).toBeDefined()
            expect(store.availableSlotsForPlace[i].slots[7].booking).toBeDefined()
        } else {
            expect(store.availableSlotsForPlace[i].slots.length).toBe(numeberOfSlotsForFreeDay)
            expect(store.availableSlotsForPlace[i].slots.some(slot => slot.booking != undefined)).toBe(false)
        }
    }

    expect(store.availableSlotsContainsReservedSlots).toBe(true)
})
})