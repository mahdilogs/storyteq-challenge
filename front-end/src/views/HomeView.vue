<template>
  <div class="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
    <div class="relative sm:max-w-xl sm:mx-auto">
      <div class="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
        <h1 class="text-4xl font-bold mb-8 text-center text-gray-800">City and Book Search</h1>
        <div class="space-y-8">
          <BookAutocomplete :autoFocus="true" />
          <CityAutocomplete />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import CityAutocomplete from '@/components/features/CityAutocomplete/CityAutocomplete.vue'
import BookAutocomplete from '@/components/features/BookAutocomplete/BookAutocomplete.vue'
</script>
