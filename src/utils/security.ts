// Enhanced security utilities for the application
export const sanitizeInput = (input: string): string => {
  return input
    .replace(/[<>]/g, '') // Remove potential script tags
    .replace(/javascript:/gi, '') // Remove javascript: protocols
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim()
    .slice(0, 1000) // Limit length
}

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email) && email.length <= 254 && !email.includes('<') && !email.includes('>')
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

// Enhanced rate limiting with IP tracking
export const rateLimiter = {
  store: new Map<string, { count: number; resetTime: number; blocked: boolean }>(),
  
  check: (key: string, limit: number = 10, windowMs: number = 60000): boolean => {
    const now = Date.now()
    const record = rateLimiter.store.get(key)
    
    if (!record || now > record.resetTime) {
      rateLimiter.store.set(key, { count: 1, resetTime: now + windowMs, blocked: false })
      return false
    }
    
    if (record.count >= limit) {
      record.blocked = true
      return true
    }
    
    record.count++
    return false
  },

  isBlocked: (key: string): boolean => {
    const record = rateLimiter.store.get(key)
    return record?.blocked || false
  }
}

// CSRF token management
export const csrfToken = {
  generate: (): string => {
    const token = generateCSRFToken()
    sessionStorage.setItem('csrf-token', token)
    return token
  },

  validate: (token: string): boolean => {
    const stored = sessionStorage.getItem('csrf-token')
    return stored === token && token.length > 0
  },

  get: (): string | null => {
    return sessionStorage.getItem('csrf-token')
  }
}

// Input validation for forms
export const validateFormInput = (data: Record<string, any>): { isValid: boolean; errors: string[] } => {
  const errors: string[] = []

  // Validate email
  if (data.email && !validateEmail(data.email)) {
    errors.push('Invalid email format')
  }

  // Validate phone
  if (data.phone && !validatePhone(data.phone)) {
    errors.push('Invalid phone number format')
  }

  // Validate name
  if (data.name && !validateName(data.name)) {
    errors.push('Invalid name format')
  }

  // Sanitize text inputs
  const textFields = ['name', 'subject', 'message', 'client_name']
  textFields.forEach(field => {
    if (data[field]) {
      data[field] = sanitizeInput(data[field])
    }
  })

  return {
    isValid: errors.length === 0,
    errors
  }
}

// Security logging
export const securityLog = {
  logSuspiciousActivity: (activity: string, details: any = {}) => {
    console.warn('Security Alert:', activity, details)
    // In production, send to security monitoring service
  },

  logFailedAttempt: (type: 'login' | 'form_submission' | 'rate_limit', details: any = {}) => {
    console.warn('Failed Attempt:', type, details)
    // In production, send to security monitoring service
  }
}

// Keep existing rateLimit for backward compatibility
export const rateLimit = {
  store: new Map<string, { count: number; resetTime: number }>(),
  
  check: (key: string, limit: number = 10, windowMs: number = 60000): boolean => {
    const now = Date.now()
    const record = rateLimit.store.get(key)
    
    if (!record || now > record.resetTime) {
      rateLimit.store.set(key, { count: 1, resetTime: now + windowMs })
      return false
    }
    
    if (record.count >= limit) {
      return true
    }
    
    record.count++
    return false
  }
}
