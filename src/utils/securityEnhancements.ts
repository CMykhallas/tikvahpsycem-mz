
// Enhanced security utilities for production environments
export interface SecurityConfig {
  rateLimits: {
    contact: { requests: number; windowMs: number }
    appointment: { requests: number; windowMs: number }
    general: { requests: number; windowMs: number }
  }
  validation: {
    maxFieldLength: number
    maxMessageLength: number
    allowedFileTypes: string[]
  }
}

export const defaultSecurityConfig: SecurityConfig = {
  rateLimits: {
    contact: { requests: 5, windowMs: 300000 }, // 5 requests per 5 minutes
    appointment: { requests: 3, windowMs: 600000 }, // 3 requests per 10 minutes
    general: { requests: 10, windowMs: 60000 } // 10 requests per minute
  },
  validation: {
    maxFieldLength: 100,
    maxMessageLength: 2000,
    allowedFileTypes: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
  }
}

// Enhanced IP extraction for production environments
export const getClientIP = (request?: Request): string => {
  if (typeof window !== 'undefined') {
    // Client-side fallback - in production this would be handled server-side
    return 'client_' + Date.now()
  }
  
  if (!request) return 'unknown'
  
  // Check various headers for real IP (server-side)
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  const cfConnectingIP = request.headers.get('cf-connecting-ip')
  
  return forwarded?.split(',')[0] || realIP || cfConnectingIP || 'unknown'
}

// Enhanced input sanitization with additional security checks
export const sanitizeInputAdvanced = (input: string, maxLength: number = 1000): string => {
  return input
    .replace(/[<>]/g, '') // Remove potential script tags
    .replace(/javascript:/gi, '') // Remove javascript: protocols
    .replace(/on\w+=/gi, '') // Remove event handlers
    .replace(/data:/gi, '') // Remove data: URLs
    .replace(/vbscript:/gi, '') // Remove vbscript: protocols
    .replace(/expression\s*\(/gi, '') // Remove CSS expressions
    .trim()
    .slice(0, maxLength)
}

// Enhanced email validation with additional security checks
export const validateEmailAdvanced = (email: string): { isValid: boolean; error?: string } => {
  if (!email) return { isValid: false, error: 'Email is required' }
  if (email.length > 254) return { isValid: false, error: 'Email too long' }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) return { isValid: false, error: 'Invalid email format' }
  
  // Check for suspicious patterns
  if (email.includes('<') || email.includes('>')) {
    return { isValid: false, error: 'Invalid characters in email' }
  }
  
  // Check for common disposable email patterns
  const disposablePatterns = ['temp', 'throw', 'fake', '10min']
  const emailDomain = email.split('@')[1]?.toLowerCase()
  if (disposablePatterns.some(pattern => emailDomain?.includes(pattern))) {
    return { isValid: false, error: 'Disposable email addresses not allowed' }
  }
  
  return { isValid: true }
}

// Security monitoring and alerting
export const securityMonitor = {
  // Track suspicious activities
  trackSuspiciousActivity: (activity: string, details: any = {}, severity: 'low' | 'medium' | 'high' = 'medium') => {
    const logData = {
      timestamp: new Date().toISOString(),
      activity,
      severity,
      details,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'server',
      url: typeof window !== 'undefined' ? window.location.href : 'server'
    }
    
    console.warn('[SECURITY ALERT]', logData)
    
    // In production, send to security monitoring service
    if (severity === 'high') {
      // Alert immediately for high severity issues
      console.error('[CRITICAL SECURITY ALERT]', logData)
    }
  },

  // Track failed attempts with pattern detection
  trackFailedAttempt: (type: string, details: any = {}) => {
    const attemptData = {
      timestamp: new Date().toISOString(),
      type,
      details,
      ip: getClientIP(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'server'
    }
    
    console.warn('[FAILED ATTEMPT]', attemptData)
    
    // Check for patterns that might indicate attacks
    const suspiciousPatterns = [
      'rapid_requests',
      'invalid_signatures', 
      'malformed_data',
      'repeated_failures'
    ]
    
    if (suspiciousPatterns.includes(type)) {
      securityMonitor.trackSuspiciousActivity(
        `Potential attack pattern detected: ${type}`,
        attemptData,
        'high'
      )
    }
  }
}

// Content Security Policy helpers
export const generateCSPNonce = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  // Fallback for environments without crypto.randomUUID
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

// Form validation with enhanced security checks
export const validateFormDataAdvanced = (
  data: Record<string, any>, 
  config: SecurityConfig = defaultSecurityConfig
): { isValid: boolean; errors: string[]; sanitizedData: Record<string, any> } => {
  const errors: string[] = []
  const sanitizedData: Record<string, any> = {}

  // Validate and sanitize each field
  Object.entries(data).forEach(([key, value]) => {
    if (typeof value === 'string') {
      // Apply appropriate length limits
      const maxLength = key === 'message' ? config.validation.maxMessageLength : config.validation.maxFieldLength
      sanitizedData[key] = sanitizeInputAdvanced(value, maxLength)
      
      // Check for potential injection attempts
      if (value !== sanitizedData[key]) {
        securityMonitor.trackSuspiciousActivity(
          'Input sanitization triggered',
          { field: key, original: value.slice(0, 50), sanitized: sanitizedData[key].slice(0, 50) }
        )
      }
    } else {
      sanitizedData[key] = value
    }
  })

  // Enhanced email validation
  if (sanitizedData.email) {
    const emailValidation = validateEmailAdvanced(sanitizedData.email)
    if (!emailValidation.isValid) {
      errors.push(emailValidation.error || 'Invalid email')
    }
  }

  // Validate other fields with enhanced checks
  if (sanitizedData.phone && sanitizedData.phone.length > 20) {
    errors.push('Phone number too long')
  }

  if (sanitizedData.name && (sanitizedData.name.length < 2 || sanitizedData.name.length > config.validation.maxFieldLength)) {
    errors.push(`Name must be between 2 and ${config.validation.maxFieldLength} characters`)
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitizedData
  }
}
