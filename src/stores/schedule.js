/**
 * Schedule Store
 * Manages schedule data and CRUD operations
 */

import { defineStore } from 'pinia'
import { storageService } from '@/utils/storage'
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from '@/utils/constants'
import { useUserStore } from './user'
import { useNotification } from '@/composables/useNotification'
import { v4 as uuidv4 } from 'uuid'
import dayjs from 'dayjs'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter'

dayjs.extend(isSameOrBefore)
dayjs.extend(isSameOrAfter)

export const useScheduleStore = defineStore('schedule', {
  state: () => ({
    schedules: [],
    loading: false,
    error: null,
    selectedSchedule: null,
    filterCategory: null,
    searchQuery: ''
  }),

  getters: {
    /**
     * Get all active (non-deleted) schedules
     */
    activeSchedules: (state) => {
      return state.schedules.filter(s => !s.isDeleted)
    },

    /**
     * Get schedules for a specific date
     * @param {string} date - Date in YYYY-MM-DD format
     */
    getSchedulesByDate: (state) => (date) => {
      return state.schedules.filter(schedule => {
        if (schedule.isDeleted) return false

        const scheduleDate = dayjs(schedule.startDate)
        const targetDate = dayjs(date)

        // Check if schedule falls on this date
        if (schedule.isAllDay) {
          return scheduleDate.isSame(targetDate, 'day')
        } else {
          // For timed events, check if it starts on this day
          return scheduleDate.isSame(targetDate, 'day')
        }
      })
    },

    /**
     * Get schedules within a date range
     * @param {string} startDate - Start date (YYYY-MM-DD)
     * @param {string} endDate - End date (YYYY-MM-DD)
     */
    getSchedulesByRange: (state) => (startDate, endDate) => {
      const start = dayjs(startDate).startOf('day')
      const end = dayjs(endDate).endOf('day')

      return state.schedules.filter(schedule => {
        if (schedule.isDeleted) return false

        const scheduleDate = dayjs(schedule.startDate)
        return scheduleDate.isSameOrAfter(start) && scheduleDate.isSameOrBefore(end)
      })
    },

    /**
     * Get schedules by category
     * @param {string} category - Category ID
     */
    getSchedulesByCategory: (state) => (category) => {
      return state.schedules.filter(
        s => !s.isDeleted && s.category === category
      )
    },

    /**
     * Get upcoming schedules (next 7 days)
     */
    upcomingSchedules: (state) => {
      const now = dayjs()
      const nextWeek = now.add(7, 'day')

      return state.schedules
        .filter(schedule => {
          if (schedule.isDeleted || schedule.isCompleted) return false

          const scheduleDate = dayjs(schedule.startDate)
          return scheduleDate.isAfter(now) && scheduleDate.isBefore(nextWeek)
        })
        .sort((a, b) => dayjs(a.startDate).diff(dayjs(b.startDate)))
    },

    /**
     * Get today's schedules
     */
    todaySchedules: (state) => {
      const today = dayjs().format('YYYY-MM-DD')
      return state.schedules
        .filter(schedule => {
          if (schedule.isDeleted) return false
          return dayjs(schedule.startDate).isSame(today, 'day')
        })
        .sort((a, b) => {
          // Sort by time
          const timeA = a.startTime || '00:00'
          const timeB = b.startTime || '00:00'
          return timeA.localeCompare(timeB)
        })
    },

    /**
     * Get filtered schedules (by category and search)
     */
    filteredSchedules: (state) => {
      let result = state.schedules.filter(s => !s.isDeleted)

      // Filter by category
      if (state.filterCategory) {
        result = result.filter(s => s.category === state.filterCategory)
      }

      // Filter by search query
      if (state.searchQuery) {
        const query = state.searchQuery.toLowerCase()
        result = result.filter(s =>
          s.title.toLowerCase().includes(query) ||
          (s.description && s.description.toLowerCase().includes(query)) ||
          (s.tags && s.tags.some(tag => tag.toLowerCase().includes(query)))
        )
      }

      return result
    },

    /**
     * Get count of schedules for a date (for calendar badges)
     */
    getScheduleCount: (state) => (date) => {
      return state.schedules.filter(schedule => {
        if (schedule.isDeleted) return false
        return dayjs(schedule.startDate).isSame(date, 'day')
      }).length
    }
  },

  actions: {
    /**
     * Load schedules from localStorage
     */
    async loadSchedules() {
      this.loading = true
      this.error = null

      try {
        const userStore = useUserStore()
        if (!userStore.userId) {
          throw new Error('User not logged in')
        }

        // Set current user in storage service
        storageService.setCurrentUser(userStore.userId)

        // Load schedules
        this.schedules = storageService.getSchedules()
        console.log(`✅ Loaded ${this.schedules.length} schedules`)
      } catch (err) {
        this.error = err.message || ERROR_MESSAGES.STORAGE_ERROR
        console.error('Failed to load schedules:', err)
      } finally {
        this.loading = false
      }
    },

    /**
     * Persist schedules to localStorage
     */
    async persistSchedules() {
      try {
        const success = storageService.saveSchedules(this.schedules)
        if (!success) {
          throw new Error('Failed to save schedules')
        }
        return true
      } catch (err) {
        console.error('Failed to persist schedules:', err)
        this.error = ERROR_MESSAGES.STORAGE_ERROR
        return false
      }
    },

    /**
     * Create a new schedule
     * @param {Object} scheduleData - Schedule data
     */
    async createSchedule(scheduleData) {
      this.loading = true
      this.error = null

      try {
        // Validate required fields
        if (!scheduleData.title || !scheduleData.startDate) {
          throw new Error(ERROR_MESSAGES.REQUIRED_FIELD)
        }

        const userStore = useUserStore()
        if (!userStore.userId) {
          throw new Error('User not logged in')
        }

        // Create schedule object
        const schedule = {
          id: uuidv4(),
          userId: userStore.userId,
          title: scheduleData.title,
          description: scheduleData.description || '',
          startDate: scheduleData.startDate,
          startTime: scheduleData.startTime || '00:00',
          endDate: scheduleData.endDate || scheduleData.startDate,
          endTime: scheduleData.endTime || scheduleData.startTime || '00:00',
          isAllDay: scheduleData.isAllDay || false,
          category: scheduleData.category || 'other',
          tags: scheduleData.tags || [],
          color: scheduleData.color || '#B0B0B0',
          reminder: scheduleData.reminder || {
            enabled: false,
            type: 'local',
            time: 15,
            unit: 'minutes'
          },
          recurrence: scheduleData.recurrence || {
            enabled: false
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isCompleted: false,
          isDeleted: false
        }

        // Add to store
        this.schedules.push(schedule)

        // Persist to storage
        await this.persistSchedules()

        // Schedule notification if enabled
        if (schedule.reminder.enabled) {
          this.scheduleNotification(schedule)
        }

        console.log('✅ Schedule created:', schedule.id)
        return schedule
      } catch (err) {
        this.error = err.message || ERROR_MESSAGES.SCHEDULE_CREATE_FAILED
        console.error('Failed to create schedule:', err)
        throw err
      } finally {
        this.loading = false
      }
    },

    /**
     * Update an existing schedule
     * @param {string} scheduleId - Schedule ID
     * @param {Object} updates - Fields to update
     */
    async updateSchedule(scheduleId, updates) {
      this.loading = true
      this.error = null

      try {
        const index = this.schedules.findIndex(s => s.id === scheduleId)
        if (index === -1) {
          throw new Error('Schedule not found')
        }

        // Update schedule
        this.schedules[index] = {
          ...this.schedules[index],
          ...updates,
          updatedAt: new Date().toISOString()
        }

        // Persist to storage
        await this.persistSchedules()

        // Reschedule notification if reminder changed
        if (updates.reminder) {
          this.scheduleNotification(this.schedules[index])
        }

        console.log('✅ Schedule updated:', scheduleId)
        return this.schedules[index]
      } catch (err) {
        this.error = err.message || ERROR_MESSAGES.SCHEDULE_UPDATE_FAILED
        console.error('Failed to update schedule:', err)
        throw err
      } finally {
        this.loading = false
      }
    },

    /**
     * Delete a schedule (soft delete)
     * @param {string} scheduleId - Schedule ID
     */
    async deleteSchedule(scheduleId) {
      try {
        await this.updateSchedule(scheduleId, { isDeleted: true })
        console.log('✅ Schedule deleted:', scheduleId)
        return true
      } catch (err) {
        this.error = ERROR_MESSAGES.SCHEDULE_DELETE_FAILED
        console.error('Failed to delete schedule:', err)
        return false
      }
    },

    /**
     * Permanently delete a schedule
     * @param {string} scheduleId - Schedule ID
     */
    async permanentlyDeleteSchedule(scheduleId) {
      try {
        this.schedules = this.schedules.filter(s => s.id !== scheduleId)
        await this.persistSchedules()
        console.log('✅ Schedule permanently deleted:', scheduleId)
        return true
      } catch (err) {
        console.error('Failed to permanently delete schedule:', err)
        return false
      }
    },

    /**
     * Toggle schedule completion status
     * @param {string} scheduleId - Schedule ID
     */
    async toggleComplete(scheduleId) {
      const schedule = this.schedules.find(s => s.id === scheduleId)
      if (schedule) {
        await this.updateSchedule(scheduleId, {
          isCompleted: !schedule.isCompleted
        })
      }
    },

    /**
     * Select a schedule (for editing/viewing)
     * @param {string} scheduleId - Schedule ID
     */
    selectSchedule(scheduleId) {
      this.selectedSchedule = this.schedules.find(s => s.id === scheduleId) || null
    },

    /**
     * Clear selected schedule
     */
    clearSelection() {
      this.selectedSchedule = null
    },

    /**
     * Set category filter
     * @param {string} category - Category ID or null
     */
    setFilterCategory(category) {
      this.filterCategory = category
    },

    /**
     * Set search query
     * @param {string} query - Search query
     */
    setSearchQuery(query) {
      this.searchQuery = query
    },

    /**
     * Clear all filters
     */
    clearFilters() {
      this.filterCategory = null
      this.searchQuery = ''
    },

    /**
     * Schedule a notification for a schedule
     * @param {Object} schedule - Schedule object
     */
    scheduleNotification(schedule) {
      // Use notification composable to schedule
      const { scheduleNotification } = useNotification()
      return scheduleNotification(schedule)
    },

    /**
     * Export all schedules
     */
    exportSchedules() {
      return storageService.exportData()
    },

    /**
     * Import schedules
     * @param {Object} data - Import data
     * @param {boolean} merge - Merge with existing data
     */
    async importSchedules(data, merge = false) {
      try {
        const success = storageService.importData(data, merge)
        if (success) {
          await this.loadSchedules()
        }
        return success
      } catch (err) {
        console.error('Import failed:', err)
        return false
      }
    }
  }
})

