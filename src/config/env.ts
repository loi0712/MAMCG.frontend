/**
 * Environment configuration
 * Sử dụng các biến từ .env files
 */
export const env = {
    // API Configuration
    apiUrl: import.meta.env.VITE_API_URL,
    domainUrl: import.meta.env.VITE_DOMAIN_URL,
    
    // Environment flags
    isDevelopment: import.meta.env.DEV,
    isProduction: import.meta.env.PROD,
    mode: import.meta.env.MODE,
    
    // Feature flags
    enableDevtools: import.meta.env.DEV,
    enableDebugMode: import.meta.env.VITE_DEBUG_MODE === 'true',
  } as const
  
  // Validation
  if (!env.apiUrl) {
    throw new Error('VITE_API_URL is required')
  }
  
  if (env.isProduction && !env.domainUrl) {
    console.warn('VITE_DOMAIN_URL is not set in production')
  }
  