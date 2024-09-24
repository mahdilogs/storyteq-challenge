import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import Autocomplete from './Autocomplete.vue'

const mockSearchFunction = vi.fn()

const defaultProps = {
  id: 'test-autocomplete',
  label: 'Test Autocomplete',
  placeholder: 'Search...',
  searchFunction: mockSearchFunction,
  getItemKey: (item: any) => item.id,
  getItemTitle: (item: any) => item.name,
  getItemSubtitle: (item: any) => item.subtitle,
  showSubtitle: false
}

const mountComponent = (props?: any) => {
  return mount(Autocomplete, {
    global: {
      plugins: []
    },
    props: { ...defaultProps, ...props }
  })
}

describe('Autocomplete', () => {
  let wrapper: any
  let input: any

  beforeEach(() => {
    vi.clearAllMocks()
    wrapper = mountComponent()
    input = wrapper.find('input')
  })

  it('renders correctly', () => {
    expect(input.exists()).toBe(true)
    expect(input.attributes('placeholder')).toBe('Search...')
  })

  it('calls search function when input changes', async () => {
    await input.setValue('test')
    expect(mockSearchFunction).toHaveBeenCalledWith('test')
  })

  it('displays search results', async () => {
    mockSearchFunction.mockResolvedValue([
      { id: 1, name: 'Result 1' },
      { id: 2, name: 'Result 2' }
    ])

    await input.setValue('test')
    await flushPromises()

    expect(wrapper.findAll('li').length).toBe(2)
    expect(wrapper.findAll('li')[0].text()).toContain('Result 1')
    expect(wrapper.findAll('li')[1].text()).toContain('Result 2')
  })

  it('clears input when clear button is clicked', async () => {
    await input.setValue('test')
    await flushPromises()

    const clearButton = wrapper.find('button')
    await clearButton.trigger('click')

    expect(input.element.value).toBe('')
  })

  it('displays "No results found" message when there are no results', async () => {
    mockSearchFunction.mockResolvedValue([])

    await input.setValue('nonexistent')
    await flushPromises()

    expect(wrapper.text()).toContain('No results found')
  })

  it('displays "Please enter at least X characters" message when input is too short', async () => {
    wrapper = mountComponent({ minChars: 3 })
    input = wrapper.find('input')

    await input.setValue('ab')
    await flushPromises()

    expect(wrapper.text()).toContain('Please enter at least 3 characters')
  })

  it('displays subtitle when showSubtitle is true', async () => {
    mockSearchFunction.mockResolvedValue([
      { id: 1, name: 'Result 1', subtitle: 'Subtitle 1' },
      { id: 2, name: 'Result 2', subtitle: 'Subtitle 2' }
    ])

    wrapper = mountComponent({ showSubtitle: true })
    input = wrapper.find('input')

    await input.setValue('test')
    await flushPromises()

    const listItems = wrapper.findAll('li')
    expect(listItems.length).toBe(2)
    expect(listItems[0].text()).toContain('Result 1')
    expect(listItems[0].text()).toContain('Subtitle 1')
    expect(listItems[1].text()).toContain('Result 2')
    expect(listItems[1].text()).toContain('Subtitle 2')
  })

  it('does not display subtitle when showSubtitle is false', async () => {
    mockSearchFunction.mockResolvedValue([
      { id: 1, name: 'Result 1', subtitle: 'Subtitle 1' },
      { id: 2, name: 'Result 2', subtitle: 'Subtitle 2' }
    ])

    wrapper = mountComponent({ showSubtitle: false })
    input = wrapper.find('input')

    await input.setValue('test')
    await flushPromises()

    const listItems = wrapper.findAll('li')
    expect(listItems.length).toBe(2)
    expect(listItems[0].text()).toContain('Result 1')
    expect(listItems[0].text()).not.toContain('Subtitle 1')
    expect(listItems[1].text()).toContain('Result 2')
    expect(listItems[1].text()).not.toContain('Subtitle 2')
  })
})
