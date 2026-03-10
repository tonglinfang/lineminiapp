/**
 * MonthView.jsx - Monthly calendar grid
 */

import React from 'react'
import { useCalendar } from '@/hooks/useCalendar'
import { useScheduleStore } from '@/stores/scheduleStore'
import { useCategoryStore } from '@/stores/categoryStore'
import { WEEKDAYS_SHORT } from '@/utils/constants'
import CalendarHeader from './CalendarHeader'
import DateCell from './DateCell'

export default function MonthView({ loading = false, onDateClick, onToggleView }) {
    const calendar = useCalendar()
    const scheduleStore = useScheduleStore()
    const categoryStore = useCategoryStore()

    const {
        monthGrid,
        headerDisplay,
        isToday,
        goPrev,
        goNext,
        goToday,
        selectDate,
        isSelected,
        getScheduleCount
    } = calendar

    function getCategoryColors(date) {
        const schedules = scheduleStore.getSchedulesByDate(date)
        const colors = schedules
            .map(schedule => {
                const category = categoryStore.getCategoryById(schedule.category)
                return category ? category.color : '#B0B0B0'
            })
            .filter((color, index, self) => self.indexOf(color) === index)
        return colors
    }

    function handleDateClick(dateObj) {
        selectDate(dateObj.date)
        onDateClick && onDateClick(dateObj)
    }

    return (
        <div className="month-view">
            <CalendarHeader
                title={headerDisplay}
                isToday={isToday}
                onPrev={goPrev}
                onNext={goNext}
                onToday={goToday}
                onToggleView={onToggleView}
            />

            {/* Weekday header */}
            <div className="weekday-header">
                {WEEKDAYS_SHORT.map((weekday, index) => (
                    <div
                        key={index}
                        className={`weekday-cell ${index === 0 || index === 6 ? 'is-weekend' : ''}`}
                    >
                        {weekday}
                    </div>
                ))}
            </div>

            {/* Date grid */}
            <div className="date-grid">
                {monthGrid.map(dateObj => (
                    <DateCell
                        key={dateObj.date}
                        dateObj={dateObj}
                        scheduleCount={getScheduleCount(dateObj.date)}
                        categoryColors={getCategoryColors(dateObj.date)}
                        isSelected={isSelected(dateObj.date)}
                        onClick={handleDateClick}
                    />
                ))}
            </div>

            {loading && (
                <div className="loading-overlay">
                    <div className="spinner" />
                </div>
            )}
        </div>
    )
}
