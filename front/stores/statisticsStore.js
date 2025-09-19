import { defineStore } from 'pinia'

export const useStatisticsStore = defineStore('statistics', {
  state: () => ({
    currentTransactions: [],
    currentFilters: {},
    isVisible: false
  }),

  actions: {
    updateData(transactions, filters) {
      console.log('StatisticsStore updateData called:', {
        transactionsCount: transactions?.length || 0,
        firstTransaction: transactions?.[0],
        // Sprawdźmy czy response ma included z pełnymi obiektami
        fullResponse: transactions?._response || transactions?.meta
      })
      this.currentTransactions = transactions || []
      this.currentFilters = filters || {}
    },

    show() {
      this.isVisible = true
    },

    hide() {
      this.isVisible = false
    }
  },

  getters: {
    hasData: (state) => state.currentTransactions.length > 0
  }
})