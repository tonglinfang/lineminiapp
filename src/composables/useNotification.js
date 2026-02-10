/**
 * Notification Composable
 * Handles browser notifications and schedule reminders
 */

import { ref, readonly } from 'vue'
import dayjs from 'dayjs'
import { APP_CONFIG, ERROR_MESSAGES } from '@/utils/constants'

// Shared state
const permission = ref('default')
const isSupported = ref('Notification' in window)
const scheduledNotifications = ref(new Map()) // Map<scheduleId, timeoutId>

export function useNotification() {
  /**
   * Check if notifications are supported
   */
  function checkSupport() {
    isSupported.value = 'Notification' in window
    if (isSupported.value) {
      permission.value = Notification.permission
    }
    return isSupported.value
  }

  /**
   * Request notification permission
   * @returns {Promise<string>} Permission status
   */
  async function requestPermission() {
    if (!isSupported.value) {
      console.warn('Notifications are not supported in this browser')
      return 'denied'
    }

    try {
      const result = await Notification.requestPermission()
      permission.value = result
      console.log('Notification permission:', result)
      return result
    } catch (error) {
      console.error('Failed to request notification permission:', error)
      return 'denied'
    }
  }

  /**
   * Check if notifications are granted
   */
  function isGranted() {
    return permission.value === 'granted'
  }

  /**
   * Show an immediate notification
   * @param {string} title - Notification title
   * @param {Object} options - Notification options
   * @returns {Notification|null}
   */
  function showNotification(title, options = {}) {
    if (!isSupported.value) {
      console.warn('Notifications not supported')
      return null
    }

    if (permission.value !== 'granted') {
      console.warn('Notification permission not granted')
      return null
    }

    try {
      const notification = new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        vibrate: [200, 100, 200],
        requireInteraction: false,
        silent: false,
        ...options
      })

      // Auto-close after 10 seconds
      setTimeout(() => {
        notification.close()
      }, 10000)

      return notification
    } catch (error) {
      console.error('Failed to show notification:', error)
      return null
    }
  }

  /**
   * Schedule a notification for a schedule
   * @param {Object} schedule - Schedule object
   * @returns {boolean} Success status
   */
  function scheduleNotification(schedule) {
    if (!schedule || !schedule.id) {
      console.error('Invalid schedule')
      return false
    }

    // Cancel existing notification for this schedule
    cancelNotification(schedule.id)

    // Check if reminder is enabled
    if (!schedule.reminder || !schedule.reminder.enabled) {
      return false
    }

    try {
      // Calculate reminder time
      const scheduleDateTime = dayjs(`${schedule.startDate} ${schedule.startTime}`)
      const reminderTime = scheduleDateTime.subtract(
        schedule.reminder.time,
        schedule.reminder.unit
      )

      const now = dayjs()
      const delay = reminderTime.diff(now, 'millisecond')

      // Only schedule if reminder is in the future and within 24 hours
      if (delay > 0 && delay <= APP_CONFIG.NOTIFICATION_MAX_DELAY) {
        const timeoutId = setTimeout(() => {
          sendScheduleReminder(schedule)
          // Remove from scheduled map after sending
          scheduledNotifications.value.delete(schedule.id)
        }, delay)

        // Store timeout ID
        scheduledNotifications.value.set(schedule.id, timeoutId)

        console.log(`✅ Notification scheduled for: ${schedule.title} (in ${Math.floor(delay / 60000)} minutes)`)
        return true
      } else if (delay > APP_CONFIG.NOTIFICATION_MAX_DELAY) {
        console.log(`⏰ Schedule "${schedule.title}" is too far in the future (${Math.floor(delay / 3600000)} hours)`)
        return false
      } else {
        console.log(`⏰ Reminder time has passed for: ${schedule.title}`)
        return false
      }
    } catch (error) {
      console.error('Failed to schedule notification:', error)
      return false
    }
  }

  /**
   * Send a reminder notification for a schedule
   * @param {Object} schedule - Schedule object
   */
  function sendScheduleReminder(schedule) {
    const timeUntil = schedule.reminder.time
    const unit = schedule.reminder.unit
    const unitText = {
      minutes: '分鐘',
      hours: '小時',
      days: '天'
    }[unit] || '分鐘'

    const body = schedule.description
      ? `${schedule.description}\n\n${timeUntil}${unitText}後開始`
      : `${timeUntil}${unitText}後開始`

    const notification = showNotification(schedule.title, {
      body,
      tag: schedule.id,
      data: {
        scheduleId: schedule.id,
        scheduleDate: schedule.startDate,
        scheduleTime: schedule.startTime
      }
    })

    if (notification) {
      // Handle notification click
      notification.onclick = () => {
        window.focus()
        // TODO: Navigate to schedule detail
        console.log('Notification clicked:', schedule.id)
        notification.close()
      }
    }
  }

  /**
   * Cancel a scheduled notification
   * @param {string} scheduleId - Schedule ID
   */
  function cancelNotification(scheduleId) {
    if (scheduledNotifications.value.has(scheduleId)) {
      const timeoutId = scheduledNotifications.value.get(scheduleId)
      clearTimeout(timeoutId)
      scheduledNotifications.value.delete(scheduleId)
      console.log(`❌ Notification cancelled for schedule: ${scheduleId}`)
      return true
    }
    return false
  }

  /**
   * Cancel all scheduled notifications
   */
  function cancelAllNotifications() {
    scheduledNotifications.value.forEach((timeoutId, scheduleId) => {
      clearTimeout(timeoutId)
      console.log(`❌ Notification cancelled: ${scheduleId}`)
    })
    scheduledNotifications.value.clear()
  }

  /**
   * Schedule notifications for multiple schedules
   * @param {Array} schedules - Array of schedule objects
   * @returns {Object} Results { scheduled, skipped, failed }
   */
  function scheduleMultiple(schedules) {
    const results = {
      scheduled: 0,
      skipped: 0,
      failed: 0
    }

    schedules.forEach(schedule => {
      if (!schedule.reminder || !schedule.reminder.enabled) {
        results.skipped++
        return
      }

      const success = scheduleNotification(schedule)
      if (success) {
        results.scheduled++
      } else {
        results.failed++
      }
    })

    console.log(`📅 Notification scheduling results:`, results)
    return results
  }

  /**
   * Reschedule all upcoming notifications
   * Call this on app startup to restore notifications
   * @param {Array} schedules - All schedules
   */
  function rescheduleAll(schedules) {
    console.log('🔄 Rescheduling all notifications...')

    // Cancel existing notifications first
    cancelAllNotifications()

    // Filter upcoming schedules (next 24 hours)
    const now = dayjs()
    const next24Hours = now.add(24, 'hour')

    const upcomingSchedules = schedules.filter(schedule => {
      if (schedule.isDeleted || schedule.isCompleted) return false

      const scheduleDateTime = dayjs(`${schedule.startDate} ${schedule.startTime}`)
      return scheduleDateTime.isAfter(now) && scheduleDateTime.isBefore(next24Hours)
    })

    // Schedule notifications
    const results = scheduleMultiple(upcomingSchedules)

    console.log(`✅ Rescheduling complete: ${results.scheduled} scheduled, ${results.skipped} skipped, ${results.failed} failed`)
    return results
  }

  /**
   * Get count of scheduled notifications
   */
  function getScheduledCount() {
    return scheduledNotifications.value.size
  }

  /**
   * Get list of scheduled notification IDs
   */
  function getScheduledIds() {
    return Array.from(scheduledNotifications.value.keys())
  }

  /**
   * Test notification (for debugging)
   */
  function testNotification() {
    showNotification('測試通知', {
      body: '這是一個測試通知，用於確認通知功能正常工作。',
      icon: '/favicon.ico'
    })
  }

  // Initialize
  checkSupport()

  return {
    // State (readonly)
    permission: readonly(permission),
    isSupported: readonly(isSupported),

    // Methods - Permission
    checkSupport,
    requestPermission,
    isGranted,

    // Methods - Immediate notifications
    showNotification,
    testNotification,

    // Methods - Schedule notifications
    scheduleNotification,
    cancelNotification,
    cancelAllNotifications,
    scheduleMultiple,
    rescheduleAll,

    // Methods - Status
    getScheduledCount,
    getScheduledIds
  }
}
