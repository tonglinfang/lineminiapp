/**
 * ScheduleEdit.jsx - Edit schedule view
 */

import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useScheduleStore } from '@/stores/scheduleStore'
import ScheduleEditor from '@/components/schedule/ScheduleEditor'

export default function ScheduleEdit() {
    const navigate = useNavigate()
    const { id } = useParams()
    const scheduleStore = useScheduleStore()

    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [schedule, setSchedule] = useState(null)

    useEffect(() => {
        const found = scheduleStore.schedules.find(s => s.id === id)
        setSchedule(found || null)
        setLoading(false)
    }, [id])

    async function handleSubmit(formData) {
        setSaving(true)
        try {
            await scheduleStore.updateSchedule(schedule.id, formData)
            alert('更新しました')
            navigate(-1)
        } catch (error) {
            alert(error.message || '更新できませんでした')
        } finally {
            setSaving(false)
        }
    }

    async function handleDelete() {
        if (window.confirm(`「${schedule.title}」を削除してもよろしいですか？`)) {
            const success = await scheduleStore.deleteSchedule(schedule.id)
            if (success) {
                alert('削除しました')
                navigate('/')
            } else {
                alert('削除できませんでした')
            }
        }
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
            <div className="schedule-edit-view">
                <div className="nav-bar">
                    <button className="nav-back btn btn-icon" onClick={() => navigate(-1)}>‹</button>
                    <h2 className="nav-title">スケジュールを編集</h2>
                </div>
                <div className="empty-state">
                    <p>スケジュールが見つかりません</p>
                    <button className="btn btn-primary" onClick={() => navigate(-1)}>戻る</button>
                </div>
            </div>
        )
    }

    return (
        <div className="schedule-edit-view">
            <div className="nav-bar">
                <button className="nav-back btn btn-icon" onClick={() => navigate(-1)}>‹</button>
                <h2 className="nav-title">スケジュールを編集</h2>
                <button className="btn btn-icon" onClick={handleDelete}>🗑️</button>
            </div>

            <ScheduleEditor
                initialData={schedule}
                isEdit={true}
                loading={saving}
                onSubmit={handleSubmit}
                onCancel={() => navigate(-1)}
            />
        </div>
    )
}
