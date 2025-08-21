// Enhanced security utilities for the application
import { 
  sanitizeInputAdvanced, 
  validateEmailAdvanced, 
  securityMonitor, 
  defaultSecurityConfig,
  getClientIP 
} from './securityEnhancements'

export const sanitizeInput = (input: string): string => {
  return sanitizeInputAdvanced(input, 1000)
}

export const validateEmail = (email: string): boolean => {
  return validateEmailAdvanced(email).isValid
}

export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^\+?[\d\s\-\(\)]{7,20}$/
  return phoneRegex.test(phone) && !phone.includes('<') && !phone.includes('>')
}

export const validateName = (name: string): boolean => {
  const nameRegex = /^[a-zA-ZÀ-ÿ\s]{1,100}$/
  return nameRegex.test(name) && name.length <= 100
}

export const generateCSRFToken = (): string => {
  return crypto.randomUUID()
}

export const isValidURL = (url: string): boolean => {
  try {
    const parsedUrl = new URL(url)
    return ['http:', 'https:'].includes(parsedUrl.protocol)
  } catch {
    return false
  }
}

// Enhanced rate limiting with IP tracking and blocking
export const rateLimiter = {
  store: new Map<string, { count: number; resetTime: number; blocked: boolean; firstAttempt: number }>(),
  
  check: (key: string, limit: number = 10, windowMs: number = 60000): boolean => {
    const now = Date.now()
    const record = rateLimiter.store.get(key)
    
    if (!record || now > record.resetTime) {
      rateLimiter.store.set(key, { 
        count: 1, 
        resetTime: now + windowMs, 
        blocked: false,
        firstAttempt: now
      })
      return false
    }
    
    if (record.count >= limit) {
      record.blocked = true
      
      // Track suspicious behavior for repeated violations
      if (now - record.firstAttempt < windowMs * 2) {
        securityMonitor.trackSuspiciousActivity(
          'Rapid rate limit violations',
          { key, attempts: record.count, timeWindow: windowMs },
          'high'
        )
      }
      
      return true
    }
    
    record.count++
    return false
  },

  isBlocked: (key: string): boolean => {
    const record = rateLimiter.store.get(key)
    return record?.blocked || false
  },

  // Clean up old entries periodically
  cleanup: () => {
    const now = Date.now()
    for (const [key, record] of rateLimiter.store.entries()) {
      if (now > record.resetTime + 300000) { // Clean up entries older than 5 minutes past reset
        rateLimiter.store.delete(key)
      }
    }
  }
}

// CSRF token management with enhanced security
export const csrfToken = {
  generate: (): string => {
    const token = generateCSRFToken()
    sessionStorage.setItem('csrf-token', token)
    sessionStorage.setItem('csrf-timestamp', Date.now().toString())
    return token
  },

  validate: (token: string): boolean => {
    const stored = sessionStorage.getItem('csrf-token')
    const timestamp = sessionStorage.getItem('csrf-timestamp')
    
    if (!stored || !timestamp) return false
    
    // Check token expiry (30 minutes)
    const tokenAge = Date.now() - parseInt(timestamp)
    if (tokenAge > 1800000) {
      csrfToken.refresh()
      return false
    }
    
    return stored === token && token.length > 0
  },

  refresh: (): string => {
    return csrfToken.generate()
  },

  get: (): string | null => {
    const token = sessionStorage.getItem('csrf-token')
    const timestamp = sessionStorage.getItem('csrf-timestamp')
    
    if (!token || !timestamp) return null
    
    // Auto-refresh if token is older than 25 minutes
    const tokenAge = Date.now() - parseInt(timestamp)
    if (tokenAge > 1500000) {
      return csrfToken.refresh()
    }
    
    return token
  }
}

// Enhanced form validation with security monitoring
export const validateFormInput = (data: Record<string, any>): { isValid: boolean; errors: string[] } => {
  const errors: string[] = []

  // Enhanced email validation
  if (data.email) {
    const emailValidation = validateEmailAdvanced(data.email)
    if (!emailValidation.isValid) {
      errors.push(emailValidation.error || 'Invalid email format')
      securityMonitor.trackFailedAttempt('invalid_email', { email: data.email.slice(0, 10) + '...' })
    }
  }

  // Enhanced phone validation
  if (data.phone && !validatePhone(data.phone)) {
    errors.push('Invalid phone number format')
    securityMonitor.trackFailedAttempt('invalid_phone', { phone: data.phone.slice(0, 5) + '...' })
  }

  // Enhanced name validation
  if (data.name && !validateName(data.name)) {
    errors.push('Invalid name format')
    securityMonitor.trackFailedAttempt('invalid_name', { name: data.name.slice(0, 10) + '...' })
  }

  // Sanitize text inputs with monitoring
  const textFields = ['name', 'subject', 'message', 'client_name']
  textFields.forEach(field => {
    if (data[field]) {
      const original = data[field]
      data[field] = sanitizeInput(data[field])
      
      // Track if sanitization changed the input
      if (original !== data[field]) {
        securityMonitor.trackSuspiciousActivity(
          'Input sanitization applied',
          { field, originalLength: original.length, sanitizedLength: data[field].length },
          'low'
        )
      }
    }
  })

  return {
    isValid: errors.length === 0,
    errors
  }
}

// Enhanced security logging with structured data
export const securityLog = {
  logSuspiciousActivity: (activity: string, details: any = {}) => {
    securityMonitor.trackSuspiciousActivity(activity, details, 'medium')
  },

  logFailedAttempt: (type: 'login' | 'form_submission' | 'rate_limit', details: any = {}) => {
    securityMonitor.trackFailedAttempt(type, details)
  }
}

// Keep existing rateLimit for backward compatibility
export const rateLimit = {
  store: new Map<string, { count: number; resetTime: number }>(),
  
  check: (key: string, limit: number = 10, windowMs: number = 60000): boolean => {
    return rateLimiter.check(key, limit, windowMs)
  }
}

// Periodic cleanup of rate limiting store
if (typeof window !== 'undefined') {
  setInterval(() => {
    rateLimiter.cleanup()
  }, 300000) // Clean up every 5 minutes
}
