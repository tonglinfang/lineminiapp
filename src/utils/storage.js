/**
 * LocalStorage Service
 * Handles data persistence with user isolation and error handling
 */

import { STORAGE_KEYS, APP_CONFIG, ERROR_MESSAGES } from './constants'

/**
 * LocalStorage wrapper with user-specific data isolation
 */
class StorageService {
  constructor() {
    this.currentUserId = null
    this.checkAvailability()
  }

  /**
   * Check if localStorage is available
   * Some browsers disable it in private mode
   */
  checkAvailability() {
    try {
      const test = '__storage_test__'
      localStorage.setItem(test, test)
      localStorage.removeItem(test)
      return true
    } catch (e) {
      console.error('LocalStorage is not available:', e)
      return false
    }
  }

  /**
   * Set current user ID for data isolation
   * @param {string} userId - LINE user ID
   */
  setCurrentUser(userId) {
    if (!userId) {
      console.warn('Cannot set empty userId')
      return
    }
    this.currentUserId = userId
    localStorage.setItem(STORAGE_KEYS.LAST_USER, userId)
    console.log('✅ Current user set:', userId)
  }

  /**
   * Get current user ID
   * @returns {string|null}
   */
  getCurrentUser() {
    return this.currentUserId || localStorage.getItem(STORAGE_KEYS.LAST_USER)
  }

  /**
   * Get storage key with user prefix
   * @param {string} key - Base key name
   * @param {string} userId - User ID (optional, uses current user)
   * @returns {string}
   */
  getUserKey(key, userId = null) {
    const id = userId || this.currentUserId
    if (!id) {
      throw new Error('User ID is required for user-specific storage')
    }
    return `${key}${id}`
  }

  /**
   * Get item from localStorage
   * @param {string} key - Storage key
   * @param {*} defaultValue - Default value if not found
   * @returns {*}
   */
  getItem(key, defaultValue = null) {
    try {
      const value = localStorage.getItem(key)
      return value ? JSON.parse(value) : defaultValue
    } catch (error) {
      console.error('Error getting item:', key, error)
      return defaultValue
    }
  }

