/**
 * ScheduleList.jsx - Schedule list view
 */

import React, { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useScheduleStore } from '@/stores/scheduleStore'
import ScheduleListComponent from '@/components/schedule/ScheduleList'
import { formatDate } from '@/utils/date'

export default function ScheduleList() {
    const navigate = useNavigate()
    const [searchParams, setSearchParams] = useSearchParams()
    const scheduleStore = useScheduleStore()

    useEffect(() => {
        const date = searchParams.get('date')
        const category = searchParams.get('category')
        const q = searchParams.get('q')

        scheduleStore.setFilterDate(date || null)
        scheduleStore.setFilterCategory(category || null)
        scheduleStore.setSearchQuery(q || '')
    }, [])

    function clearDateFilter() {
        scheduleStore.setFilterDate(null)
        const params = new URLSearchParams(searchParams)
        params.delete('date')
        setSearchParams(params)
    }

    function handleScheduleClick(schedule) {
        if (schedule?.id) navigate(`/schedule/${schedule.id}`)
    }

    function handleScheduleEdit(schedule) {
        navigate(`/schedule/${schedule.id}/edit`)
    }

    function handleCreate() {
        navigate('/schedule/create')
    }

    return (
        <div className="schedule-list-view">
            <div className="nav-bar">
                <h2 className="nav-title">スケジュール一覧</h2>
                <button className="nav-action btn btn-icon" onClick={handleCreate}>+</button>
            </div>

            {scheduleStore.filterDate && (
                <div className="active-filters">
                    <span className="tag tag-primary">
                        {formatDate(scheduleStore.filterDate)} のスケジュール
                    </span>
                    <button className="btn btn-sm btn-outline" onClick={clearDateFilter}>
                        クリア
                    </button>
                </div>
            )}

            <ScheduleListComponent
                loading={scheduleStore.loading}
                onScheduleClick={handleScheduleClick}
                onScheduleEdit={handleScheduleEdit}
                onCreate={handleCreate}
            />
        </div>
    )
}
