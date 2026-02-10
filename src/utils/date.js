/**
 * Date Utilities
 * Helper functions for date manipulation and formatting
 */

import dayjs from 'dayjs'
import isoWeek from 'dayjs/plugin/isoWeek'
import weekday from 'dayjs/plugin/weekday'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import { DATE_FORMATS, WEEKDAYS_SHORT, WEEKDAYS_FULL } from './constants'

// Extend dayjs with plugins
dayjs.extend(isoWeek)
dayjs.extend(weekday)
dayjs.extend(isSameOrBefore)
dayjs.extend(isSameOrAfter)
dayjs.extend(customParseFormat)

/**
 * Format date to display string
 * @param {string|Date|dayjs.Dayjs} date - Date to format
 * @param {string} format - Format string (default: YYYY年MM月DD日)
 * @returns {string} Formatted date string
 */
export function formatDate(date, format = DATE_FORMATS.DISPLAY) {
  if (!date) return ''
  return dayjs(date).format(format)
}

/**
 * Format time to display string
 * @param {string} time - Time in HH:mm format
 * @param {boolean} use24Hour - Use 24-hour format (default: true)
 * @returns {string} Formatted time string
 */
export function formatTime(time, use24Hour = true) {
  if (!time) return ''

  if (use24Hour) {
    return time
  } else {
    // Convert to 12-hour format
    const [hour, minute] = time.split(':')
    const h = parseInt(hour)
    const period = h >= 12 ? '午後' : '午前'
    const displayHour = h > 12 ? h - 12 : h === 0 ? 12 : h
    return `${period} ${displayHour}:${minute}`
  }
}

/**
 * Format date and time together
 * @param {string} date - Date string
 * @param {string} time - Time string
 * @returns {string} Combined formatted string
 */
export function formatDateTime(date, time) {
  const dateStr = formatDate(date, DATE_FORMATS.DISPLAY)
  const timeStr = formatTime(time)
  return `${dateStr} ${timeStr}`
}

/**
 * Get current date in ISO format (YYYY-MM-DD)
 * @returns {string}
 */
export function getCurrentDate() {
  return dayjs().format(DATE_FORMATS.ISO)
}

/**
 * Get current time in HH:mm format
 * @returns {string}
 */
export function getCurrentTime() {
  return dayjs().format(DATE_FORMATS.TIME)
}

/**
 * Check if a date is today
 * @param {string|Date} date - Date to check
 * @returns {boolean}
 */
export function isToday(date) {
  return dayjs(date).isSame(dayjs(), 'day')
}

/**
 * Check if a date is in the past
 * @param {string|Date} date - Date to check
 * @returns {boolean}
 */
export function isPast(date) {
  return dayjs(date).isBefore(dayjs(), 'day')
}

/**
 * Check if a date is in the future
 * @param {string|Date} date - Date to check
 * @returns {boolean}
 */
export function isFuture(date) {
  return dayjs(date).isAfter(dayjs(), 'day')
}

/**
 * Check if a date is this week
 * @param {string|Date} date - Date to check
 * @returns {boolean}
 */
export function isThisWeek(date) {
  return dayjs(date).isSame(dayjs(), 'week')
}

/**
 * Check if a date is this month
 * @param {string|Date} date - Date to check
 * @returns {boolean}
 */
export function isThisMonth(date) {
  return dayjs(date).isSame(dayjs(), 'month')
}

/**
 * Check if a date is a weekend (Saturday or Sunday)
 * @param {string|Date} date - Date to check
 * @returns {boolean}
 */
export function isWeekend(date) {
  const day = dayjs(date).day()
  return day === 0 || day === 6
}

/**
 * Get day of week (0-6, Sunday = 0)
 * @param {string|Date} date - Date
 * @returns {number}
 */
export function getDayOfWeek(date) {
  return dayjs(date).day()
}

/**
 * Get weekday name (short)
 * @param {string|Date} date - Date
 * @returns {string} e.g., "日", "一", "二"
 */
export function getWeekdayShort(date) {
  const day = getDayOfWeek(date)
  return WEEKDAYS_SHORT[day]
}

/**
 * Get weekday name (full)
 * @param {string|Date} date - Date
 * @returns {string} e.g., "星期日", "星期一"
 */
export function getWeekdayFull(date) {
  const day = getDayOfWeek(date)
  return WEEKDAYS_FULL[day]
}