  /**
   * Set item in localStorage
   * @param {string} key - Storage key
   * @param {*} value - Value to store
   * @returns {boolean} Success status
   */
  setItem(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value))
      return true
    } catch (error) {
      console.error('Error setting item:', key, error)
      // Check if quota exceeded
      if (error.name === 'QuotaExceededError') {
        console.error('LocalStorage quota exceeded!')
      }
      return false
    }
  }

  /**
   * Remove item from localStorage
   * @param {string} key - Storage key
   */
  removeItem(key) {
    try {
      localStorage.removeItem(key)
    } catch (error) {
      console.error('Error removing item:', key, error)
    }
  }

  /**
   * Clear all user-specific data
   * @param {string} userId - User ID (optional)
   */
  clearUserData(userId = null) {
    const id = userId || this.currentUserId
    if (!id) return

    // Remove all user-specific keys
    const prefixes = [
      STORAGE_KEYS.USER_PREFIX,
      STORAGE_KEYS.SCHEDULES_PREFIX,
      STORAGE_KEYS.CATEGORIES_PREFIX,
      STORAGE_KEYS.PREFERENCES_PREFIX
    ]

    prefixes.forEach(prefix => {
      const key = `${prefix}${id}`
      this.removeItem(key)
    })

    console.log('✅ User data cleared:', id)
  }

  // ============================================
  // Schedule-specific methods
  // ============================================

  /**
   * Get all schedules for a user
   * @param {string} userId - User ID (optional)
   * @returns {Array} Array of schedule objects
   */
  getSchedules(userId = null) {
    const key = this.getUserKey(STORAGE_KEYS.SCHEDULES_PREFIX, userId)
    const schedules = this.getItem(key, [])

    // Filter out deleted schedules older than 30 days
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000
    return schedules.filter(schedule => {
      if (schedule.isDeleted) {
        const deletedAt = new Date(schedule.updatedAt).getTime()
        return deletedAt > thirtyDaysAgo
      }
      return true
    })
  }

  /**
   * Save schedules for a user
   * @param {Array} schedules - Array of schedule objects
   * @param {string} userId - User ID (optional)
   * @returns {boolean} Success status
   */
  saveSchedules(schedules, userId = null) {
    if (!Array.isArray(schedules)) {
      console.error('Schedules must be an array')
      return false
    }

    // Enforce maximum schedule limit
    if (schedules.length > APP_CONFIG.MAX_SCHEDULES) {
      console.warn(`Schedule limit exceeded: ${schedules.length}/${APP_CONFIG.MAX_SCHEDULES}`)
      schedules = schedules.slice(0, APP_CONFIG.MAX_SCHEDULES)
    }

    const key = this.getUserKey(STORAGE_KEYS.SCHEDULES_PREFIX, userId)
    return this.setItem(key, schedules)
  }

  /**
   * Add a single schedule
   * @param {Object} schedule - Schedule object
   * @param {string} userId - User ID (optional)
   * @returns {Object|null} Added schedule or null
   */
  addSchedule(schedule, userId = null) {
    if (!schedule || !schedule.id) {
      console.error('Invalid schedule object')
      return null
    }

    const schedules = this.getSchedules(userId)
    schedules.push(schedule)

    if (this.saveSchedules(schedules, userId)) {
      console.log('✅ Schedule added:', schedule.id)
      return schedule
    }

    return null
  }

  /**
   * Update a schedule
   * @param {string} scheduleId - Schedule ID
   * @param {Object} updates - Fields to update
   * @param {string} userId - User ID (optional)
   * @returns {Object|null} Updated schedule or null
   */
  updateSchedule(scheduleId, updates, userId = null) {
    const schedules = this.getSchedules(userId)
    const index = schedules.findIndex(s => s.id === scheduleId)

    if (index === -1) {
      console.error('Schedule not found:', scheduleId)
      return null
    }

    // Merge updates
    schedules[index] = {
      ...schedules[index],
      ...updates,
      updatedAt: new Date().toISOString()
    }

    if (this.saveSchedules(schedules, userId)) {
      console.log('✅ Schedule updated:', scheduleId)
      return schedules[index]
    }

    return null
  }

  /**
   * Delete a schedule (soft delete)
   * @param {string} scheduleId - Schedule ID
   * @param {string} userId - User ID (optional)
   * @returns {boolean} Success status
   */
  deleteSchedule(scheduleId, userId = null) {
    return this.updateSchedule(scheduleId, { isDeleted: true }, userId) !== null
  }

  /**
   * Permanently delete a schedule
   * @param {string} scheduleId - Schedule ID
   * @param {string} userId - User ID (optional)
   * @returns {boolean} Success status
   */
  permanentlyDeleteSchedule(scheduleId, userId = null) {
    const schedules = this.getSchedules(userId)
    const filtered = schedules.filter(s => s.id !== scheduleId)

    if (filtered.length === schedules.length) {
      console.error('Schedule not found:', scheduleId)
      return false
    }

    return this.saveSchedules(filtered, userId)
  }

  /**
   * Get schedule by ID
   * @param {string} scheduleId - Schedule ID
   * @param {string} userId - User ID (optional)
   * @returns {Object|null}
   */
  getScheduleById(scheduleId, userId = null) {
    const schedules = this.getSchedules(userId)
    return schedules.find(s => s.id === scheduleId) || null
  }

  // ============================================
  // Category-specific methods
  // ============================================

  /**
   * Get user custom categories
   * @param {string} userId - User ID (optional)
   * @returns {Object} Categories object
   */
  getCategories(userId = null) {
    const key = this.getUserKey(STORAGE_KEYS.CATEGORIES_PREFIX, userId)
    return this.getItem(key, { customCategories: [], tags: [] })
  }

  /**
   * Save user custom categories
   * @param {Object} categories - Categories object
   * @param {string} userId - User ID (optional)
   * @returns {boolean} Success status
   */
  saveCategories(categories, userId = null) {
    const key = this.getUserKey(STORAGE_KEYS.CATEGORIES_PREFIX, userId)
    return this.setItem(key, categories)
  }

  /**
   * Add a custom tag
   * @param {string} tag - Tag name
   * @param {string} userId - User ID (optional)
   * @returns {boolean} Success status
   */
  addTag(tag, userId = null) {
    const categories = this.getCategories(userId)

    if (!categories.tags.includes(tag)) {
      categories.tags.push(tag)

      // Enforce max tags limit
      if (categories.tags.length > APP_CONFIG.MAX_TAGS) {
        categories.tags = categories.tags.slice(0, APP_CONFIG.MAX_TAGS)
      }

      return this.saveCategories(categories, userId)
    }

    return true
  }

  // ============================================
  // Data export/import
  // ============================================

  /**
   * Export all user data
   * @param {string} userId - User ID (optional)
   * @returns {Object} Exported data
   */
  exportData(userId = null) {
    const id = userId || this.currentUserId
    if (!id) {
      throw new Error('User ID is required')
    }

    return {
      version: APP_CONFIG.VERSION,
      userId: id,
      exportedAt: new Date().toISOString(),
      schedules: this.getSchedules(id),
      categories: this.getCategories(id)
    }
  }

  /**
   * Import user data
   * @param {Object} data - Data to import
   * @param {boolean} merge - Merge with existing data
   * @returns {boolean} Success status
   */
  importData(data, merge = false) {
    if (!data || !data.userId) {
      console.error('Invalid import data')
      return false
    }

    try {
      if (!merge) {
        // Clear existing data
        this.clearUserData(data.userId)
      }

      // Import schedules
      if (data.schedules) {
        const existing = merge ? this.getSchedules(data.userId) : []
        const schedules = [...existing, ...data.schedules]
        this.saveSchedules(schedules, data.userId)
      }

      // Import categories
      if (data.categories) {
        this.saveCategories(data.categories, data.userId)
      }

      console.log('✅ Data imported successfully')
      return true
    } catch (error) {
      console.error('Import failed:', error)
      return false
    }
  }

  /**
   * Get storage usage statistics
   * @returns {Object} Storage stats
   */
  getStorageStats() {
    let totalSize = 0
    let itemCount = 0

    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        totalSize += localStorage[key].length + key.length
        itemCount++
      }
    }

    // Convert to KB
    const sizeKB = (totalSize / 1024).toFixed(2)
    const estimatedLimit = 5 * 1024 // ~5MB typical limit

    return {
      itemCount,
      sizeKB,
      sizeMB: (sizeKB / 1024).toFixed(2),
      percentUsed: ((sizeKB / estimatedLimit) * 100).toFixed(2),
      estimatedLimitMB: (estimatedLimit / 1024).toFixed(2)
    }
  }
}

// Export singleton instance
export const storageService = new StorageService()

// Export class for testing
export default StorageService
