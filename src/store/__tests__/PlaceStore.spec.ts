import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { usePlaceStore, type Place } from '../place'
import { databases } from '../../appwrite'

vi.mock('../../appwrite', () => ({
  databases: {
    listDocuments: vi.fn()
  }
}))

describe('usePlaceStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('fetchPlaces should fetch and set places', async () => {
    const store = usePlaceStore()
    const mockResponse = {
      documents: [
        {
          $id: '1',
          $createdAt: '2023-01-01T00:00:00.000Z',
          $updatedAt: '2023-01-02T00:00:00.000Z',
          placeBooking: [
            {
              start_time: '2023-01-03T00:00:00.000Z',
              end_time: '2023-01-04T00:00:00.000Z'
            }
          ],
          feature: []
        }
      ]
    }
    databases.listDocuments.mockResolvedValue(mockResponse)

    await store.fetchPlaces()

    expect(store.places).toHaveLength(1)
    expect(store.places[0].$id).toBe('1')
    expect(store.places[0].$createdAt).toBeInstanceOf(Date)
    expect(store.places[0].$updatedAt).toBeInstanceOf(Date)
    expect(store.places[0].placeBooking[0].start_time).toBeInstanceOf(Date)
    expect(store.places[0].placeBooking[0].end_time).toBeInstanceOf(Date)
  })

  it('filterPlaces should filter places based on place_id', () => {
    const store = usePlaceStore()
    store.places = [
      { place_id: 1, feature: [], placeBooking: [] },
      { place_id: 2, feature: [], placeBooking: [] }
    ] as any

    store.filterPlaces({ place_id: 1 })

    expect(store.filteredPlaces).toHaveLength(1)
    expect(store.filteredPlaces[0].place_id).toBe(1)
  })

  it('filterPlaces should filter places based on features', () => {
    const store = usePlaceStore()
    store.places = [
      { $id: '1', feature: [{ feature_name: 'wifi' }], placeBooking: [] },
      { $id: '2', feature: [{ feature_name: 'parking' }], placeBooking: [] }
    ] as any

    store.filterPlaces({ features: ['wifi'] })

    expect(store.filteredPlaces).toHaveLength(1)
    expect(store.filteredPlaces[0].$id).toBe('1')
  })


  it('hasAvailableSlot should return true if there are no bookings', () => {
    const store = usePlaceStore()
    const duration = {
      start_time: new Date('2023-01-01T00:00:00.000+01:00'),
      end_time: new Date('2023-01-01T20:00:00.000+01:00')
    }
    const result = store.hasAvailableSlot([], duration, 30)
    expect(result).toBe(true)
  })


  it('hasAvailableSlot should return false if there are bookings from 8 to 20 on 01.01.2025 and 02.02.2025 and duration is from 01.01.2025 to 01.01.2025', () => {
    const store = usePlaceStore()
    const duration = {
      start_time: new Date('2025-01-01T00:00:00.000+01:00'),
      end_time: new Date('2025-01-01T23:59:59.000+01:00')
    }
    const bookings = [
      {
        start_time: new Date('2025-01-01T08:00:00.000+01:00'),
        end_time: new Date('2025-01-01T20:00:00.000+01:00')
      },
      {
        start_time: new Date('2025-02-02T08:00:00.000+01:00'),
        end_time: new Date('2025-02-02T20:00:00.000+01:00')
      }
    ]
    const result = store.hasAvailableSlot(bookings, duration, 30)
    expect(result).toBe(false)
  })

  it('hasAvailableSlot should return true if there are bookings from 8 to 20 on 01.01.2025 and 02.02.2025 and duration is from 01.01.2025 to 03.01.2025', () => {
    const store = usePlaceStore()
    const duration = {
      start_time: new Date('2025-01-01T00:00:00.000+01:00'),
      end_time: new Date('2025-01-03T23:59:59.000+01:00')
    }
    const bookings = [
      {
        start_time: new Date('2025-01-01T08:00:00.000+01:00'),
        end_time: new Date('2025-01-01T20:00:00.000+01:00')
      },
      {
        start_time: new Date('2025-02-02T08:00:00.000+01:00'),
        end_time: new Date('2025-02-02T20:00:00.000+01:00')
      }
    ]
    const result = store.hasAvailableSlot(bookings, duration, 30)
    expect(result).toBe(true)
  })

  it('hasAvailableSlot should return false if there are bookings from 8 to 20 for 5 consecutive days and duration is 5 days', () => {
    const store = usePlaceStore()
    const duration = {
      start_time: new Date('2025-01-01T00:00:00.000+01:00'),
      end_time: new Date('2025-01-05T23:59:59.000+01:00')
    }
    const bookings = [
      {
        start_time: new Date('2025-01-01T08:00:00.000+01:00'),
        end_time: new Date('2025-01-01T20:00:00.000+01:00')
      },
      {
        start_time: new Date('2025-01-02T08:00:00.000+01:00'),
        end_time: new Date('2025-01-02T20:00:00.000+01:00')
      },
      {
        start_time: new Date('2025-01-03T08:00:00.000+01:00'),
        end_time: new Date('2025-01-03T20:00:00.000+01:00')
      },
      {
        start_time: new Date('2025-01-04T08:00:00.000+01:00'),
        end_time: new Date('2025-01-04T20:00:00.000+01:00')
      },
      {
        start_time: new Date('2025-01-05T08:00:00.000+01:00'),
        end_time: new Date('2025-01-05T20:00:00.000+01:00')
      }
    ]
    const result = store.hasAvailableSlot(bookings, duration, 30)
    expect(result).toBe(false)
  })

  
})