/**
 * Add days to a date
 * @param {string|Date} date - Base date
 * @param {number} days - Number of days to add (can be negative)
 * @returns {string} New date in ISO format
 */
export function addDays(date, days) {
  return dayjs(date).add(days, 'day').format(DATE_FORMATS.ISO)
}

/**
 * Add months to a date
 * @param {string|Date} date - Base date
 * @param {number} months - Number of months to add (can be negative)
 * @returns {string} New date in ISO format
 */
export function addMonths(date, months) {
  return dayjs(date).add(months, 'month').format(DATE_FORMATS.ISO)
}

/**
 * Add weeks to a date
 * @param {string|Date} date - Base date
 * @param {number} weeks - Number of weeks to add (can be negative)
 * @returns {string} New date in ISO format
 */
export function addWeeks(date, weeks) {
  return dayjs(date).add(weeks, 'week').format(DATE_FORMATS.ISO)
}

/**
 * Get the first day of the month
 * @param {string|Date} date - Date in the target month
 * @returns {string} First day in ISO format
 */
export function getFirstDayOfMonth(date) {
  return dayjs(date).startOf('month').format(DATE_FORMATS.ISO)
}

/**
 * Get the last day of the month
 * @param {string|Date} date - Date in the target month
 * @returns {string} Last day in ISO format
 */
export function getLastDayOfMonth(date) {
  return dayjs(date).endOf('month').format(DATE_FORMATS.ISO)
}

/**
 * Get number of days in a month
 * @param {string|Date} date - Date in the target month
 * @returns {number} Number of days (28-31)
 */
export function getDaysInMonth(date) {
  return dayjs(date).daysInMonth()
}

/**
 * Get the start of the week
 * @param {string|Date} date - Date in the target week
 * @param {number} weekStartsOn - 0 = Sunday, 1 = Monday
 * @returns {string} Start of week in ISO format
 */
export function getStartOfWeek(date, weekStartsOn = 0) {
  const d = dayjs(date)
  const currentDay = d.day()
  const diff = (currentDay - weekStartsOn + 7) % 7
  return d.subtract(diff, 'day').format(DATE_FORMATS.ISO)
}

/**
 * Get the end of the week
 * @param {string|Date} date - Date in the target week
 * @param {number} weekStartsOn - 0 = Sunday, 1 = Monday
 * @returns {string} End of week in ISO format
 */
export function getEndOfWeek(date, weekStartsOn = 0) {
  const start = getStartOfWeek(date, weekStartsOn)
  return addDays(start, 6)
}

/**
 * Get difference between two dates in days
 * @param {string|Date} date1 - First date
 * @param {string|Date} date2 - Second date
 * @returns {number} Number of days (can be negative)
 */
export function getDaysDiff(date1, date2) {
  return dayjs(date1).diff(dayjs(date2), 'day')
}

/**
 * Compare two dates
 * @param {string|Date} date1 - First date
 * @param {string|Date} date2 - Second date
 * @returns {number} -1 if date1 < date2, 0 if equal, 1 if date1 > date2
 */
export function compareDates(date1, date2) {
  const d1 = dayjs(date1)
  const d2 = dayjs(date2)

  if (d1.isBefore(d2, 'day')) return -1
  if (d1.isAfter(d2, 'day')) return 1
  return 0
}

/**
 * Check if two dates are the same day
 * @param {string|Date} date1 - First date
 * @param {string|Date} date2 - Second date
 * @returns {boolean}
 */
export function isSameDay(date1, date2) {
  return dayjs(date1).isSame(dayjs(date2), 'day')
}

/**
 * Parse a date string with various formats
 * @param {string} dateStr - Date string to parse
 * @returns {dayjs.Dayjs|null} Parsed date or null if invalid
 */
export function parseDate(dateStr) {
  if (!dateStr) return null

  const formats = [
    DATE_FORMATS.ISO,
    DATE_FORMATS.DISPLAY,
    'YYYY/MM/DD',
    'MM/DD/YYYY',
    'DD/MM/YYYY'
  ]

  for (const format of formats) {
    const parsed = dayjs(dateStr, format, true)
    if (parsed.isValid()) {
      return parsed
    }
  }

  // Try default parsing
  const parsed = dayjs(dateStr)
  return parsed.isValid() ? parsed : null
}

