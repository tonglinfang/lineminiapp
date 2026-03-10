/**
 * WeekView.jsx - Weekly calendar view
 */

import React from 'react'
import { useCalendar } from '@/hooks/useCalendar'
import { useScheduleStore } from '@/stores/scheduleStore'
import { useCategoryStore } from '@/stores/categoryStore'
import CalendarHeader from './CalendarHeader'

export default function WeekView({ onDateClick, onScheduleClick, onToggleView }) {
    const calendar = useCalendar()
    const scheduleStore = useScheduleStore()
    const categoryStore = useCategoryStore()

    const {
        weekGrid,
        headerDisplay,
        isToday,
        goPrev,
        goNext,
        goToday,
        selectDate,
        isSelected,
        getSchedulesForDate
    } = calendar

    function getCategoryColor(categoryId) {
        const category = categoryStore.getCategoryById(categoryId)
        return category ? category.color : '#B0B0B0'
    }

    function getDayClasses(dateObj) {
        return [
            'week-day',
            dateObj.isToday ? 'is-today' : '',
            isSelected(dateObj.date) ? 'is-selected' : '',
            dateObj.isWeekend ? 'is-weekend' : '',
            dateObj.isPast ? 'is-past' : ''
        ].filter(Boolean).join(' ')
    }

    function handleDateClick(dateObj) {
        selectDate(dateObj.date)
        onDateClick && onDateClick(dateObj)
    }

    return (
        <div className="week-view">
            <CalendarHeader
                title={headerDisplay}
                isToday={isToday}
                onPrev={goPrev}
                onNext={goNext}
                onToday={goToday}
                onToggleView={onToggleView}
            />

            <div className="week-grid">
                {weekGrid.map(dateObj => {
                    const daySchedules = getSchedulesForDate(dateObj.date)
                    return (
                        <div
                            key={dateObj.date}
                            className={getDayClasses(dateObj)}
                            onClick={() => handleDateClick(dateObj)}
                        >
                            <div className="day-header">
                                <span className="weekday">{dateObj.weekdayShort}</span>
                                <span className="day-number">{dateObj.day}</span>
                            </div>

                            <div className="day-schedules">
                                {daySchedules.map(schedule => (
                                    <div
                                        key={schedule.id}
                                        className="schedule-item"
                                        style={{ borderLeftColor: getCategoryColor(schedule.category) }}
                                        onClick={e => {
                                            e.stopPropagation()
                                            onScheduleClick && onScheduleClick(schedule)
                                        }}
                                    >
                                        <div className="schedule-time">
                                            {schedule.isAllDay ? '終日' : schedule.startTime}
                                        </div>
                                        <div className="schedule-title">{schedule.title}</div>
                                    </div>
                                ))}

                                {daySchedules.length === 0 && (
                                    <div className="day-empty">
                                        <span>📅</span>
                                        <span>予定なし</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
