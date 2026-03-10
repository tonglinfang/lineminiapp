/**
 * App.jsx - Root React component
 * Handles initialization, routing, and bottom tabbar navigation
 */

import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { AppRoutes } from './router'
import { useLiff } from './hooks/useLiff'
import { useUserStore } from './stores/userStore'
import './assets/styles/global.css'

const TABS = [
    { path: '/', icon: '📅', label: 'カレンダー' },
    { path: '/schedules', icon: '📋', label: 'リスト' },
    { path: '/settings', icon: '⚙️', label: '設定' }
]

const TABBAR_PATHS = ['/', '/schedules', '/settings']

function App() {
    const location = useLocation()
    const navigate = useNavigate()
    const { initLiff, isLiffReady, error: liffError } = useLiff()
    const userStore = useUserStore()

    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)

    const showTabbar = TABBAR_PATHS.includes(location.pathname)
    const activeTab = TABS.findIndex(t => t.path === location.pathname)

    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 800)
        return () => clearTimeout(timer)
    }, [])

    async function retryInit() {
        setError(null)
        setIsLoading(true)
        try {
            await initLiff()
            setIsLoading(false)
        } catch (err) {
            setError(err.message)
            setIsLoading(false)
        }
    }

    const displayError = error || liffError

    if (isLoading) {
        return (
            <div className="loading-screen">
                <div className="spinner" />
                <p>初期化中...</p>
            </div>
        )
    }

    if (displayError) {
        return (
            <div className="error-screen">
                <span className="error-icon">⚠️</span>
                <h2>初期化に失敗しました</h2>
                <p>{displayError}</p>
                <button className="btn btn-primary" onClick={retryInit}>再試行</button>
            </div>
        )
    }

    return (
        <div id="app" className="app-container">
            <div className="app-content">
                <AppRoutes />
            </div>

            {showTabbar && (
                <nav className="app-tabbar">
                    {TABS.map((tab, index) => (
                        <button
                            key={tab.path}
                            className={`tabbar-item ${activeTab === index ? 'is-active' : ''}`}
                            onClick={() => navigate(tab.path)}
                        >
                            <span className="tabbar-icon">{tab.icon}</span>
                            <span className="tabbar-label">{tab.label}</span>
                        </button>
                    ))}
                </nav>
            )}
        </div>
    )
}

export default App