/**
 * Validate a date string
 * @param {string} dateStr - Date string to validate
 * @returns {boolean}
 */
export function isValidDate(dateStr) {
  return parseDate(dateStr) !== null
}

/**
 * Get a relative time description
 * @param {string|Date} date - Date to describe
 * @returns {string} e.g., "今天", "明天", "3天後", "2天前"
 */
export function getRelativeDate(date) {
  const target = dayjs(date)
  const today = dayjs()
  const diff = target.diff(today, 'day')

  if (diff === 0) return '今日'
  if (diff === 1) return '明日'
  if (diff === -1) return '昨日'
  if (diff > 1 && diff <= 7) return `${diff}日後`
  if (diff < -1 && diff >= -7) return `${Math.abs(diff)}日前`

  return formatDate(date, DATE_FORMATS.DISPLAY)
}

/**
 * Get month and year display string
 * @param {string|Date} date - Date
 * @returns {string} e.g., "2026年2月"
 */
export function getMonthYearDisplay(date) {
  return dayjs(date).format('YYYY年MM月')
}

/**
 * Get year display string
 * @param {string|Date} date - Date
 * @returns {string} e.g., "2026年"
 */
export function getYearDisplay(date) {
  return dayjs(date).format('YYYY年')
}

/**
 * Generate a date range array
 * @param {string|Date} startDate - Start date
 * @param {string|Date} endDate - End date
 * @returns {string[]} Array of dates in ISO format
 */
export function getDateRange(startDate, endDate) {
  const dates = []
  let current = dayjs(startDate)
  const end = dayjs(endDate)

  while (current.isSameOrBefore(end, 'day')) {
    dates.push(current.format(DATE_FORMATS.ISO))
    current = current.add(1, 'day')
  }

  return dates
}

/**
 * Get calendar grid for a month (42 cells = 6 weeks)
 * @param {string|Date} date - Date in the target month
 * @param {number} weekStartsOn - 0 = Sunday, 1 = Monday
 * @returns {Array} Array of date objects with metadata
 */
export function getMonthCalendarGrid(date, weekStartsOn = 0) {
  const firstDay = dayjs(date).startOf('month')
  const lastDay = dayjs(date).endOf('month')

  // Get the first day of the calendar grid (might be from previous month)
  let gridStart = firstDay
  const firstDayOfWeek = firstDay.day()
  const offset = (firstDayOfWeek - weekStartsOn + 7) % 7
  gridStart = firstDay.subtract(offset, 'day')

  // Generate 42 cells (6 weeks)
  const grid = []
  let current = gridStart

  for (let i = 0; i < 42; i++) {
    const isCurrentMonth = current.month() === firstDay.month()

    grid.push({
      date: current.format(DATE_FORMATS.ISO),
      day: current.date(),
      month: current.month(),
      year: current.year(),
      isCurrentMonth,
      isToday: current.isSame(dayjs(), 'day'),
      isWeekend: current.day() === 0 || current.day() === 6,
      isPast: current.isBefore(dayjs(), 'day'),
      isFuture: current.isAfter(dayjs(), 'day'),
      weekday: current.day()
    })

    current = current.add(1, 'day')
  }

  return grid
}

/**
 * Get week calendar grid (7 days)
 * @param {string|Date} date - Date in the target week
 * @param {number} weekStartsOn - 0 = Sunday, 1 = Monday
 * @returns {Array} Array of date objects with metadata
 */
export function getWeekCalendarGrid(date, weekStartsOn = 0) {
  const start = getStartOfWeek(date, weekStartsOn)
  const grid = []
  let current = dayjs(start)

  for (let i = 0; i < 7; i++) {
    grid.push({
      date: current.format(DATE_FORMATS.ISO),
      day: current.date(),
      month: current.month(),
      year: current.year(),
      isToday: current.isSame(dayjs(), 'day'),
      isWeekend: current.day() === 0 || current.day() === 6,
      isPast: current.isBefore(dayjs(), 'day'),
      isFuture: current.isAfter(dayjs(), 'day'),
      weekday: current.day(),
      weekdayShort: WEEKDAYS_SHORT[current.day()],
      weekdayFull: WEEKDAYS_FULL[current.day()]
    })

    current = current.add(1, 'day')
  }

  return grid
}

/**
 * Export dayjs for advanced usage
 */
export { dayjs }

/**
 * Export default dayjs instance
 */
export default dayjs
