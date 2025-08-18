
// Security utilities for the application
export const sanitizeInput = (input: string): string => {
  return input
    .replace(/[<>]/g, '') // Remove potential script tags
    .trim()
    .slice(0, 1000) // Limit length
}

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email) && email.length <= 254
}

export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^\+?[\d\s\-\(\)]{7,20}$/
  return phoneRegex.test(phone)
}

export const generateCSRFToken = (): string => {
  return crypto.randomUUID()
}

export const isValidURL = (url: string): boolean => {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

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
