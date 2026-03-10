/**
 * Calendar Store (Zustand)
 * Manages calendar view state
 */

import { create } from 'zustand'
import { getCurrentDate } from '@/utils/date'
import { VIEW_MODES } from '@/utils/constants'

export const useCalendarStore = create((set, get) => ({
    // State
    currentDate: getCurrentDate(),
    viewMode: VIEW_MODES.MONTH,
    selectedDate: null,
    highlightedDates: [],
    disabledDates: [],

    // Selectors
    get isMonthView() { return get().viewMode === VIEW_MODES.MONTH },
    get isWeekView() { return get().viewMode === VIEW_MODES.WEEK },
    get isDayView() { return get().viewMode === VIEW_MODES.DAY },
    get isListView() { return get().viewMode === VIEW_MODES.LIST },
    get currentMonth() { return new Date(get().currentDate).getMonth() },
    get currentYear() { return new Date(get().currentDate).getFullYear() },

    // Actions
    setCurrentDate(date) { set({ currentDate: date }) },

    setViewMode(mode) {
        if (Object.values(VIEW_MODES).includes(mode)) {
            set({ viewMode: mode })
        }
    },

    setSelectedDate(date) { set({ selectedDate: date }) },
    clearSelectedDate() { set({ selectedDate: null }) },

    addHighlightedDate(date) {
        if (!get().highlightedDates.includes(date)) {
            set(state => ({ highlightedDates: [...state.highlightedDates, date] }))
        }
    },

    removeHighlightedDate(date) {
        set(state => ({ highlightedDates: state.highlightedDates.filter(d => d !== date) }))
    },

    clearHighlightedDates() { set({ highlightedDates: [] }) },

    addDisabledDate(date) {
        if (!get().disabledDates.includes(date)) {
            set(state => ({ disabledDates: [...state.disabledDates, date] }))
        }
    },

    removeDisabledDate(date) {
        set(state => ({ disabledDates: state.disabledDates.filter(d => d !== date) }))
    },

    clearDisabledDates() { set({ disabledDates: [] }) },

    reset() {
        set({
            currentDate: getCurrentDate(),
            viewMode: VIEW_MODES.MONTH,
            selectedDate: null,
            highlightedDates: [],
            disabledDates: []
        })
    }
}))
