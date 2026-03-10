/**
 * useLiff - React hook
 * Handles LINE Frontend Framework initialization, authentication, and user profile
 */

import { useState, useCallback } from 'react'
import liff from '@line/liff'
import { config } from '@/config'
import { ERROR_MESSAGES } from '@/utils/constants'

// Module-level shared state (singleton pattern)
let _isLiffReady = false
let _isLoggedIn = false
let _userProfile = null
let _error = null
let _isInitializing = false
const _listeners = new Set()

function notifyListeners() {
    _listeners.forEach(fn => fn())
}

export function useLiff() {
    const [, forceUpdate] = useState(0)

    // Subscribe to module-level state changes
    const rerender = useCallback(() => forceUpdate(n => n + 1), [])
    if (!_listeners.has(rerender)) {
        _listeners.add(rerender)
    }

    async function initLiff() {
        if (_isInitializing || _isLiffReady) return

        _isInitializing = true
        _error = null
        notifyListeners()

        try {
            if (config.liff.mockMode && config.isDevelopment) {
                console.warn('🔧 LIFF Mock Mode: Using fake user profile')
                await mockLiffInit()
                return
            }

            if (!config.liff.id) throw new Error('LIFF ID is not configured')

            await liff.init({ liffId: config.liff.id })
            _isLiffReady = true

            if (liff.isLoggedIn()) {
                _isLoggedIn = true
                await fetchUserProfile()
            } else {
                console.log('User not logged in, redirecting to LINE login...')
                liff.login()
            }
        } catch (err) {
            _error = err.message || ERROR_MESSAGES.LIFF_INIT_FAILED
            console.error('❌ LIFF initialization failed:', err)
            throw err
        } finally {
            _isInitializing = false
            notifyListeners()
        }
    }

    async function mockLiffInit() {
        return new Promise(resolve => {
            setTimeout(() => {
                _isLiffReady = true
                _isLoggedIn = true
                _userProfile = {
                    userId: 'U' + Math.random().toString(36).substr(2, 9),
                    displayName: 'Test User',
                    pictureUrl: 'https://via.placeholder.com/150',
                    statusMessage: 'Testing LINE Mini App'
                }
                console.log('✅ LIFF Mock initialized:', _userProfile)
                notifyListeners()
                resolve()
            }, 500)
        })
    }

    async function fetchUserProfile() {
        try {
            if (config.liff.mockMode && config.isDevelopment) return _userProfile
            const profile = await liff.getProfile()
            _userProfile = profile
            notifyListeners()
            console.log('✅ User profile fetched:', profile)
            return profile
        } catch (err) {
            _error = ERROR_MESSAGES.PROFILE_FETCH_FAILED
            console.error('❌ Failed to fetch user profile:', err)
            throw err
        }
    }

    function login() {
        if (config.liff.mockMode && config.isDevelopment) {
            _isLoggedIn = true
            notifyListeners()
            return
        }
        if (_isLiffReady) liff.login()
    }

    function logout() {
        if (config.liff.mockMode && config.isDevelopment) {
            _isLoggedIn = false
            _userProfile = null
            notifyListeners()
            return
        }
        if (_isLiffReady && liff.isLoggedIn()) {
            liff.logout()
            _isLoggedIn = false
            _userProfile = null
            notifyListeners()
        }
    }

    function closeLiff() {
        if (config.liff.mockMode && config.isDevelopment) {
            console.log('🔧 Mock: Close LIFF window')
            return
        }
        if (_isLiffReady) liff.closeWindow()
    }

    function isInClient() {
        if (config.liff.mockMode) return true
        return _isLiffReady ? liff.isInClient() : false
    }

    function getOS() {
        if (config.liff.mockMode) return 'web'
        return _isLiffReady ? liff.getOS() : 'web'
    }

    function getLineVersion() {
        if (config.liff.mockMode) return '12.0.0'
        return _isLiffReady ? liff.getLineVersion() : null
    }

    async function sendMessage(messages) {
        if (config.liff.mockMode && config.isDevelopment) {
            console.log('🔧 Mock: Send message', messages)
            return true
        }
        if (!_isLiffReady) throw new Error('LIFF is not initialized')
        if (!liff.isApiAvailable('shareTargetPicker')) return false
        try {
            await liff.shareTargetPicker(messages)
            return true
        } catch (err) {
            console.error('Failed to send message:', err)
            return false
        }
    }

    function openWindow(url, external = false) {
        if (config.liff.mockMode && config.isDevelopment) {
            window.open(url, external ? '_blank' : '_self')
            return
        }
        if (_isLiffReady) {
            liff.openWindow({ url, external })
        } else {
            window.open(url, external ? '_blank' : '_self')
        }
    }

    return {
        isLiffReady: _isLiffReady,
        isLoggedIn: _isLoggedIn,
        isInitializing: _isInitializing,
        userProfile: _userProfile,
        error: _error,
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
