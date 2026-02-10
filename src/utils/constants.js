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
    name: '仕事',
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
    name: '学習',
    nameEn: 'Study',
    color: '#FFE66D',
    icon: 'book-o'
  },
  {
    id: 'entertainment',
    name: '娯楽',
    nameEn: 'Entertainment',
    color: '#C7CEEA',
    icon: 'smile-o'
  },
  {
    id: 'other',
    name: 'その他',
    nameEn: 'Other',
    color: '#B0B0B0',
    icon: 'ellipsis'
  }
]

// Reminder Time Options
export const REMINDER_OPTIONS = [
  { label: '通知しない', value: 0, unit: 'minutes' },
  { label: '時刻通りに通知', value: 0, unit: 'minutes' },
  { label: '5分前', value: 5, unit: 'minutes' },
  { label: '15分前', value: 15, unit: 'minutes' },
  { label: '30分前', value: 30, unit: 'minutes' },
  { label: '1時間前', value: 1, unit: 'hours' },
  { label: '2時間前', value: 2, unit: 'hours' },
  { label: '1日前', value: 1, unit: 'days' }
]

// View Modes
export const VIEW_MODES = {
  MONTH: 'month',
  WEEK: 'week',
  DAY: 'day',
  LIST: 'list'
}

// Weekday Labels (Sunday = 0)
export const WEEKDAYS_SHORT = ['日', '月', '火', '水', '木', '金', '土']
export const WEEKDAYS_FULL = ['日曜日', '月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日']

// Date Formats
export const DATE_FORMATS = {
  DISPLAY: 'YYYY年M月D日',
  ISO: 'YYYY-MM-DD',
  TIME: 'HH:mm',
  DATETIME: 'YYYY-MM-DD HH:mm',
  FULL: 'YYYY年M月D日 HH:mm'
}

// App Config
export const APP_CONFIG = {
  VERSION: '1.0.0',
  NAME: 'スケジュール管理',
  NAME_EN: 'Schedule Manager',
  MAX_SCHEDULES: 1000, // Maximum schedules per user
  MAX_TAGS: 50, // Maximum custom tags per user
  NOTIFICATION_MAX_DELAY: 24 * 60 * 60 * 1000 // 24 hours in milliseconds
}

// Error Messages
export const ERROR_MESSAGES = {
  LIFF_INIT_FAILED: 'LIFFの初期化に失敗しました。アプリを再度開いてください',
  PROFILE_FETCH_FAILED: 'ユーザー情報を取得できません',
  STORAGE_ERROR: 'データの保存に失敗しました。ブラウザの設定を確認してください',
  NOTIFICATION_PERMISSION_DENIED: '通知権限が拒否されました',
  SCHEDULE_CREATE_FAILED: 'スケジュールの作成に失敗しました',
  SCHEDULE_UPDATE_FAILED: 'スケジュールの更新に失敗しました',
  SCHEDULE_DELETE_FAILED: 'スケジュールの削除に失敗しました',
  INVALID_DATE: '日付形式が正しくありません',
  REQUIRED_FIELD: '必須項目を入力してください'
}

// Success Messages
export const SUCCESS_MESSAGES = {
  SCHEDULE_CREATED: 'スケジュールを作成しました',
  SCHEDULE_UPDATED: 'スケジュールを更新しました',
  SCHEDULE_DELETED: 'スケジュールを削除しました',
  SETTINGS_SAVED: '設定を保存しました'
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
