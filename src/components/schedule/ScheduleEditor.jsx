/**
 * ScheduleEditor.jsx - Form for creating/editing schedules
 */

import React, { useState, useEffect } from 'react'
import { getCurrentDate, getCurrentTime, formatDate as formatDateUtil } from '@/utils/date'
import { REMINDER_OPTIONS } from '@/utils/constants'
import CategoryPicker from '@/components/category/CategoryPicker'
import ColorPicker from '@/components/category/ColorPicker'

const DEFAULT_FORM = {
    title: '',
    description: '',
    startDate: getCurrentDate(),
    startTime: getCurrentTime(),
    endDate: getCurrentDate(),
    endTime: getCurrentTime(),
    isAllDay: false,
    category: 'personal',
    tags: [],
    color: '#FF6B6B',
    reminder: { enabled: true, type: 'local', time: 15, unit: 'minutes' }
}

export default function ScheduleEditor({
    initialData = null,
    isEdit = false,
    showCancel = true,
    loading = false,
    onSubmit,
    onCancel
}) {
    const [form, setForm] = useState(initialData ? { ...DEFAULT_FORM, ...initialData } : { ...DEFAULT_FORM })
    const [showReminderPicker, setShowReminderPicker] = useState(false)
    const [showTagInput, setShowTagInput] = useState(false)
    const [newTag, setNewTag] = useState('')
    const [errors, setErrors] = useState({})

    // When isAllDay changes, update times
    useEffect(() => {
        if (form.isAllDay) {
            setForm(f => ({ ...f, startTime: '00:00', endTime: '23:59' }))
        }
    }, [form.isAllDay])

    function updateForm(key, value) {
        setForm(f => {
            const updated = { ...f, [key]: value }
            // Auto-fix end date if before start date
            if (key === 'startDate' && updated.endDate < value) {
                updated.endDate = value
            }
            return updated
        })
        setErrors(e => ({ ...e, [key]: undefined }))
    }

    function updateReminder(key, value) {
        setForm(f => ({ ...f, reminder: { ...f.reminder, [key]: value } }))
    }

    function handleAddTag() {
        const tag = newTag.trim()
        if (tag && !form.tags.includes(tag)) {
            setForm(f => ({ ...f, tags: [...f.tags, tag] }))
            setNewTag('')
        }
        setShowTagInput(false)
    }

    function removeTag(index) {
        setForm(f => ({ ...f, tags: f.tags.filter((_, i) => i !== index) }))
    }

    function getReminderDisplay() {
        const opt = REMINDER_OPTIONS.find(o => o.value === form.reminder.time)
        return opt ? opt.label : '15分前'
    }

    function validate() {
        const errs = {}
        if (!form.title) errs.title = 'タイトルを入力してください'
        if (!form.startDate) errs.startDate = '開始日を選択してください'
        setErrors(errs)
        return Object.keys(errs).length === 0
    }

    function handleSubmit(e) {
        e.preventDefault()
        if (!validate()) return
        onSubmit && onSubmit({ ...form })
    }

    return (
        <div className="schedule-editor">
            <form onSubmit={handleSubmit}>
                {/* Title */}
                <div className="form-field">
                    <label className="field-label">タイトル <span className="required">*</span></label>
                    <input
                        className={`field-input ${errors.title ? 'field-error' : ''}`}
                        type="text"
                        placeholder="タイトルを入力してください"
                        value={form.title}
                        onChange={e => updateForm('title', e.target.value)}
                        maxLength={50}
                    />
                    {errors.title && <span className="error-msg">{errors.title}</span>}
                    <span className="word-count">{form.title.length}/50</span>
                </div>

                {/* Description */}
                <div className="form-field">
                    <label className="field-label">説明</label>
                    <textarea
                        className="field-input field-textarea"
                        placeholder="説明を入力してください（任意）"
                        value={form.description}
                        onChange={e => updateForm('description', e.target.value)}
                        maxLength={200}
                        rows={3}
                    />
                    <span className="word-count">{form.description.length}/200</span>
                </div>

                {/* Start Date */}
                <div className="form-field">
                    <label className="field-label">開始日 <span className="required">*</span></label>
                    <input
                        className="field-input"
                        type="date"
                        value={form.startDate}
                        onChange={e => updateForm('startDate', e.target.value)}
                    />
                </div>

                {/* Start Time */}
                {!form.isAllDay && (
                    <div className="form-field">
                        <label className="field-label">開始時刻</label>
                        <input
                            className="field-input"
                            type="time"
                            value={form.startTime}
                            onChange={e => updateForm('startTime', e.target.value)}
                        />
                    </div>
                )}

                {/* End Date */}
                <div className="form-field">
                    <label className="field-label">終了日</label>
                    <input
                        className="field-input"
                        type="date"
                        value={form.endDate}
                        min={form.startDate}
                        onChange={e => updateForm('endDate', e.target.value)}
                    />
                </div>

                {/* End Time */}
                {!form.isAllDay && (
                    <div className="form-field">
                        <label className="field-label">終了時刻</label>
                        <input
                            className="field-input"
                            type="time"
                            value={form.endTime}
                            onChange={e => updateForm('endTime', e.target.value)}
                        />
                    </div>
                )}

                {/* All Day Toggle */}
                <div className="form-field form-field-inline">
                    <label className="field-label">終日</label>
                    <label className="toggle-switch">
                        <input
                            type="checkbox"
                            checked={form.isAllDay}
                            onChange={e => updateForm('isAllDay', e.target.checked)}
                        />
                        <span className="toggle-slider" />
                    </label>
                </div>

                {/* Category */}
                <CategoryPicker
                    value={form.category}
                    onChange={val => updateForm('category', val)}
                />

                {/* Color */}
                <ColorPicker
                    value={form.color}
                    onChange={val => updateForm('color', val)}
                />

                {/* Tags */}
                <div className="form-field">
                    <label className="field-label">タグ</label>
                    <div className="tag-list">
                        {form.tags.map((tag, index) => (
                            <span key={index} className="tag tag-close">
                                {tag}
                                <button type="button" className="tag-remove" onClick={() => removeTag(index)}>×</button>
                            </span>
                        ))}
                        {!showTagInput ? (
                            <button type="button" className="btn btn-sm btn-outline" onClick={() => setShowTagInput(true)}>
                                + 追加
                            </button>
                        ) : (
                            <div className="tag-input-row">
                                <input
                                    className="field-input tag-input"
                                    type="text"
                                    placeholder="タグ名"
                                    value={newTag}
                                    maxLength={10}
                                    onChange={e => setNewTag(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleAddTag()}
                                    autoFocus
                                />
                                <button type="button" className="btn btn-sm btn-primary" onClick={handleAddTag}>追加</button>
                                <button type="button" className="btn btn-sm" onClick={() => { setShowTagInput(false); setNewTag('') }}>×</button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Reminder Toggle */}
                <div className="form-field form-field-inline">
                    <label className="field-label">リマインダー</label>
                    <label className="toggle-switch">
                        <input
                            type="checkbox"
                            checked={form.reminder.enabled}
                            onChange={e => updateReminder('enabled', e.target.checked)}
                        />
                        <span className="toggle-slider" />
                    </label>
                </div>

                {/* Reminder Time */}
                {form.reminder.enabled && (
                    <div className="form-field" onClick={() => setShowReminderPicker(true)}>
                        <label className="field-label">事前通知</label>
                        <div className="field-input field-clickable">
                            <span>🔔 {getReminderDisplay()}</span>
                            <span className="field-arrow">›</span>
                        </div>
                    </div>
                )}

                {/* Submit Buttons */}
                <div className="form-actions">
                    <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                        {loading ? '保存中...' : (isEdit ? 'スケジュールを更新' : 'スケジュールを作成')}
                    </button>
                    {showCancel && (
                        <button type="button" className="btn btn-block" onClick={onCancel}>
                            キャンセル
                        </button>
                    )}
                </div>
            </form>

            {/* Reminder Picker */}
            {showReminderPicker && (
                <div className="popup-overlay" onClick={() => setShowReminderPicker(false)}>
                    <div className="popup-sheet popup-sheet-sm" onClick={e => e.stopPropagation()}>
                        <div className="picker-header">
                            <button className="btn btn-text" onClick={() => setShowReminderPicker(false)}>
                                キャンセル
                            </button>
                            <span className="picker-title">事前通知</span>
                        </div>
                        <div className="picker-options">
                            {REMINDER_OPTIONS.map(opt => (
                                <div
                                    key={opt.value}
                                    className={`picker-option ${form.reminder.time === opt.value ? 'is-selected' : ''}`}
                                    onClick={() => {
                                        updateReminder('time', opt.value)
                                        updateReminder('unit', opt.unit)
                                        setShowReminderPicker(false)
                                    }}
                                >
                                    {opt.label}
                                    {form.reminder.time === opt.value && <span> ✓</span>}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
