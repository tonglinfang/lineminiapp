/**
 * ScheduleDetail.jsx - Schedule detail view
 */

import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useScheduleStore } from '@/stores/scheduleStore'
import { useCategoryStore } from '@/stores/categoryStore'
import { formatDate, formatTime } from '@/utils/date'
import { REMINDER_OPTIONS } from '@/utils/constants'

export default function ScheduleDetail() {
    const navigate = useNavigate()
    const { id } = useParams()
    const scheduleStore = useScheduleStore()
    const categoryStore = useCategoryStore()

    const [loading, setLoading] = useState(true)
    const [schedule, setSchedule] = useState(null)
    const [isCompleted, setIsCompleted] = useState(false)

    useEffect(() => {
        const found = scheduleStore.schedules.find(s => s.id === id) || null
        setSchedule(found)
        setIsCompleted(!!found?.isCompleted)
        setLoading(false)
    }, [id, scheduleStore.schedules])

    const category = schedule ? categoryStore.getCategoryById(schedule.category) : null
    const categoryColor = category?.color || '#B0B0B0'
    const categoryIcon = category?.name?.charAt(0) || '?'
    const categoryName = category?.name || 'その他'
    const scheduleColor = schedule?.color || categoryColor

    const dateRangeDisplay = schedule ? (() => {
        const start = formatDate(schedule.startDate)
        const end = schedule.endDate ? formatDate(schedule.endDate) : start
        return start === end ? start : `${start} - ${end}`
    })() : ''

    const timeRangeDisplay = schedule ? (() => {
        const start = schedule.startTime ? formatTime(schedule.startTime) : ''
        const end = schedule.endTime ? formatTime(schedule.endTime) : ''
        if (!start && !end) return ''
        if (!end) return start
        return `${start} - ${end}`
    })() : ''

    const reminderDisplay = (() => {
        if (!schedule?.reminder?.enabled) return 'リマインダーなし'
        const option = REMINDER_OPTIONS.find(
            item => item.value === schedule.reminder.time && item.unit === schedule.reminder.unit
        )
        return option ? option.label : `${schedule.reminder.time}${schedule.reminder.unit}前`
    })()

    async function handleDelete() {
        if (!schedule) return
        if (window.confirm(`「${schedule.title}」を削除してもよろしいですか？`)) {
            const success = await scheduleStore.deleteSchedule(schedule.id)
            if (success) {
                alert('削除しました')
                navigate('/schedules')
            } else {
                alert('削除できませんでした')
            }
        }
    }

    async function handleToggleComplete() {
        if (!schedule) return
        await scheduleStore.toggleComplete(schedule.id)
        const updated = scheduleStore.schedules.find(s => s.id === schedule.id)
        setIsCompleted(!!updated?.isCompleted)
    }

    if (loading) {
        return (
            <div className="loading-state-center">
                <div className="spinner" />
            </div>
        )
    }

    if (!schedule) {
        return (
            <div className="schedule-detail-view">
                <div className="nav-bar">
                    <button className="nav-back btn btn-icon" onClick={() => navigate(-1)}>‹</button>
                    <h2 className="nav-title">スケジュール詳細</h2>
                </div>
                <div className="empty-state">
                    <p>スケジュールが見つかりません</p>
                    <button className="btn btn-primary" onClick={() => navigate(-1)}>戻る</button>
                </div>
            </div>
        )
    }

    return (
        <div className="schedule-detail-view">
            <div className="nav-bar">
                <button className="nav-back btn btn-icon" onClick={() => navigate(-1)}>‹</button>
                <h2 className="nav-title">スケジュール詳細</h2>
                <div className="nav-actions">
                    <button className="btn btn-icon" onClick={() => navigate(`/schedule/${id}/edit`)}>✏️</button>
                    <button className="btn btn-icon" onClick={handleDelete}>🗑️</button>
                </div>
            </div>

            <div className="detail-content">
                <div className="detail-header">
                    <div className="category-badge" style={{ backgroundColor: categoryColor }}>
                        <span>{categoryIcon}</span>
                    </div>
                    <div className="detail-title">
                        <h2>{schedule.title}</h2>
                        <p className="detail-category">{categoryName}</p>
                    </div>
                    <div className="color-dot" style={{ backgroundColor: scheduleColor }} />
                </div>

                <div className="detail-card">
                    <div className="detail-row">
                        <span className="detail-icon">🕐</span>
                        <div className="detail-text">
                            <div>{dateRangeDisplay}</div>
                            {schedule.isAllDay
                                ? <div className="detail-subtext">終日</div>
                                : timeRangeDisplay && <div className="detail-subtext">{timeRangeDisplay}</div>
                            }
                        </div>
                    </div>

                    {schedule.description && (
                        <div className="detail-row">
                            <span className="detail-icon">📝</span>
                            <div className="detail-text">{schedule.description}</div>
                        </div>
                    )}

                    {schedule.tags && schedule.tags.length > 0 && (
                        <div className="detail-row">
                            <span className="detail-icon">🏷️</span>
                            <div className="detail-text">
                                {schedule.tags.map((tag, i) => (
                                    <span key={i} className="tag tag-outline">{tag}</span>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="detail-row">
                        <span className="detail-icon">🔔</span>
                        <div className="detail-text">{reminderDisplay}</div>
                    </div>

                    <div className="detail-row">
                        <span className="detail-icon">✅</span>
                        <div className="detail-text">
                            <label className="toggle-switch">
                                <input
                                    type="checkbox"
                                    checked={isCompleted}
                                    onChange={handleToggleComplete}
                                />
                                <span className="toggle-slider" />
                            </label>
                            <span className="detail-subtext">{isCompleted ? '完了' : '未完了'}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
