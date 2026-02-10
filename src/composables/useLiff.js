/**
 * LIFF Integration Composable
 * Handles LINE Frontend Framework initialization, authentication, and user profile
 */

import { ref, readonly } from 'vue'
import liff from '@line/liff'
import { config } from '@/config'
import { ERROR_MESSAGES } from '@/utils/constants'

// Shared state across all component instances
const isLiffReady = ref(false)
const isLoggedIn = ref(false)
const userProfile = ref(null)
const error = ref(null)
const isInitializing = ref(false)

export function useLiff() {
  /**
   * Initialize LIFF SDK
   * Must be called before using any LIFF features
   */
  async function initLiff() {
    // Prevent multiple initializations
    if (isInitializing.value || isLiffReady.value) {
      return
    }

    isInitializing.value = true
    error.value = null

    try {
      // Mock mode for development without LIFF
      if (config.liff.mockMode && config.isDevelopment) {
        console.warn('🔧 LIFF Mock Mode: Using fake user profile')
        await mockLiffInit()
        return
      }

      // Check if LIFF ID is configured
      if (!config.liff.id) {
        throw new Error('LIFF ID is not configured')
      }

      // Initialize LIFF SDK
      await liff.init({ liffId: config.liff.id })
      isLiffReady.value = true

      // Check login status
      if (liff.isLoggedIn()) {
        isLoggedIn.value = true
        await fetchUserProfile()
      } else {
        // Automatically redirect to LINE login
        console.log('User not logged in, redirecting to LINE login...')
        liff.login()
      }
    } catch (err) {
      error.value = err.message || ERROR_MESSAGES.LIFF_INIT_FAILED
      console.error('❌ LIFF initialization failed:', err)
      throw err
    } finally {
      isInitializing.value = false
    }
  }

  /**
   * Mock LIFF initialization for development
   * Creates a fake user profile for testing without LINE
   */
  async function mockLiffInit() {
    return new Promise((resolve) => {
      setTimeout(() => {
        isLiffReady.value = true
        isLoggedIn.value = true
        userProfile.value = {
          userId: 'U' + Math.random().toString(36).substr(2, 9),
          displayName: 'Test User',
          pictureUrl: 'https://via.placeholder.com/150',
          statusMessage: 'Testing LINE Mini App'
        }
        console.log('✅ LIFF Mock initialized:', userProfile.value)
        resolve()
      }, 500)
    })
  }

  /**
   * Fetch LINE user profile
   * Returns user information (userId, displayName, pictureUrl, statusMessage)
   */
  async function fetchUserProfile() {
    try {
      // Mock mode
      if (config.liff.mockMode && config.isDevelopment) {
        return userProfile.value
      }

      const profile = await liff.getProfile()
      userProfile.value = profile
      console.log('✅ User profile fetched:', profile)
      return profile
    } catch (err) {
      error.value = ERROR_MESSAGES.PROFILE_FETCH_FAILED
      console.error('❌ Failed to fetch user profile:', err)
      throw err
    }
  }

  /**
   * Manually trigger LINE login
   * Redirects to LINE authentication page
   */
  function login() {
    if (config.liff.mockMode && config.isDevelopment) {
      isLoggedIn.value = true
      return
    }

    if (isLiffReady.value) {
      liff.login()
    }
  }

  /**
   * Logout from LINE
   */
  function logout() {
    if (config.liff.mockMode && config.isDevelopment) {
      isLoggedIn.value = false
      userProfile.value = null
      return
    }

    if (isLiffReady.value && liff.isLoggedIn()) {
      liff.logout()
      isLoggedIn.value = false
      userProfile.value = null
    }
  }

  /**
   * Close LIFF window
   * Returns to LINE chat
   */
  function closeLiff() {
    if (config.liff.mockMode && config.isDevelopment) {
      console.log('🔧 Mock: Close LIFF window')
      return
    }

    if (isLiffReady.value) {
      liff.closeWindow()
    }
  }

  /**
   * Check if running in LINE app
   */
  function isInClient() {
    if (config.liff.mockMode) return true
    return isLiffReady.value ? liff.isInClient() : false
  }

  /**
   * Get LIFF OS (ios, android, web)
   */
  function getOS() {
    if (config.liff.mockMode) return 'web'
    return isLiffReady.value ? liff.getOS() : 'web'
  }

  /**
   * Get LINE version
   */
  function getLineVersion() {
    if (config.liff.mockMode) return '12.0.0'
    return isLiffReady.value ? liff.getLineVersion() : null
  }

  /**
   * Send message to LINE (share feature)
   * Opens LINE's share target picker
   */
  async function sendMessage(messages) {
    if (config.liff.mockMode && config.isDevelopment) {
      console.log('🔧 Mock: Send message', messages)
      return true
    }

    if (!isLiffReady.value) {
      throw new Error('LIFF is not initialized')
    }

    // Check if shareTargetPicker is available
    if (!liff.isApiAvailable('shareTargetPicker')) {
      console.warn('shareTargetPicker is not available')
      return false
    }

    try {
      await liff.shareTargetPicker(messages)
      return true
    } catch (err) {
      console.error('Failed to send message:', err)
      return false
    }
  }

  /**
   * Open external URL in LINE's in-app browser
   */
  function openWindow(url, external = false) {
    if (config.liff.mockMode && config.isDevelopment) {
      console.log('🔧 Mock: Open window', url)
      window.open(url, external ? '_blank' : '_self')
      return
    }

    if (isLiffReady.value) {
      liff.openWindow({ url, external })
    } else {
      window.open(url, external ? '_blank' : '_self')
    }
  }

  return {
    // State (readonly)
    isLiffReady: readonly(isLiffReady),
    isLoggedIn: readonly(isLoggedIn),
    isInitializing: readonly(isInitializing),
    userProfile: readonly(userProfile),
    error: readonly(error),

    // Methods
    initLiff,
    fetchUserProfile,
    login,
    logout,
    closeLiff,
    isInClient,
    getOS,
    getLineVersion,
    sendMessage,
    openWindow
  }
}
