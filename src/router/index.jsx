/**
 * React Router Configuration
 * Defines all application routes
 */

import React, { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'

// Lazy-loaded views
const Home = lazy(() => import('@/views/Home'))
const ScheduleList = lazy(() => import('@/views/ScheduleList'))
const ScheduleCreate = lazy(() => import('@/views/ScheduleCreate'))
const ScheduleDetail = lazy(() => import('@/views/ScheduleDetail'))
const ScheduleEdit = lazy(() => import('@/views/ScheduleEdit'))
const Settings = lazy(() => import('@/views/Settings'))

function LoadingFallback() {
    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '60vh',
            color: 'var(--text-secondary)'
        }}>
            <div className="spinner" />
        </div>
    )
}

export const routeConfig = [
    { path: '/', meta: { title: 'カレンダー', showTabbar: true } },
    { path: '/schedules', meta: { title: 'スケジュール一覧', showTabbar: true } },
    { path: '/schedule/create', meta: { title: 'スケジュールを作成', showTabbar: false } },
    { path: '/schedule/:id', meta: { title: 'スケジュール詳細', showTabbar: false } },
    { path: '/schedule/:id/edit', meta: { title: 'スケジュールを編集', showTabbar: false } },
    { path: '/settings', meta: { title: '設定', showTabbar: true } }
]

export function AppRoutes() {
    return (
        <Suspense fallback={<LoadingFallback />}>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/schedules" element={<ScheduleList />} />
                <Route path="/schedule/create" element={<ScheduleCreate />} />
                <Route path="/schedule/:id" element={<ScheduleDetail />} />
                <Route path="/schedule/:id/edit" element={<ScheduleEdit />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Suspense>
    )
}
