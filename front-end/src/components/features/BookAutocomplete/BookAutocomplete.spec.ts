import { mount } from '@vue/test-utils'
import { describe, expect, it, beforeEach, vi } from 'vitest'
import BookAutocomplete from './BookAutocomplete.vue'
import { createPinia, setActivePinia } from 'pinia'
import Autocomplete from '@/components/atoms/autocomplete/Autocomplete.vue'
import { useBookStore } from '@/stores'

const mockSearchBooks = vi.fn()
vi.mock('@/stores', () => ({
  useBookStore: vi.fn(() => ({
    searchBooks: mockSearchBooks,
    searchResults: []
  }))
}))

const pinia = createPinia()

const defaultProps = {
  id: 'book-search',
  label: 'Search Books',
  placeholder: 'Enter a book title...'
}

const mountComponent = (props?: any) => {
  return mount(BookAutocomplete, {
    global: {
      plugins: [pinia],
      stubs: {
        'i18n-t': true
      }
    },
    props: { ...defaultProps, ...props }
  })
}

describe('BookAutocomplete', () => {
  let wrapper: any
  let bookStore: any

  beforeEach(() => {
    setActivePinia(createPinia())
    bookStore = useBookStore()
    wrapper = mountComponent()
    vi.clearAllMocks()
  })

  it('renders correctly with default props', () => {
    const autocomplete = wrapper.findComponent(Autocomplete)
    expect(autocomplete.exists()).toBe(true)
    expect(autocomplete.props('id')).toBe('book-search')
    expect(autocomplete.props('label')).toBe('Search Books')
    expect(autocomplete.props('placeholder')).toBe('Enter a book title...')
  })

  it('passes correct props to Autocomplete component', () => {
    const autocomplete = wrapper.findComponent(Autocomplete)
    expect(autocomplete.props()).toMatchObject({
      id: 'book-search',
      label: 'Search Books',
      placeholder: 'Enter a book title...',
      minChars: 3,
      showSubtitle: true
    })
  })

  it('calls searchBooks when searchFunction is called', async () => {
    const autocomplete = wrapper.findComponent(Autocomplete)
    const searchFunction = autocomplete.props('searchFunction')

    await searchFunction('test query')

    expect(mockSearchBooks).toHaveBeenCalledWith('test query')
    expect(mockSearchBooks).toHaveBeenCalledTimes(1)
  })

  it('formats book data correctly for Autocomplete', async () => {
    bookStore.searchResults = [
      { id: 1, title: 'Book 1', author: 'Author 1' },
      { id: 2, title: 'Book 2', author: 'Author 2' }
    ]

    await wrapper.vm.$nextTick()

    const autocomplete = wrapper.findComponent(Autocomplete)

    const { getItemKey, getItemTitle, getItemSubtitle } = autocomplete.props()

    expect(getItemKey(bookStore.searchResults[0])).toBe(1)
    expect(getItemTitle(bookStore.searchResults[0])).toBe('Book 1')
    expect(getItemSubtitle(bookStore.searchResults[0])).toBe('by Author 1')
  })
})
