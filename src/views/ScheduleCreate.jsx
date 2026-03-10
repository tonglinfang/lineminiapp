/**
 * ScheduleCreate.jsx - Create new schedule view
 */

import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useScheduleStore } from '@/stores/scheduleStore'
import ScheduleEditor from '@/components/schedule/ScheduleEditor'

export default function ScheduleCreate() {
    const navigate = useNavigate()
    const scheduleStore = useScheduleStore()
    const [loading, setLoading] = useState(false)

    async function handleSubmit(formData) {
        setLoading(true)
        try {
            await scheduleStore.createSchedule(formData)
            alert('作成しました')
            navigate(-1)
        } catch (error) {
            alert(error.message || '作成できませんでした')
        } finally {
            setLoading(false)
        }
    }

    function handleBack() {
        navigate(-1)
    }

    return (
        <div className="schedule-create-view">
            <div className="nav-bar">
                <button className="nav-back btn btn-icon" onClick={handleBack}>‹</button>
                <h2 className="nav-title">スケジュールを作成</h2>
            </div>

            <ScheduleEditor
                loading={loading}
                onSubmit={handleSubmit}
                onCancel={handleBack}
            />
        </div>
    )
}
