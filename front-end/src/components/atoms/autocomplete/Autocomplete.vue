<template>
  <div>
    <label :for="id" class="block text-sm font-medium text-gray-700 pb-2">{{ label }}</label>
    <div class="relative" ref="autocompleteContainer">
      <div class="relative">
        <span class="absolute inset-y-0 left-0 flex items-center pl-3">
          <svg
            class="w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            ></path>
          </svg>
        </span>
        <input
          :id="id"
          v-model="query"
          @input="search"
          :placeholder="placeholder"
          ref="inputField"
          class="w-full pl-10 pr-10 py-2 text-gray-700 bg-white border border-gray-300 rounded-full focus:border-blue-500 focus:outline-none focus:ring"
        />
        <button
          v-if="query"
          @click="clearInput"
          class="absolute inset-y-0 right-0 flex items-center pr-3"
        >
          <svg
            class="w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            ></path>
          </svg>
        </button>
      </div>
      <ul
        v-if="showResults"
        class="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg max-h-60 overflow-auto"
      >
        <li
          v-for="item in searchResults"
          :key="getItemKey(item)"
          @click="selectItem(item)"
          class="px-4 py-2 hover:bg-gray-100 cursor-pointer"
        >
          <div class="font-medium text-gray-800">
            <span v-html="highlightMatch(getItemTitle(item))"></span>
          </div>
          <div v-if="showSubtitle && getItemSubtitle" class="text-sm text-gray-500">
            {{ getItemSubtitle(item) }}
          </div>
        </li>
      </ul>
      <p v-else-if="query.length > 0 && query.length < minChars" class="mt-2 text-sm text-gray-500">
        Please enter at least {{ minChars }} characters
      </p>
      <p
        v-else-if="
          query.length >= minChars &&
          (!searchResults || searchResults.length === 0) &&
          !selectedItem
        "
        class="mt-2 text-sm text-red-500"
      >
        No results found
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'

interface AutocompleteProps {
  id: string
  label: string
  placeholder: string
  minChars?: number
  searchFunction: (query: string) => Promise<any[]>
  getItemKey: (item: any) => string | number
  getItemTitle: (item: any) => string
  getItemSubtitle?: (item: any) => string
  showSubtitle?: boolean
  autoFocus?: boolean
}

const props = withDefaults(defineProps<AutocompleteProps>(), {
  minChars: 3,
  showSubtitle: false,
  autoFocus: false
})

const query = ref('')
const inputField = ref<HTMLInputElement | null>(null)
const searchResults = ref<any[]>([])
const isSearching = ref(false)
const selectedItem = ref(false)

const autocompleteContainer = ref<HTMLElement | null>(null)
const showResults = computed(
  () =>
    query.value.length >= props.minChars &&
    searchResults.value &&
    searchResults.value.length > 0 &&
    !selectedItem.value
)

const handleClickOutside = (event: MouseEvent) => {
  if (autocompleteContainer.value && !autocompleteContainer.value.contains(event.target as Node)) {
    searchResults.value = []
  }
}

const search = async () => {
  if (query.value.length >= props.minChars) {
    isSearching.value = true
    searchResults.value = await props.searchFunction(query.value)
    isSearching.value = false
    selectedItem.value = false
  } else {
    searchResults.value = []
    selectedItem.value = false
  }
}

const selectItem = (item: any) => {
  query.value = props.getItemTitle(item)
  searchResults.value = []
  isSearching.value = false
  selectedItem.value = true
}

const clearInput = () => {
  query.value = ''
  searchResults.value = []
  selectedItem.value = false
}

const highlightMatch = (text: string) => {
  if (!query.value) return text
  const regex = new RegExp(`(${query.value})`, 'gi')
  return text.replace(regex, '<span class="text-blue-500">$1</span>')
}

onMounted(() => {
  if (props.autoFocus) {
    inputField.value?.focus()
  }
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

defineOptions({
  name: 'AutocompleteInput'
})

const focusInput = () => {
  if (inputField.value) {
    inputField.value.focus()
  }
}

defineExpose({ focusInput })
</script>

<style scoped>
ul {
  list-style-type: none;
  padding: 0;
  border: 1px solid #e2e8f0;
  border-radius: 0.375rem;
}

li {
  margin-bottom: 0;
  border-bottom: 1px solid #e2e8f0;
}

li:last-child {
  border-bottom: none;
}
</style>
