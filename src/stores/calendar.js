/**
 * Calendar Store
 * Manages calendar view state
 */

import { defineStore } from 'pinia'
import { getCurrentDate } from '@/utils/date'
import { VIEW_MODES } from '@/utils/constants'

export const useCalendarStore = defineStore('calendar', {
  state: () => ({
    currentDate: getCurrentDate(),
    viewMode: VIEW_MODES.MONTH,
    selectedDate: null,
    highlightedDates: [], // Dates to highlight (e.g., with important events)
    disabledDates: [] // Dates to disable (e.g., past dates for booking)
  }),

  getters: {
    /**
     * Check if currently viewing month mode
     */
    isMonthView: (state) => state.viewMode === VIEW_MODES.MONTH,

    /**
     * Check if currently viewing week mode
     */
    isWeekView: (state) => state.viewMode === VIEW_MODES.WEEK,

    /**
     * Check if currently viewing day mode
     */
    isDayView: (state) => state.viewMode === VIEW_MODES.DAY,

    /**
     * Check if currently viewing list mode
     */
    isListView: (state) => state.viewMode === VIEW_MODES.LIST,

    /**
     * Get current month (0-11)
     */
    currentMonth: (state) => {
      return new Date(state.currentDate).getMonth()
    },

    /**
     * Get current year
     */
    currentYear: (state) => {
      return new Date(state.currentDate).getFullYear()
    },

    /**
     * Check if a date is highlighted
     * @param {string} date - Date in ISO format
     */
    isHighlighted: (state) => (date) => {
      return state.highlightedDates.includes(date)
    },

    /**
     * Check if a date is disabled
     * @param {string} date - Date in ISO format
     */
    isDisabled: (state) => (date) => {
      return state.disabledDates.includes(date)
    }
  },

  actions: {
    /**
     * Set current date
     * @param {string} date - Date in ISO format
     */
    setCurrentDate(date) {
      this.currentDate = date
    },

    /**
     * Set view mode
     * @param {string} mode - View mode
     */
    setViewMode(mode) {
      if (Object.values(VIEW_MODES).includes(mode)) {
        this.viewMode = mode
      }
    },

    /**
     * Set selected date
     * @param {string|null} date - Date in ISO format or null
     */
    setSelectedDate(date) {
      this.selectedDate = date
    },

    /**
     * Clear selected date
     */
    clearSelectedDate() {
      this.selectedDate = null
    },

    /**
     * Add highlighted date
     * @param {string} date - Date in ISO format
     */
    addHighlightedDate(date) {
      if (!this.highlightedDates.includes(date)) {
        this.highlightedDates.push(date)
      }
    },

    /**
     * Remove highlighted date
     * @param {string} date - Date in ISO format
     */
    removeHighlightedDate(date) {
      this.highlightedDates = this.highlightedDates.filter(d => d !== date)
    },

    /**
     * Clear all highlighted dates
     */
    clearHighlightedDates() {
      this.highlightedDates = []
    },

    /**
     * Add disabled date
     * @param {string} date - Date in ISO format
     */
    addDisabledDate(date) {
      if (!this.disabledDates.includes(date)) {
        this.disabledDates.push(date)
      }
    },

    /**
     * Remove disabled date
     * @param {string} date - Date in ISO format
     */
    removeDisabledDate(date) {
      this.disabledDates = this.disabledDates.filter(d => d !== date)
    },

    /**
     * Clear all disabled dates
     */
    clearDisabledDates() {
      this.disabledDates = []
    },

    /**
     * Reset calendar to default state
     */
    reset() {
      this.currentDate = getCurrentDate()
      this.viewMode = VIEW_MODES.MONTH
      this.selectedDate = null
      this.highlightedDates = []
      this.disabledDates = []
    }
  }
})

