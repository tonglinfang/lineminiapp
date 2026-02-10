/**
 * Application Configuration
 * Environment-specific settings loaded from .env files
 */

export const config = {
  // LIFF Configuration
  liff: {
    id: import.meta.env.VITE_LIFF_ID || '',
    mockMode: import.meta.env.VITE_LIFF_MOCK === 'true' // For development without LIFF
  },

  // App Metadata
  app: {
    title: import.meta.env.VITE_APP_TITLE || '日程管理',
    env: import.meta.env.VITE_APP_ENV || 'development',
    version: '1.0.0'
  },

  // API Configuration (for future backend integration)
  api: {
    baseURL: import.meta.env.VITE_API_BASE_URL || '',
    timeout: 10000 // Request timeout in milliseconds
  },

  // Feature Flags
  features: {
    enableNotifications: true,
    enableLineMessaging: false, // Requires backend
    enableDataExport: true,
    enableDataImport: true,
    enableRecurrence: false // Future feature: recurring schedules
  },

  // Development Mode
  isDevelopment: import.meta.env.MODE === 'development',
  isProduction: import.meta.env.MODE === 'production'
}

// Validate required configuration
if (config.isProduction && !config.liff.id) {
  console.warn('⚠️ LIFF ID is not configured. The app may not work properly.')
}

export default config
