import { defineStore } from 'pinia'

export const useCityStore = defineStore('city', {
  state: () => ({
    cities: [
      'san jose',
      'santiago',
      'san francisco',
      'santa rosa',
      'san juan',
      'sabadell',
      'salamanca',
      'salt lake city',
      'salinas',
      'salem',
      'sausalito',
      'taipei',
      'tel aviv',
      'tempe',
      'termez',
      'temuco',
      'tiajuna',
      'tieling',
      'thousand oaks',
      'thunder bay',
      'tokyo',
      'tulsa'
    ],
    searchResults: [] as string[]
  }),
  actions: {
    searchCities(query: string) {
      if (query.length < 3) {
        this.searchResults = []
        return
      }
      const lowercaseQuery = query.toLowerCase()
      this.searchResults = this.cities.filter((city) =>
        city.toLowerCase().startsWith(lowercaseQuery)
      )
    }
  }
})
