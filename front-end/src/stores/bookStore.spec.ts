import { setActivePinia, createPinia } from 'pinia'
import { useBookStore } from './bookStore'
import { describe, it, expect, beforeEach } from 'vitest'

describe('Book Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('initializes with correct default state', () => {
    const bookStore = useBookStore()
    expect(bookStore.books.length).toBe(7)
    expect(bookStore.searchResults.length).toBe(0)
  })

  it('returns correct search results for valid query', () => {
    const bookStore = useBookStore()
    bookStore.searchBooks('don')
    expect(bookStore.searchResults.length).toBe(1)
    expect(bookStore.searchResults[0].title).toBe('Don Quixote')
  })

  it('returns empty search results for short query', () => {
    const bookStore = useBookStore()
    bookStore.searchBooks('do')
    expect(bookStore.searchResults.length).toBe(0)
  })

  it('returns empty search results for non-matching query', () => {
    const bookStore = useBookStore()
    bookStore.searchBooks('xyz')
    expect(bookStore.searchResults.length).toBe(0)
  })

  it('is case insensitive in search', () => {
    const bookStore = useBookStore()
    bookStore.searchBooks('ROBINSON')
    expect(bookStore.searchResults.length).toBe(1)
    expect(bookStore.searchResults[0].title).toBe('Robinson Crusoe')
  })
})
