<template>
  <div>
    <Autocomplete
      :id="props.id"
      :label="props.label"
      :placeholder="props.placeholder"
      :minChars="minChars"
      :searchFunction="searchCities"
      :getItemKey="getItemKey"
      :getItemTitle="getItemTitle"
      :autoFocus="props.autoFocus"
    />
  </div>
</template>

<script setup lang="ts">
import { useCityStore } from '../../../stores'
import Autocomplete from '../../atoms/autocomplete/Autocomplete.vue'

const cityStore = useCityStore()

const props = withDefaults(
  defineProps<{
    id?: string
    label?: string
    placeholder?: string
    minChars?: number
    autoFocus?: boolean
  }>(),
  {
    id: 'city-search',
    label: 'Search Cities',
    placeholder: 'Enter a city name...',
    minChars: 3,
    autoFocus: false
  }
)

const searchCities = async (query: string) => {
  await cityStore.searchCities(query)
  return cityStore.searchResults
}

const getItemKey = (item: string) => item
const getItemTitle = (item: string) => item

defineOptions({
  name: 'CityAutocomplete'
})
</script>
