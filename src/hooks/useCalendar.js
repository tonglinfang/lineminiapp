/**
 * useCalendar - React hook
 * Manages calendar view state and date navigation
 */

import { useState, useMemo, useEffect } from 'react'
import { useCalendarStore } from '@/stores/calendarStore'
import { useScheduleStore } from '@/stores/scheduleStore'
import { useUserStore } from '@/stores/userStore'
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
    const calendarStore = useCalendarStore()
    const scheduleStore = useScheduleStore()
    const userStore = useUserStore()

    const [currentDate, setCurrentDate] = useState(getCurrentDate())
    const [selectedDate, setSelectedDate] = useState(null)
    const [viewMode, setViewModeState] = useState(VIEW_MODES.MONTH)

    const weekStartsOn = userStore.preferences?.weekStartsOn ?? 0

    const monthGrid = useMemo(
        () => getMonthCalendarGrid(currentDate, weekStartsOn),
        [currentDate, weekStartsOn]
    )

    const weekGrid = useMemo(
        () => getWeekCalendarGrid(currentDate, weekStartsOn),
        [currentDate, weekStartsOn]
    )

    const currentGrid = useMemo(() => {
        switch (viewMode) {
            case VIEW_MODES.MONTH: return monthGrid
            case VIEW_MODES.WEEK: return weekGrid
            case VIEW_MODES.DAY:
                return [{
                    date: currentDate,
                    day: dayjs(currentDate).date(),
                    isToday: checkIsToday(currentDate),
                    isWeekend: [0, 6].includes(dayjs(currentDate).day())
                }]
            default: return monthGrid
        }
    }, [viewMode, monthGrid, weekGrid, currentDate])

    const headerDisplay = useMemo(() => {
        switch (viewMode) {
            case VIEW_MODES.MONTH:
                return getMonthYearDisplay(currentDate)
            case VIEW_MODES.WEEK: {
                const grid = weekGrid
                const firstDay = grid[0]
                const lastDay = grid[6]
                return `${formatDate(firstDay.date, 'MM月DD日')} - ${formatDate(lastDay.date, 'MM月DD日')}`
            }
            case VIEW_MODES.DAY:
                return formatDate(currentDate, 'YYYY年MM月DD日')
            default:
                return getMonthYearDisplay(currentDate)
        }
    }, [viewMode, currentDate, weekGrid])

    const currentViewSchedules = useMemo(() => {
        if (currentGrid.length === 0) return []
        const firstDate = currentGrid[0].date
        const lastDate = currentGrid[currentGrid.length - 1].date
        return scheduleStore.getSchedulesByRange(firstDate, lastDate)
    }, [currentGrid, scheduleStore.schedules])

    const isToday = useMemo(() => checkIsToday(currentDate), [currentDate])

    // Sync with calendar store
    useEffect(() => { calendarStore.setCurrentDate(currentDate) }, [currentDate])
    useEffect(() => { calendarStore.setViewMode(viewMode) }, [viewMode])
    useEffect(() => { calendarStore.setSelectedDate(selectedDate) }, [selectedDate])

    function goNext() {
        switch (viewMode) {
            case VIEW_MODES.MONTH: setCurrentDate(addMonths(currentDate, 1)); break
            case VIEW_MODES.WEEK: setCurrentDate(addWeeks(currentDate, 1)); break
            case VIEW_MODES.DAY: setCurrentDate(addDays(currentDate, 1)); break
        }
    }

    function goPrev() {
        switch (viewMode) {
            case VIEW_MODES.MONTH: setCurrentDate(addMonths(currentDate, -1)); break
            case VIEW_MODES.WEEK: setCurrentDate(addWeeks(currentDate, -1)); break
            case VIEW_MODES.DAY: setCurrentDate(addDays(currentDate, -1)); break
        }
    }

    function goToday() {
        const today = getCurrentDate()
        setCurrentDate(today)
        setSelectedDate(today)
    }

    function goToDate(date) {
        setCurrentDate(date)
        setSelectedDate(date)
    }

    function selectDate(date) {
        setSelectedDate(date)
    }

    function clearSelection() {
        setSelectedDate(null)
    }

    function setViewMode(mode) {
        if (Object.values(VIEW_MODES).includes(mode)) {
            setViewModeState(mode)
            userStore.updatePreference('defaultView', mode)
        }
    }

    function toggleMonthWeek() {
        setViewMode(viewMode === VIEW_MODES.MONTH ? VIEW_MODES.WEEK : VIEW_MODES.MONTH)
    }

    function isSelected(date) {
        return selectedDate === date
    }

    function hasSchedules(date) {
        return scheduleStore.getScheduleCount(date) > 0
    }

    function getScheduleCount(date) {
        return scheduleStore.getScheduleCount(date)
    }

    function getSchedulesForDate(date) {
        return scheduleStore.getSchedulesByDate(date)
    }

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

    function handleDateClick(dateObj) {
        selectDate(dateObj.date)
        if (viewMode === VIEW_MODES.MONTH && !dateObj.isCurrentMonth) {
            setCurrentDate(dateObj.date)
        }
    }

    function initialize() {
        const defaultView = userStore.preferences?.defaultView
        if (defaultView) setViewModeState(defaultView)
        setCurrentDate(getCurrentDate())
    }

    return {
        currentDate,
        selectedDate,
        viewMode,
        weekStartsOn,
        monthGrid,
        weekGrid,
        currentGrid,
        headerDisplay,
        currentViewSchedules,
        isToday,
        goNext,
        goPrev,
        goToday,
        goToDate,
        selectDate,
        clearSelection,
        isSelected,
        setViewMode,
        toggleMonthWeek,
        hasSchedules,
        getScheduleCount,
        getSchedulesForDate,
        getDateClass,
        handleDateClick,
        initialize
    }
}
