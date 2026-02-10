/**
 * Application Constants
 * Centralized configuration for the LINE Mini App
 */

// LocalStorage Keys
export const STORAGE_KEYS = {
  // User-specific data (with userId suffix)
  USER_PREFIX: 'lineminiapp_user_',
  SCHEDULES_PREFIX: 'lineminiapp_schedules_',
  CATEGORIES_PREFIX: 'lineminiapp_categories_',
  PREFERENCES_PREFIX: 'lineminiapp_prefs_',

  // Global data
  LAST_USER: 'lineminiapp_last_user',
  APP_VERSION: 'lineminiapp_version'
}

// Default Categories
export const DEFAULT_CATEGORIES = [
  {
    id: 'work',
    name: '工作',
    nameEn: 'Work',
    color: '#FF6B6B',
    icon: 'briefcase-o'
  },
  {
    id: 'personal',
    name: '個人',
    nameEn: 'Personal',
    color: '#4ECDC4',
    icon: 'user-o'
  },
  {
    id: 'health',
    name: '健康',
    nameEn: 'Health',
    color: '#95E1D3',
    icon: 'medkit-o'
  },
  {
    id: 'study',
    name: '學習',
    nameEn: 'Study',
    color: '#FFE66D',
    icon: 'book-o'
  },
  {
    id: 'entertainment',
    name: '娛樂',
    nameEn: 'Entertainment',
    color: '#C7CEEA',
    icon: 'smile-o'
  },
  {
    id: 'other',
    name: '其他',
    nameEn: 'Other',
    color: '#B0B0B0',
    icon: 'ellipsis'
  }
]

// Reminder Time Options
export const REMINDER_OPTIONS = [
  { label: '不提醒', value: 0, unit: 'minutes' },
  { label: '準時提醒', value: 0, unit: 'minutes' },
  { label: '5分鐘前', value: 5, unit: 'minutes' },
  { label: '15分鐘前', value: 15, unit: 'minutes' },
  { label: '30分鐘前', value: 30, unit: 'minutes' },
  { label: '1小時前', value: 1, unit: 'hours' },
  { label: '2小時前', value: 2, unit: 'hours' },
  { label: '1天前', value: 1, unit: 'days' }
]

// View Modes
export const VIEW_MODES = {
  MONTH: 'month',
  WEEK: 'week',
  DAY: 'day',
  LIST: 'list'
}

// Weekday Labels (Sunday = 0)
export const WEEKDAYS_SHORT = ['日', '一', '二', '三', '四', '五', '六']
export const WEEKDAYS_FULL = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']

// Date Formats
export const DATE_FORMATS = {
  DISPLAY: 'YYYY年MM月DD日',
  ISO: 'YYYY-MM-DD',
  TIME: 'HH:mm',
  DATETIME: 'YYYY-MM-DD HH:mm',
  FULL: 'YYYY年MM月DD日 HH:mm'
}

// App Config
export const APP_CONFIG = {
  VERSION: '1.0.0',
  NAME: '日程管理',
  NAME_EN: 'Schedule Manager',
  MAX_SCHEDULES: 1000, // Maximum schedules per user
  MAX_TAGS: 50, // Maximum custom tags per user
  NOTIFICATION_MAX_DELAY: 24 * 60 * 60 * 1000 // 24 hours in milliseconds
}

// Error Messages
export const ERROR_MESSAGES = {
  LIFF_INIT_FAILED: 'LIFF 初始化失敗，請重新打開應用',
  PROFILE_FETCH_FAILED: '無法獲取用戶資料',
  STORAGE_ERROR: '數據存儲失敗，請檢查瀏覽器設置',
  NOTIFICATION_PERMISSION_DENIED: '通知權限被拒絕',
  SCHEDULE_CREATE_FAILED: '創建日程失敗',
  SCHEDULE_UPDATE_FAILED: '更新日程失敗',
  SCHEDULE_DELETE_FAILED: '刪除日程失敗',
  INVALID_DATE: '日期格式不正確',
  REQUIRED_FIELD: '請填寫必填欄位'
}

// Success Messages
export const SUCCESS_MESSAGES = {
  SCHEDULE_CREATED: '日程創建成功',
  SCHEDULE_UPDATED: '日程更新成功',
  SCHEDULE_DELETED: '日程已刪除',
  SETTINGS_SAVED: '設置已保存'
}

// Notification Types
export const NOTIFICATION_TYPES = {
  LOCAL: 'local', // Browser notification
  LINE: 'line' // LINE push message (requires backend)
}

// Route Names
export const ROUTE_NAMES = {
  HOME: 'Home',
  SCHEDULE_LIST: 'ScheduleList',
  SCHEDULE_CREATE: 'ScheduleCreate',
  SCHEDULE_EDIT: 'ScheduleEdit',
  SETTINGS: 'Settings',
  ABOUT: 'About'
}
