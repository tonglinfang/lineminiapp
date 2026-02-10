/**
 * Pinia Store Index
 * Centralized state management setup
 */

import { createPinia } from 'pinia'

// Create pinia instance
const pinia = createPinia()

export default pinia

// Re-export stores for easy imports
export { useUserStore } from './user'
export { useScheduleStore } from './schedule'
export { useCategoryStore } from './category'
export { useCalendarStore } from './calendar'
