/**
 * ScheduleItem.jsx - Single schedule list item
 */

import React from 'react'
import { useCategoryStore } from '@/stores/categoryStore'
import { isPast as checkIsPast } from '@/utils/date'

export default function ScheduleItem({
    schedule,
    showCheckbox = true,
    onCLick,
    onEdit,
    onDelete,
    onToggleComplete
}) {
    const categoryStore = useCategoryStore()

    const category = categoryStore.getCategoryById(schedule.category)
    const categoryColor = category?.color || '#B0B0B0'
    const categoryName = category?.name || 'その他'
    const isPast = checkIsPast(schedule.startDate)

    const timeDisplay = schedule.isAllDay
        ? '終日'
        : `${schedule.startTime} - ${schedule.endTime}`

    const classNames = [
        'schedule-item',
        schedule.isCompleted ? 'is-completed' : '',
        isPast ? 'is-past' : ''
    ].filter(Boolean).join(' ')

    return (
        <div
            className={classNames}
            style={{ borderLeftColor: categoryColor }}
            onClick={() => onCLick && onCLick(schedule)}
        >
            <div className="schedule-time">
                <span>🕐</span>
                <span>{timeDisplay}</span>
            </div>

            <div className="schedule-content">
                <h4 className="schedule-title">{schedule.title}</h4>
                {schedule.description && (
                    <p className="schedule-description">{schedule.description}</p>
                )}

                <div className="schedule-meta">
                    <span className="tag tag-outline" style={{ color: categoryColor, borderColor: categoryColor }}>
                        {categoryName}
                    </span>
                    {schedule.tags && schedule.tags.map(tag => (
                        <span key={tag} className="tag tag-outline">{tag}</span>
                    ))}
                    {schedule.reminder?.enabled && <span>🔔</span>}
                </div>
            </div>

            <div className="schedule-status">
                {showCheckbox ? (
                    <input
                        type="checkbox"
                        checked={!!schedule.isCompleted}
                        onChange={e => { e.stopPropagation(); onToggleComplete && onToggleComplete(schedule) }}
                        onClick={e => e.stopPropagation()}
                        className="schedule-checkbox"
                    />
                ) : (
                    <span className="arrow-icon">›</span>
                )}
            </div>

            <div className="schedule-swipe-actions">
                <button
                    className="btn btn-primary btn-sm"
                    onClick={e => { e.stopPropagation(); onEdit && onEdit(schedule) }}
                >
                    編集
                </button>
                <button
                    className="btn btn-danger btn-sm"
                    onClick={e => { e.stopPropagation(); onDelete && onDelete(schedule) }}
                >
                    削除
                </button>
            </div>
        </div>
    )
}
