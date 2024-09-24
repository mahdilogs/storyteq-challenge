<template>
  <Autocomplete
    :id="props.id"
    :label="props.label"
    :placeholder="props.placeholder"
    :minChars="props.minChars"
    :showSubtitle="true"
    :getItemKey="(item) => item.id"
    :getItemTitle="(item) => item.title"
    :getItemSubtitle="(item) => `by ${item.author}`"
    :items="bookStore.searchResults"
    :searchFunction="searchFunction"
    :autoFocus="props.autoFocus"
  />
</template>

<script setup lang="ts">
import { useBookStore } from '@/stores'
import Autocomplete from '@/components/atoms/autocomplete/Autocomplete.vue'

const bookStore = useBookStore()

const props = withDefaults(
  defineProps<{
    id?: string
    label?: string
    placeholder?: string
    minChars?: number
    autoFocus?: boolean
  }>(),
  {
    id: 'book-search',
    label: 'Search Books',
    placeholder: 'Enter a book title...',
    minChars: 3,
    autoFocus: false
  }
)

const searchFunction = async (query: string) => {
  await bookStore.searchBooks(query)
  return bookStore.searchResults
}
</script>

<style scoped>
ul {
  list-style-type: none;
  padding: 0;
}

li {
  margin-bottom: 5px;
}

strong {
  font-weight: bold;
}
</style>
