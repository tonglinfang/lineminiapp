/**
 * User Store (Zustand)
 * Manages LINE user profile and preferences
 */

import { create } from 'zustand'
import { STORAGE_KEYS, VIEW_MODES } from '@/utils/constants'

const defaultPreferences = {
    defaultView: VIEW_MODES.MONTH,
    weekStartsOn: 0,
    timeFormat: '24h',
    language: 'ja',
    theme: 'light',
    notifications: {
        enabled: true,
        defaultReminderTime: 15,
        sound: true
    }
}

export const useUserStore = create((set, get) => ({
    // State
    userId: null,
    displayName: '',
    pictureUrl: '',
    statusMessage: '',
    preferences: { ...defaultPreferences },

    // Getters (computed via selectors)
    get isLoggedIn() { return !!get().userId },
    get userName() { return get().displayName || 'ユーザー' },
    get avatar() { return get().pictureUrl || 'https://via.placeholder.com/150' },
    get notificationsEnabled() { return get().preferences.notifications.enabled },

    // Actions
    setUser(profile) {
        if (!profile || !profile.userId) {
            console.error('Invalid user profile')
            return
        }
        set({
            userId: profile.userId,
            displayName: profile.displayName || '',
            pictureUrl: profile.pictureUrl || '',
            statusMessage: profile.statusMessage || ''
        })
        console.log('✅ User profile set:', { userId: profile.userId, displayName: profile.displayName })
        get().loadPreferences()
    },

    loadPreferences() {
        const { userId } = get()
        if (!userId) return

        const key = `${STORAGE_KEYS.PREFERENCES_PREFIX}${userId}`
        const saved = localStorage.getItem(key)

        if (saved) {
            try {
                const parsed = JSON.parse(saved)
                set(state => ({
                    preferences: {
                        ...state.preferences,
                        ...parsed,
                        notifications: {
                            ...state.preferences.notifications,
                            ...(parsed.notifications || {})
                        }
                    }
                }))
                console.log('✅ User preferences loaded')
            } catch (err) {
                console.error('Failed to parse preferences:', err)
            }
        }
    },

    savePreferences() {
        const { userId, preferences } = get()
        if (!userId) return

        const key = `${STORAGE_KEYS.PREFERENCES_PREFIX}${userId}`
        try {
            localStorage.setItem(key, JSON.stringify(preferences))
            console.log('✅ User preferences saved')
        } catch (err) {
            console.error('Failed to save preferences:', err)
        }
    },

    updatePreference(key, value) {
        set(state => ({
            preferences: { ...state.preferences, [key]: value }
        }))
        get().savePreferences()
    },

    updateNotificationSettings(settings) {
        set(state => ({
            preferences: {
                ...state.preferences,
                notifications: { ...state.preferences.notifications, ...settings }
            }
        }))
        get().savePreferences()
    },

    resetPreferences() {
        set({ preferences: { ...defaultPreferences } })
        get().savePreferences()
    },

    clearUser() {
        set({ userId: null, displayName: '', pictureUrl: '', statusMessage: '' })
    },

    saveLastUser() {
        const { userId } = get()
        if (userId) {
            localStorage.setItem(STORAGE_KEYS.LAST_USER, userId)
        }
    },

    getLastUser() {
        return localStorage.getItem(STORAGE_KEYS.LAST_USER)
    }
}))
