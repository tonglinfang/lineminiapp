/**
 * Home.jsx - Main calendar view
 */

import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useScheduleStore } from '@/stores/scheduleStore'
import { useCategoryStore } from '@/stores/categoryStore'
import MonthView from '@/components/calendar/MonthView'
import WeekView from '@/components/calendar/WeekView'
import EmptyState from '@/components/common/EmptyState'

export default function Home() {
    const navigate = useNavigate()
    const scheduleStore = useScheduleStore()
    const categoryStore = useCategoryStore()

    const todaySchedules = scheduleStore.getTodaySchedules()
    const isMonthView = scheduleStore.viewMode === 'month'

    function getCategoryColor(categoryId) {
        const category = categoryStore.getCategoryById(categoryId)
        return category ? category.color : '#B0B0B0'
    }

    function getCategoryName(categoryId) {
        const category = categoryStore.getCategoryById(categoryId)
        return category ? category.name : 'その他'
    }

    function handleDateClick(dateObj) {
        if (dateObj?.date) {
            navigate(`/schedules?date=${dateObj.date}`)
        }
    }

    function handleScheduleClick(schedule) {
        if (schedule?.id) {
            navigate(`/schedule/${schedule.id}`)
        }
    }

    function handleToggleView() {
        scheduleStore.toggleViewMode()
    }

    function handleCreateSchedule() {
        navigate('/schedule/create')
    }

    useEffect(() => {
        console.log('Home view mounted')
    }, [])

    return (
        <div className="home-view">
            {isMonthView ? (
                <MonthView
                    loading={scheduleStore.loading}
                    onDateClick={handleDateClick}
                    onToggleView={handleToggleView}
                />
            ) : (
                <WeekView
                    onDateClick={handleDateClick}
                    onScheduleClick={handleScheduleClick}
                    onToggleView={handleToggleView}
                />
            )}

            {/* Today's schedules */}
            {todaySchedules.length > 0 ? (
                <div className="today-section">
                    <h3 className="section-title">今日の予定</h3>
                    <div className="schedule-list">
                        {todaySchedules.map(schedule => (
                            <div
                                key={schedule.id}
                                className="schedule-card"
                                style={{ borderLeftColor: getCategoryColor(schedule.category) }}
                                onClick={() => handleScheduleClick(schedule)}
                            >
                                <div className="schedule-time">
                                    {schedule.isAllDay ? '終日' : schedule.startTime}
                                </div>
                                <div className="schedule-content">
                                    <div className="schedule-title">{schedule.title}</div>
                                    {schedule.description && (
                                        <div className="schedule-description">{schedule.description}</div>
                                    )}
                                </div>
                                <span className="tag tag-outline" style={{ color: getCategoryColor(schedule.category), borderColor: getCategoryColor(schedule.category) }}>
                                    {getCategoryName(schedule.category)}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <EmptyState
                    icon="📅"
                    title="今日の予定はありません"
                    description="カレンダーの日付をクリックして新しいスケジュールを作成"
                    actionText="スケジュールを作成"
                    onAction={handleCreateSchedule}
                />
            )}

            {/* Floating action button */}
            <button
                className="fab"
                onClick={handleCreateSchedule}
                aria-label="スケジュールを作成"
            >
                ＋
            </button>
        </div>
    )
}
