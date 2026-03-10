/**
 * DateCell.jsx - Individual date cell in the calendar grid
 */

import React, { useMemo } from 'react'

export default function DateCell({
    dateObj,
    scheduleCount = 0,
    categoryColors = [],
    isSelected = false,
    showCategoryDots = true,
    onClick
}) {
    const badgeColor = useMemo(() => {
        if (scheduleCount >= 5) return 'var(--danger-color)'
        if (scheduleCount >= 3) return 'var(--warning-color)'
        return 'var(--primary-color)'
    }, [scheduleCount])

    const classNames = [
        'date-cell',
        dateObj.isToday ? 'is-today' : '',
        isSelected ? 'is-selected' : '',
        dateObj.isWeekend ? 'is-weekend' : '',
        dateObj.isPast ? 'is-past' : '',
        dateObj.isFuture ? 'is-future' : '',
        dateObj.isCurrentMonth === false ? 'is-other-month' : '',
        scheduleCount > 0 ? 'has-schedules' : ''
    ].filter(Boolean).join(' ')

    return (
        <div className={classNames} onClick={() => onClick && onClick(dateObj)}>
            <div className="cell-content">
                <span className="day-number">{dateObj.day}</span>

                {scheduleCount > 0 && (
                    <span className="schedule-badge" style={{ backgroundColor: badgeColor }}>
                        {scheduleCount > 9 ? '9+' : scheduleCount}
                    </span>
                )}

                {showCategoryDots && categoryColors.length > 0 && (
                    <div className="category-dots">
                        {categoryColors.slice(0, 3).map((color, index) => (
                            <span
                                key={index}
                                className="category-dot"
                                style={{ backgroundColor: color }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
