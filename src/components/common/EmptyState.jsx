/**
 * EmptyState.jsx - Common empty state component
 */

import React from 'react'

export default function EmptyState({
    icon = '📋',
    title = '',
    description = '',
    actionText = '',
    onAction
}) {
    return (
        <div className="empty-state">
            <span className="empty-icon">{icon}</span>
            {title && <h3 className="empty-title">{title}</h3>}
            {description && <p className="empty-description">{description}</p>}
            {actionText && (
                <button className="btn btn-primary empty-action" onClick={onAction}>
                    {actionText}
                </button>
            )}
        </div>
    )
}
