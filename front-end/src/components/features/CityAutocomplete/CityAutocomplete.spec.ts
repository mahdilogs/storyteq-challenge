import { mount } from '@vue/test-utils'
import { describe, expect, it, beforeEach, vi } from 'vitest'
import CityAutocomplete from './CityAutocomplete.vue'
import { createPinia, setActivePinia } from 'pinia'
import Autocomplete from '@/components/atoms/autocomplete/Autocomplete.vue'
import { useCityStore } from '@/stores'

const mockSearchCities = vi.fn()
vi.mock('@/stores', () => ({
  useCityStore: vi.fn(() => ({
    searchCities: mockSearchCities,
    searchResults: []
  }))
}))

const pinia = createPinia()

const defaultProps = {
  id: 'city-search',
  label: 'Search Cities',
  placeholder: 'Enter a city name...'
}

const mountComponent = (props?: any) => {
  return mount(CityAutocomplete, {
    global: {
      plugins: [pinia],
      stubs: {
        'i18n-t': true
      }
    },
    props: { ...defaultProps, ...props }
  })
}

describe('CityAutocomplete', () => {
  let wrapper: any
  let cityStore: any

  beforeEach(() => {
    setActivePinia(createPinia())
    cityStore = useCityStore()
    wrapper = mountComponent()
    vi.clearAllMocks()
  })

  it('renders correctly with default props', () => {
    const autocomplete = wrapper.findComponent(Autocomplete)
    expect(autocomplete.exists()).toBe(true)
    expect(autocomplete.props('id')).toBe('city-search')
    expect(autocomplete.props('label')).toBe('Search Cities')
    expect(autocomplete.props('placeholder')).toBe('Enter a city name...')
  })

  it('passes correct props to Autocomplete component', () => {
    const autocomplete = wrapper.findComponent(Autocomplete)
    expect(autocomplete.props()).toMatchObject({
      id: 'city-search',
      label: 'Search Cities',
      placeholder: 'Enter a city name...',
      minChars: 3
    })
  })

  it('calls searchCities when searchFunction is called', async () => {
    const autocomplete = wrapper.findComponent(Autocomplete)
    const searchFunction = autocomplete.props('searchFunction')

    expect(searchFunction).toBeDefined()
    expect(typeof searchFunction).toBe('function')

    await searchFunction('test query')

    expect(mockSearchCities).toHaveBeenCalledWith('test query')
    expect(mockSearchCities).toHaveBeenCalledTimes(1)
  })

  it('formats city data correctly for Autocomplete', async () => {
    cityStore.searchResults = ['New York', 'London', 'Tokyo']

    await wrapper.vm.$nextTick()

    const autocomplete = wrapper.findComponent(Autocomplete)

    const { getItemKey, getItemTitle } = autocomplete.props()

    expect(getItemKey(cityStore.searchResults[0])).toBe('New York')
    expect(getItemTitle(cityStore.searchResults[0])).toBe('New York')
  })
})
