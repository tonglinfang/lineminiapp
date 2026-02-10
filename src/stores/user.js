/**
 * User Store
 * Manages LINE user profile and preferences
 */

import { defineStore } from 'pinia'
import { STORAGE_KEYS, VIEW_MODES } from '@/utils/constants'

export const useUserStore = defineStore('user', {
  state: () => ({
    // LINE user profile
    userId: null,
    displayName: '',
    pictureUrl: '',
    statusMessage: '',

    // User preferences
    preferences: {
      defaultView: VIEW_MODES.MONTH, // Default calendar view
      weekStartsOn: 0, // 0 = Sunday, 1 = Monday
      timeFormat: '24h', // '12h' or '24h'
      language: 'zh-TW', // 'zh-TW', 'en', etc.
      theme: 'light', // 'light' or 'dark'
      notifications: {
        enabled: true,
        defaultReminderTime: 15, // Default reminder in minutes
        sound: true
      }
    }
  }),

  getters: {
    /**
     * Check if user is logged in
     */
    isLoggedIn: (state) => !!state.userId,

    /**
     * Get user display name or fallback
     */
    userName: (state) => state.displayName || '用戶',

    /**
     * Get user avatar URL or placeholder
     */
    avatar: (state) => state.pictureUrl || 'https://via.placeholder.com/150',

    /**
     * Check if notifications are enabled
     */
    notificationsEnabled: (state) => state.preferences.notifications.enabled
  },

  actions: {
    /**
     * Set user profile from LIFF
     * @param {Object} profile - LINE user profile
     */
    setUser(profile) {
      if (!profile || !profile.userId) {
        console.error('Invalid user profile')
        return
      }

      this.userId = profile.userId
      this.displayName = profile.displayName || ''
      this.pictureUrl = profile.pictureUrl || ''
      this.statusMessage = profile.statusMessage || ''

      console.log('✅ User profile set:', {
        userId: this.userId,
        displayName: this.displayName
      })

      // Load user preferences from localStorage
      this.loadPreferences()
    },

    /**
     * Load user preferences from localStorage
     */
    loadPreferences() {
      if (!this.userId) {
        console.warn('Cannot load preferences: userId is null')
        return
      }

      const key = `${STORAGE_KEYS.PREFERENCES_PREFIX}${this.userId}`
      const saved = localStorage.getItem(key)

      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          // Merge with default preferences
          this.preferences = {
            ...this.preferences,
            ...parsed,
            notifications: {
              ...this.preferences.notifications,
              ...(parsed.notifications || {})
            }
          }
          console.log('✅ User preferences loaded')
        } catch (err) {
          console.error('Failed to parse preferences:', err)
        }
      }
    },

    /**
     * Save user preferences to localStorage
     */
    savePreferences() {
      if (!this.userId) {
        console.warn('Cannot save preferences: userId is null')
        return
      }

      const key = `${STORAGE_KEYS.PREFERENCES_PREFIX}${this.userId}`

      try {
        localStorage.setItem(key, JSON.stringify(this.preferences))
        console.log('✅ User preferences saved')
      } catch (err) {
        console.error('Failed to save preferences:', err)
      }
    },

    /**
     * Update a specific preference
     * @param {string} key - Preference key (e.g., 'defaultView')
     * @param {*} value - New value
     */
    updatePreference(key, value) {
      if (this.preferences.hasOwnProperty(key)) {
        this.preferences[key] = value
        this.savePreferences()
      } else {
        console.warn(`Preference key '${key}' does not exist`)
      }
    },

    /**
     * Update notification settings
     * @param {Object} settings - Notification settings
     */
    updateNotificationSettings(settings) {
      this.preferences.notifications = {
        ...this.preferences.notifications,
        ...settings
      }
      this.savePreferences()
    },

    /**
     * Reset preferences to default
     */
    resetPreferences() {
      this.preferences = {
        defaultView: VIEW_MODES.MONTH,
        weekStartsOn: 0,
        timeFormat: '24h',
        language: 'zh-TW',
        theme: 'light',
        notifications: {
          enabled: true,
          defaultReminderTime: 15,
          sound: true
        }
      }
      this.savePreferences()
    },

    /**
     * Clear user data (logout)
     */
    clearUser() {
      this.userId = null
      this.displayName = ''
      this.pictureUrl = ''
      this.statusMessage = ''
      // Keep preferences for next login
    },

    /**
     * Save last logged in user
     */
    saveLastUser() {
      if (this.userId) {
        localStorage.setItem(STORAGE_KEYS.LAST_USER, this.userId)
      }
    },

    /**
     * Get last logged in user ID
     */
    getLastUser() {
      return localStorage.getItem(STORAGE_KEYS.LAST_USER)
    }
  }
})
