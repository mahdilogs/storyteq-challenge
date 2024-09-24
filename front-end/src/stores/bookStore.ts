import { defineStore } from 'pinia'

interface Book {
  title: string
  author: string
}

export const useBookStore = defineStore('book', {
  state: () => ({
    books: [
      { title: 'Don Quixote', author: 'Miguel De Cervantes' },
      { title: "Pilgrim's Progress", author: 'John Bunyan' },
      { title: 'Robinson Crusoe', author: 'Daniel Defoe' },
      { title: "Gulliver's Travels", author: 'Jonathan Swift' },
      { title: 'Tom Jones', author: 'Henry Fielding' },
      { title: 'Clarissa', author: 'Samuel Richardson' },
      { title: 'Tristram Shandy', author: 'Laurence Sterne' }
    ],
    searchResults: [] as Book[]
  }),
  actions: {
    searchBooks(query: string) {
      if (query.length < 3) {
        this.searchResults = []
        return
      }
      this.searchResults = this.books.filter((book) =>
        book.title.toLowerCase().includes(query.toLowerCase())
      )
    }
  }
})
