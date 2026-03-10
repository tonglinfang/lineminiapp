/**
 * CalendarHeader.jsx - Calendar navigation header
 */

import React from 'react'

export default function CalendarHeader({
    title,
    isToday = false,
    showViewModeToggle = true,
    onPrev,
    onNext,
    onToday,
    onToggleView
}) {
    return (
        <div className="calendar-header">
            <div className="header-nav">
                <button className="nav-button btn btn-plain" onClick={onPrev}>‹</button>
                <div className="header-title" onClick={() => { }}>
                    <span>{title}</span>
                </div>
                <button className="nav-button btn btn-plain" onClick={onNext}>›</button>
            </div>

            <div className="header-actions">
                <button
                    className="btn btn-primary btn-sm"
                    onClick={onToday}
                    disabled={isToday}
                >
                    今日
                </button>
                {showViewModeToggle && (
                    <button className="view-toggle btn btn-plain btn-sm" onClick={onToggleView}>
                        ⊞
                    </button>
                )}
            </div>
        </div>
    )
}
