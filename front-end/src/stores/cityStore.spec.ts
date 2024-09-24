import { setActivePinia, createPinia } from 'pinia'
import { useCityStore } from './cityStore'
import { describe, it, expect, beforeEach } from 'vitest'

describe('City Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('initializes with empty search results', () => {
    const store = useCityStore()
    expect(store.searchResults).toEqual([])
  })

  it('returns empty results for queries less than 3 characters', () => {
    const store = useCityStore()
    store.searchCities('ab')
    expect(store.searchResults).toEqual([])
  })

  it('returns matching cities for valid queries', () => {
    const store = useCityStore()
    store.searchCities('san')
    expect(store.searchResults).toEqual([
      'san jose',
      'santiago',
      'san francisco',
      'santa rosa',
      'san juan'
    ])
  })

  it('is case-insensitive', () => {
    const store = useCityStore()
    store.searchCities('SAN')
    expect(store.searchResults).toEqual([
      'san jose',
      'santiago',
      'san francisco',
      'santa rosa',
      'san juan'
    ])
  })

  it('returns empty results for non-matching queries', () => {
    const store = useCityStore()
    store.searchCities('xyz')
    expect(store.searchResults).toEqual([])
  })
})
