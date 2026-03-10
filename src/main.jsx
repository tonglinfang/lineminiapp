/**
 * main.jsx - React entry point
 * Initializes the React application and LIFF SDK
 */

import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { useLiff } from './hooks/useLiff'
import { useUserStore } from './stores/userStore'
import { useScheduleStore } from './stores/scheduleStore'
import { useCategoryStore } from './stores/categoryStore'
import { useNotification } from './hooks/useNotification'

// Import global styles
import './assets/styles/global.css'

/**
 * Initialize the application
 * 1. Mount React app immediately
 * 2. Initialize LIFF in background
 * 3. Load user data after LIFF login
 */
async function initializeApp() {
    // Mount React app immediately
    const root = ReactDOM.createRoot(document.getElementById('app'))

    const base = import.meta.env.BASE_URL || '/'

    root.render(
        <React.StrictMode>
            <BrowserRouter basename={base}>
                <App />
            </BrowserRouter>
        </React.StrictMode>
    )

    // Expose router context for notification navigation
    // (react-router doesn't expose a global router, so we use window.location)
    window.__APP_CONTEXT__ = {}

    // Initialize LIFF in background
    const liff = useLiff()
    try {
        await liff.initLiff()

        if (liff.isLoggedIn && liff.userProfile) {
            const userStore = useUserStore.getState()
            const scheduleStore = useScheduleStore.getState()
            const categoryStore = useCategoryStore.getState()

            userStore.setUser(liff.userProfile)
            userStore.saveLastUser()

            await Promise.all([
                scheduleStore.loadSchedules(),
                categoryStore.loadCategories()
            ])

            console.log('✅ App initialized successfully')
            console.log(`📊 Loaded ${useScheduleStore.getState().schedules.length} schedules`)
        }
    } catch (error) {
        console.error('❌ App initialization failed:', error)
        // App will still work in mock mode or show error UI
    }
}

// Start the app
initializeApp()
