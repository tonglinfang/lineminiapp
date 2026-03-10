/**
 * ScheduleList.jsx - Schedule list with filter and grouping
 */

import React, { useState, useMemo, useEffect } from 'react'
import { useScheduleStore } from '@/stores/scheduleStore'
import { useCategoryStore } from '@/stores/categoryStore'
import { formatDate, getRelativeDate } from '@/utils/date'
import ScheduleItem from './ScheduleItem'
import EmptyState from '@/components/common/EmptyState'

export default function ScheduleList({
    schedules: propSchedules = null,
    showFilter = true,
    showCheckbox = true,
    loading = false,
    onScheduleClick,
    onScheduleEdit,
    onCreate
}) {
    const scheduleStore = useScheduleStore()
    const categoryStore = useCategoryStore()

    const [filterCategory, setFilterCategory] = useState(scheduleStore.filterCategory)
    const [searchQuery, setSearchQuery] = useState(scheduleStore.searchQuery)

    // Sync local state with store
    useEffect(() => {
        setFilterCategory(scheduleStore.filterCategory)
    }, [scheduleStore.filterCategory])

    useEffect(() => {
        setSearchQuery(scheduleStore.searchQuery)
    }, [scheduleStore.searchQuery])

    const categoryOptions = useMemo(() => [
        { text: '全て', value: null },
        ...categoryStore.getAllCategories().map(cat => ({ text: cat.name, value: cat.id }))
    ], [categoryStore.customCategories])

    const displaySchedules = propSchedules !== null ? propSchedules : scheduleStore.getFilteredSchedules()

    const groupedSchedules = useMemo(() => {
        const groups = {}
        displaySchedules.forEach(schedule => {
            const date = schedule.startDate
            if (!groups[date]) {
                groups[date] = { date, dateDisplay: getRelativeDate(date), schedules: [] }
            }
            groups[date].schedules.push(schedule)
        })

        return Object.values(groups)
            .sort((a, b) => a.date.localeCompare(b.date))
            .map(group => ({
                ...group,
                schedules: group.schedules.sort((a, b) => {
                    if (a.isAllDay && !b.isAllDay) return -1
                    if (!a.isAllDay && b.isAllDay) return 1
                    return a.startTime.localeCompare(b.startTime)
                })
            }))
    }, [displaySchedules])

    function handleCategoryChange(value) {
        setFilterCategory(value)
        scheduleStore.setFilterCategory(value)
    }

    function handleSearch(e) {
        const query = e.target.value
        setSearchQuery(query)
        scheduleStore.setSearchQuery(query)
    }

    async function handleDelete(schedule) {
        if (window.confirm(`「${schedule.title}」を削除してもよろしいですか？`)) {
            const success = await scheduleStore.deleteSchedule(schedule.id)
            if (success) {
                alert('削除しました')
            } else {
                alert('削除に失敗しました')
            }
        }
    }

    async function handleToggleComplete(schedule) {
        await scheduleStore.toggleComplete(schedule.id)
    }

    return (
        <div className="schedule-list-component">
            {showFilter && (
                <div className="filter-bar">
                    <select
                        className="filter-select"
                        value={filterCategory || ''}
                        onChange={e => handleCategoryChange(e.target.value || null)}
                    >
                        {categoryOptions.map(opt => (
                            <option key={opt.value || 'all'} value={opt.value || ''}>
                                {opt.text}
                            </option>
                        ))}
                    </select>

                    <input
                        className="search-input"
                        type="text"
                        placeholder="スケジュールを検索"
                        value={searchQuery}
                        onChange={handleSearch}
                    />
                </div>
            )}

            {groupedSchedules.length > 0 ? (
                <div className="schedule-groups">
                    {groupedSchedules.map(group => (
                        <div key={group.date} className="schedule-group">
                            <div className="group-header">
                                <h3 className="group-date">{group.dateDisplay}</h3>
                                <span className="group-count">{group.schedules.length} 件</span>
                            </div>

                            <div className="group-items">
                                {group.schedules.map(schedule => (
                                    <ScheduleItem
                                        key={schedule.id}
                                        schedule={schedule}
                                        showCheckbox={showCheckbox}
                                        onCLick={onScheduleClick}
                                        onEdit={onScheduleEdit}
                                        onDelete={handleDelete}
                                        onToggleComplete={handleToggleComplete}
                                    />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                !loading && (
                    <EmptyState
                        icon="📋"
                        title="予定なし"
                        description="まだスケジュールが作成されていません"
                        actionText="スケジュールを作成"
                        onAction={onCreate}
                    />
                )
            )}

            {loading && (
                <div className="loading-state">
                    <div className="spinner" />
                </div>
            )}
        </div>
    )
}
