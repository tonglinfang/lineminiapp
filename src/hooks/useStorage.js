/**
 * useStorage - React hook
 * Storage stats and utilities
 */

import { useState, useCallback } from 'react'
import { storageService } from '@/utils/storage'
import { useUserStore } from '@/stores/userStore'

export function useStorage() {
    const [storageStats, setStorageStats] = useState({ sizeKB: 0, percentUsed: 0 })

    const updateStats = useCallback(() => {
        try {
            const stats = storageService.getStorageStats()
            setStorageStats(stats)
        } catch (err) {
            console.error('Failed to get storage stats:', err)
        }
    }, [])

    const clearUserData = useCallback(() => {
        const userStore = useUserStore.getState()
        if (userStore.userId) {
            storageService.clearUserData(userStore.userId)
            updateStats()
        }
    }, [updateStats])

    return {
        storageStats,
        updateStats,
        clearUserData
    }
}
