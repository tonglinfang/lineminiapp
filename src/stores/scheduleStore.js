/**
 * Schedule Store (Zustand)
 * Manages schedule data and CRUD operations
 */

import { create } from 'zustand'
import { storageService } from '@/utils/storage'
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from '@/utils/constants'
import { useUserStore } from './userStore'
import dayjs from 'dayjs'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter'
import { v4 as uuidv4 } from 'uuid'

dayjs.extend(isSameOrBefore)
dayjs.extend(isSameOrAfter)

export const useScheduleStore = create((set, get) => ({
    // State
    schedules: [],
    loading: false,
    error: null,
    selectedSchedule: null,
    filterCategory: null,
    searchQuery: '',
    viewMode: 'month',
    filterDate: null,

    // Selectors
    getActiveSchedules() {
        return get().schedules.filter(s => !s.isDeleted)
    },

    getSchedulesByDate(date) {
        return get().schedules.filter(schedule => {
            if (schedule.isDeleted) return false
            const scheduleDate = dayjs(schedule.startDate)
            const targetDate = dayjs(date)
            return scheduleDate.isSame(targetDate, 'day')
        })
    },

    getSchedulesByRange(startDate, endDate) {
        const start = dayjs(startDate).startOf('day')
        const end = dayjs(endDate).endOf('day')
        return get().schedules.filter(schedule => {
            if (schedule.isDeleted) return false
            const scheduleDate = dayjs(schedule.startDate)
            return scheduleDate.isSameOrAfter(start) && scheduleDate.isSameOrBefore(end)
        })
    },

    getSchedulesByCategory(category) {
        return get().schedules.filter(s => !s.isDeleted && s.category === category)
    },

    getUpcomingSchedules() {
        const now = dayjs()
        const nextWeek = now.add(7, 'day')
        return get().schedules
            .filter(schedule => {
                if (schedule.isDeleted || schedule.isCompleted) return false
                const scheduleDate = dayjs(schedule.startDate)
                return scheduleDate.isAfter(now) && scheduleDate.isBefore(nextWeek)
            })
            .sort((a, b) => dayjs(a.startDate).diff(dayjs(b.startDate)))
    },

    getTodaySchedules() {
        const today = dayjs().format('YYYY-MM-DD')
        return get().schedules
            .filter(schedule => {
                if (schedule.isDeleted) return false
                return dayjs(schedule.startDate).isSame(today, 'day')
            })
            .sort((a, b) => {
                const timeA = a.startTime || '00:00'
                const timeB = b.startTime || '00:00'
                return timeA.localeCompare(timeB)
            })
    },

    getFilteredSchedules() {
        const { schedules, filterDate, filterCategory, searchQuery } = get()
        let result = schedules.filter(s => !s.isDeleted)

        if (filterDate) {
            result = result.filter(s => s.startDate === filterDate)
        }
        if (filterCategory) {
            result = result.filter(s => s.category === filterCategory)
        }
        if (searchQuery) {
            const query = searchQuery.toLowerCase()
            result = result.filter(s =>
                s.title.toLowerCase().includes(query) ||
                (s.description && s.description.toLowerCase().includes(query)) ||
                (s.tags && s.tags.some(tag => tag.toLowerCase().includes(query)))
            )
        }
        return result
    },

    getScheduleCount(date) {
        return get().schedules.filter(schedule => {
            if (schedule.isDeleted) return false
            return dayjs(schedule.startDate).isSame(date, 'day')
        }).length
    },

    toggleViewMode() {
        set(state => ({ viewMode: state.viewMode === 'month' ? 'week' : 'month' }))
    },

    // Actions
    async loadSchedules() {
        set({ loading: true, error: null })
        try {
            const userStore = useUserStore.getState()
            if (!userStore.userId) throw new Error('User not logged in')

            storageService.setCurrentUser(userStore.userId)
            const schedules = storageService.getSchedules()
            set({ schedules })
            console.log(`✅ Loaded ${schedules.length} schedules`)
        } catch (err) {
            set({ error: err.message || ERROR_MESSAGES.STORAGE_ERROR })
            console.error('Failed to load schedules:', err)
        } finally {
            set({ loading: false })
        }
    },

    async persistSchedules() {
        try {
            const { schedules } = get()
            const success = storageService.saveSchedules(schedules)
            if (!success) throw new Error('Failed to save schedules')
            return true
        } catch (err) {
            console.error('Failed to persist schedules:', err)
            set({ error: ERROR_MESSAGES.STORAGE_ERROR })
            return false
        }
    },

    async createSchedule(scheduleData) {
        set({ loading: true, error: null })
        try {
            if (!scheduleData.title || !scheduleData.startDate) {
                throw new Error(ERROR_MESSAGES.REQUIRED_FIELD)
            }

            const userStore = useUserStore.getState()
            if (!userStore.userId) throw new Error('User not logged in')

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
                reminder: scheduleData.reminder || { enabled: false, type: 'local', time: 15, unit: 'minutes' },
                recurrence: scheduleData.recurrence || { enabled: false },
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                isCompleted: false,
                isDeleted: false
            }

            set(state => ({ schedules: [...state.schedules, schedule] }))
            await get().persistSchedules()

            console.log('✅ Schedule created:', schedule.id)
            return schedule
        } catch (err) {
            set({ error: err.message || ERROR_MESSAGES.SCHEDULE_CREATE_FAILED })
            console.error('Failed to create schedule:', err)
            throw err
        } finally {
            set({ loading: false })
        }
    },

    async updateSchedule(scheduleId, updates) {
        set({ loading: true, error: null })
        try {
            const { schedules } = get()
            const index = schedules.findIndex(s => s.id === scheduleId)
            if (index === -1) throw new Error('Schedule not found')

            const updated = [...schedules]
            updated[index] = { ...updated[index], ...updates, updatedAt: new Date().toISOString() }
            set({ schedules: updated })
            await get().persistSchedules()

            console.log('✅ Schedule updated:', scheduleId)
            return updated[index]
        } catch (err) {
            set({ error: err.message || ERROR_MESSAGES.SCHEDULE_UPDATE_FAILED })
            console.error('Failed to update schedule:', err)
            throw err
        } finally {
            set({ loading: false })
        }
    },

    async deleteSchedule(scheduleId) {
        try {
            await get().updateSchedule(scheduleId, { isDeleted: true })
            console.log('✅ Schedule deleted:', scheduleId)
            return true
        } catch (err) {
            set({ error: ERROR_MESSAGES.SCHEDULE_DELETE_FAILED })
            return false
        }
    },

    async permanentlyDeleteSchedule(scheduleId) {
        try {
            set(state => ({ schedules: state.schedules.filter(s => s.id !== scheduleId) }))
            await get().persistSchedules()
            return true
        } catch (err) {
            console.error('Failed to permanently delete schedule:', err)
            return false
        }
    },

    async toggleComplete(scheduleId) {
        const schedule = get().schedules.find(s => s.id === scheduleId)
        if (schedule) {
            await get().updateSchedule(scheduleId, { isCompleted: !schedule.isCompleted })
        }
    },

    selectSchedule(scheduleId) {
        set({ selectedSchedule: get().schedules.find(s => s.id === scheduleId) || null })
    },

    clearSelection() { set({ selectedSchedule: null }) },
    setFilterCategory(category) { set({ filterCategory: category }) },
    setSearchQuery(query) { set({ searchQuery: query }) },
    setFilterDate(date) { set({ filterDate: date }) },

    clearFilters() {
        set({ filterCategory: null, searchQuery: '', filterDate: null })
    },

    exportSchedules() {
        return storageService.exportData()
    },

    async importSchedules(data, merge = false) {
        try {
            const success = storageService.importData(data, merge)
            if (success) {
                await get().loadSchedules()
            }
            return success
        } catch (err) {
            console.error('Import failed:', err)
            return false
        }
    }
}))
