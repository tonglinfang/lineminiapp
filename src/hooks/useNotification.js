/**
 * useNotification - React hook
 * Handles browser notifications and schedule reminders
 */

import { useState, useCallback } from 'react'
import dayjs from 'dayjs'
import { APP_CONFIG, ERROR_MESSAGES } from '@/utils/constants'

// Module-level shared state
let _permission = 'Notification' in window ? Notification.permission : 'denied'
let _isSupported = 'Notification' in window
const _scheduledNotifications = new Map()
const _listeners = new Set()

function notifyListeners() {
    _listeners.forEach(fn => fn())
}

export function useNotification() {
    const [, forceUpdate] = useState(0)
    const rerender = useCallback(() => forceUpdate(n => n + 1), [])
    if (!_listeners.has(rerender)) _listeners.add(rerender)

    function navigateToSchedule(scheduleId) {
        if (!scheduleId) return
        const { router } = window.__APP_CONTEXT__ || {}
        if (router) {
            router.push(`/schedule/${scheduleId}`)
        } else {
            window.location.hash = `#/schedule/${scheduleId}`
        }
    }

    function checkSupport() {
        _isSupported = 'Notification' in window
        if (_isSupported) {
            _permission = Notification.permission
            notifyListeners()
        }
        return _isSupported
    }

    async function requestPermission() {
        if (!_isSupported) return 'denied'
        try {
            const result = await Notification.requestPermission()
            _permission = result
            notifyListeners()
            return result
        } catch (error) {
            console.error('Failed to request notification permission:', error)
            return 'denied'
        }
    }

    function isGranted() {
        return _permission === 'granted'
    }

    function showNotification(title, options = {}) {
        if (!_isSupported || _permission !== 'granted') return null
        try {
            const notification = new Notification(title, {
                icon: '/favicon.ico',
                badge: '/favicon.ico',
                requireInteraction: false,
                ...options
            })
            setTimeout(() => notification.close(), 10000)
            return notification
        } catch (error) {
            console.error('Failed to show notification:', error)
            return null
        }
    }

    function scheduleNotification(schedule) {
        if (!schedule || !schedule.id) return false
        cancelNotification(schedule.id)
        if (!schedule.reminder || !schedule.reminder.enabled) return false

        try {
            const scheduleDateTime = dayjs(`${schedule.startDate} ${schedule.startTime}`)
            const reminderTime = scheduleDateTime.subtract(schedule.reminder.time, schedule.reminder.unit)
            const delay = reminderTime.diff(dayjs(), 'millisecond')

            if (delay > 0 && delay <= APP_CONFIG.NOTIFICATION_MAX_DELAY) {
                const timeoutId = setTimeout(() => {
                    sendScheduleReminder(schedule)
                    _scheduledNotifications.delete(schedule.id)
                }, delay)
                _scheduledNotifications.set(schedule.id, timeoutId)
                return true
            }
            return false
        } catch (error) {
            console.error('Failed to schedule notification:', error)
            return false
        }
    }

    function sendScheduleReminder(schedule) {
        const timeUntil = schedule.reminder.time
        const unit = schedule.reminder.unit
        const unitText = { minutes: '分', hours: '時間', days: '日' }[unit] || '分'

        const body = schedule.description
            ? `${schedule.description}\n\n${timeUntil}${unitText}後開始`
            : `${timeUntil}${unitText}後開始`

        const notification = showNotification(schedule.title, {
            body,
            tag: schedule.id,
            data: { scheduleId: schedule.id }
        })

        if (notification) {
            notification.onclick = () => {
                window.focus()
                navigateToSchedule(schedule.id)
                notification.close()
            }
        }
    }

    function cancelNotification(scheduleId) {
        if (_scheduledNotifications.has(scheduleId)) {
            clearTimeout(_scheduledNotifications.get(scheduleId))
            _scheduledNotifications.delete(scheduleId)
            return true
        }
        return false
    }

    function cancelAllNotifications() {
        _scheduledNotifications.forEach(timeoutId => clearTimeout(timeoutId))
        _scheduledNotifications.clear()
    }

    function rescheduleAll(schedules) {
        cancelAllNotifications()
        const now = dayjs()
        const next24Hours = now.add(24, 'hour')

        const upcoming = schedules.filter(schedule => {
            if (schedule.isDeleted || schedule.isCompleted) return false
            const dt = dayjs(`${schedule.startDate} ${schedule.startTime}`)
            return dt.isAfter(now) && dt.isBefore(next24Hours)
        })

        let scheduled = 0
        upcoming.forEach(schedule => {
            if (scheduleNotification(schedule)) scheduled++
        })
        return { scheduled }
    }

    function getScheduledCount() {
        return _scheduledNotifications.size
    }

    function testNotification() {
        showNotification('テスト通知', {
            body: 'これはテスト通知です。通知機能が正常に動作していることを確認します。'
        })
    }

    // Initialize
    checkSupport()

    return {
        permission: _permission,
        isSupported: _isSupported,
        checkSupport,
        requestPermission,
        isGranted,
        showNotification,
        testNotification,
        scheduleNotification,
        cancelNotification,
        cancelAllNotifications,
        rescheduleAll,
        getScheduledCount
    }
}
