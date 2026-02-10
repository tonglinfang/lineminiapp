/**
 * Calendar Composable
 * Manages calendar view state and date navigation
 */

import { ref, computed, watch } from 'vue'
import { useCalendarStore } from '@/stores/calendar'
import { useScheduleStore } from '@/stores/schedule'
import { useUserStore } from '@/stores/user'
import {
  getCurrentDate,
  addMonths,
  addWeeks,
  addDays,
  getMonthCalendarGrid,
  getWeekCalendarGrid,
  getMonthYearDisplay,
  isToday as checkIsToday,
  formatDate
} from '@/utils/date'
import { VIEW_MODES } from '@/utils/constants'
import dayjs from 'dayjs'

export function useCalendar() {
  // Stores
  const calendarStore = useCalendarStore()
  const scheduleStore = useScheduleStore()
  const userStore = useUserStore()

  // Local reactive state
  const currentDate = ref(getCurrentDate())
  const selectedDate = ref(null)
  const viewMode = ref(VIEW_MODES.MONTH)

  // Get week start preference from user settings
  const weekStartsOn = computed(() => userStore.preferences.weekStartsOn)

  /**
   * Generate month calendar grid (42 cells)
   */
  const monthGrid = computed(() => {
    return getMonthCalendarGrid(currentDate.value, weekStartsOn.value)
  })

  /**
   * Generate week calendar grid (7 cells)
   */
  const weekGrid = computed(() => {
    return getWeekCalendarGrid(currentDate.value, weekStartsOn.value)
  })

  /**
   * Get current view grid based on view mode
   */
  const currentGrid = computed(() => {
    switch (viewMode.value) {
      case VIEW_MODES.MONTH:
        return monthGrid.value
      case VIEW_MODES.WEEK:
        return weekGrid.value
      case VIEW_MODES.DAY:
        return [{
          date: currentDate.value,
          day: dayjs(currentDate.value).date(),
          isToday: checkIsToday(currentDate.value),
          isWeekend: dayjs(currentDate.value).day() === 0 || dayjs(currentDate.value).day() === 6
        }]
      default:
        return monthGrid.value
    }
  })

  /**
   * Get header display text (e.g., "2026年2月" or "2月15日 - 2月21日")
   */
  const headerDisplay = computed(() => {
    switch (viewMode.value) {
      case VIEW_MODES.MONTH:
        return getMonthYearDisplay(currentDate.value)
      case VIEW_MODES.WEEK: {
        const grid = weekGrid.value
        const firstDay = grid[0]
        const lastDay = grid[6]
        return `${formatDate(firstDay.date, 'MM月DD日')} - ${formatDate(lastDay.date, 'MM月DD日')}`
      }
      case VIEW_MODES.DAY:
        return formatDate(currentDate.value, 'YYYY年MM月DD日')
      default:
        return getMonthYearDisplay(currentDate.value)
    }
  })

  /**
   * Check if a date has schedules
   * @param {string} date - Date in ISO format
   * @returns {boolean}
   */
  function hasSchedules(date) {
    return scheduleStore.getScheduleCount(date) > 0
  }

  /**
   * Get schedule count for a date
   * @param {string} date - Date in ISO format
   * @returns {number}
   */
  function getScheduleCount(date) {
    return scheduleStore.getScheduleCount(date)
  }

  /**
   * Get schedules for a date
   * @param {string} date - Date in ISO format
   * @returns {Array}
   */
  function getSchedulesForDate(date) {
    return scheduleStore.getSchedulesByDate(date)
  }

  /**
   * Get schedules for current view
   * @returns {Array}
   */
  const currentViewSchedules = computed(() => {
    const grid = currentGrid.value
    if (grid.length === 0) return []

    const firstDate = grid[0].date
    const lastDate = grid[grid.length - 1].date

    return scheduleStore.getSchedulesByRange(firstDate, lastDate)
  })

  /**
   * Navigate to next period (month/week/day)
   */
  function goNext() {
    switch (viewMode.value) {
      case VIEW_MODES.MONTH:
        currentDate.value = addMonths(currentDate.value, 1)
        break
      case VIEW_MODES.WEEK:
        currentDate.value = addWeeks(currentDate.value, 1)
        break
      case VIEW_MODES.DAY:
        currentDate.value = addDays(currentDate.value, 1)
        break
    }
  }

  /**
   * Navigate to previous period (month/week/day)
   */
  function goPrev() {
    switch (viewMode.value) {
      case VIEW_MODES.MONTH:
        currentDate.value = addMonths(currentDate.value, -1)
        break
      case VIEW_MODES.WEEK:
        currentDate.value = addWeeks(currentDate.value, -1)
        break
      case VIEW_MODES.DAY:
        currentDate.value = addDays(currentDate.value, -1)
        break
    }
  }

  /**
   * Navigate to today
   */
  function goToday() {
    currentDate.value = getCurrentDate()
    selectedDate.value = currentDate.value
  }

  /**
   * Navigate to a specific date
   * @param {string} date - Date in ISO format
   */
  function goToDate(date) {
    currentDate.value = date
    selectedDate.value = date
  }

  /**
   * Select a date
   * @param {string} date - Date in ISO format
   */
  function selectDate(date) {
    selectedDate.value = date
  }

  /**
   * Clear date selection
   */
  function clearSelection() {
    selectedDate.value = null
  }

  /**
   * Change view mode
   * @param {string} mode - View mode (month/week/day/list)
   */
  function setViewMode(mode) {
    if (Object.values(VIEW_MODES).includes(mode)) {
      viewMode.value = mode

      // Save preference
      userStore.updatePreference('defaultView', mode)
    }
  }

  /**
   * Toggle between month and week views
   */
  function toggleMonthWeek() {
    if (viewMode.value === VIEW_MODES.MONTH) {
      setViewMode(VIEW_MODES.WEEK)
    } else {
      setViewMode(VIEW_MODES.MONTH)
    }
  }

  /**
   * Check if current date is today
   */
  const isToday = computed(() => {
    return checkIsToday(currentDate.value)
  })

  /**
   * Check if a specific date is selected
   * @param {string} date - Date to check
   */
  function isSelected(date) {
    return selectedDate.value === date
  }

  /**
   * Get CSS class for a date cell
   * @param {Object} dateObj - Date object from grid
   * @returns {Object} Class map
   */
  function getDateClass(dateObj) {
    return {
      'is-today': dateObj.isToday,
      'is-selected': isSelected(dateObj.date),
      'is-weekend': dateObj.isWeekend,
      'is-past': dateObj.isPast,
      'is-future': dateObj.isFuture,
      'is-other-month': !dateObj.isCurrentMonth,
      'has-schedules': hasSchedules(dateObj.date)
    }
  }

  /**
   * Handle date cell click
   * @param {Object} dateObj - Date object from grid
   */
  function handleDateClick(dateObj) {
    selectDate(dateObj.date)

    // If clicking on other month's date in month view, navigate to that month
    if (viewMode.value === VIEW_MODES.MONTH && !dateObj.isCurrentMonth) {
      currentDate.value = dateObj.date
    }

    // Emit event or callback (can be extended)
    console.log('Date clicked:', dateObj.date)
  }

  /**
   * Initialize calendar with user's default view
   */
  function initialize() {
    const defaultView = userStore.preferences.defaultView
    if (defaultView) {
      viewMode.value = defaultView
    }

    // Set current date
    currentDate.value = getCurrentDate()

    // Sync with calendar store
    calendarStore.setCurrentDate(currentDate.value)
    calendarStore.setViewMode(viewMode.value)
  }

  /**
   * Sync local state with calendar store
   */
  watch(currentDate, (newDate) => {
    calendarStore.setCurrentDate(newDate)
  })

  watch(viewMode, (newMode) => {
    calendarStore.setViewMode(newMode)
  })

  watch(selectedDate, (newDate) => {
    calendarStore.setSelectedDate(newDate)
  })

  return {
    // State
    currentDate,
    selectedDate,
    viewMode,
    weekStartsOn,

    // Computed
    monthGrid,
    weekGrid,
    currentGrid,
    headerDisplay,
    currentViewSchedules,
    isToday,

    // Methods - Navigation
    goNext,
    goPrev,
    goToday,
    goToDate,

    // Methods - Selection
    selectDate,
    clearSelection,
    isSelected,

    // Methods - View Mode
    setViewMode,
    toggleMonthWeek,

    // Methods - Schedule queries
    hasSchedules,
    getScheduleCount,
    getSchedulesForDate,

    // Methods - Utilities
    getDateClass,
    handleDateClick,
    initialize
  }
}
