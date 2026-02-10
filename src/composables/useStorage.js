/**
 * Storage Composable
 * Provides reactive access to storage service
 */

import { ref, readonly } from 'vue'
import { storageService } from '@/utils/storage'

const storageAvailable = ref(storageService.checkAvailability())
const storageStats = ref(storageService.getStorageStats())

export function useStorage() {
  /**
   * Update storage statistics
   */
  function updateStats() {
    storageStats.value = storageService.getStorageStats()
  }

  /**
   * Check storage availability
   */
  function checkAvailability() {
    storageAvailable.value = storageService.checkAvailability()
    return storageAvailable.value
  }

  return {
    // Service methods (direct access)
    ...storageService,

    // Reactive state
    storageAvailable: readonly(storageAvailable),
    storageStats: readonly(storageStats),

    // Helper methods
    updateStats,
    checkAvailability
  }
}
