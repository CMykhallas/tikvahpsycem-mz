
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-google-ads-signature',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https:; font-src 'self' data:; object-src 'none'; media-src 'self'; frame-src 'none';",
}

// Enhanced rate limiting store
const rateLimitStore = new Map<string, { count: number; resetTime: number; blocked: boolean }>()

function isRateLimited(ip: string, limit: number = 100, windowMs: number = 900000): boolean {
  const now = Date.now()
  const key = ip
  const record = rateLimitStore.get(key)
  
  if (!record || now > record.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs, blocked: false })
    return false
  }
  
  if (record.count >= limit) {
    record.blocked = true
    return true
  }
  
  record.count++
  return false
}

async function verifyWebhookSignature(payload: string, signature: string, secret: string): Promise<boolean> {
  try {
    if (!signature || !secret || !payload) {
      return false
    }

    // Remove "sha256=" prefix if present
    const cleanSignature = signature.replace(/^sha256=/, '')
    
    const encoder = new TextEncoder()
    const keyData = encoder.encode(secret)
    const messageData = encoder.encode(payload)
    
    // Import the key for HMAC-SHA256
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    )
    
    // Generate the signature
    const signatureBuffer = await crypto.subtle.sign('HMAC', cryptoKey, messageData)
    const computedSignature = Array.from(new Uint8Array(signatureBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
    
    // Constant-time comparison to prevent timing attacks
    if (cleanSignature.length !== computedSignature.length) {
      return false
    }
    
    let result = 0
    for (let i = 0; i < cleanSignature.length; i++) {
      result |= cleanSignature.charCodeAt(i) ^ computedSignature.charCodeAt(i)
    }
    
    return result === 0
  } catch (error) {
    console.error('Signature verification error:', error)
    return false
  }
}

function sanitizeInput(input: any): any {
  if (typeof input === 'string') {
    return input
      .replace(/[<>]/g, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+=/gi, '')
      .trim()
      .slice(0, 500)
  }
  return input
}

function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email) && email.length <= 254
}

serve(async (req) => {
  const startTime = Date.now()
  const url = new URL(req.url)
  const method = req.method
  const userAgent = req.headers.get('user-agent') || ''
  const clientIP = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
  
  // Initialize Supabase client
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  // CORS preflight
  if (method === 'OPTIONS') {
    return new Response('ok', { 
      headers: { ...corsHeaders, ...securityHeaders } 
    })
  }

  let responseStatus = 200
  let errorMessage = ''
  let payload: any = null

  try {
    // Enhanced rate limiting with blocking
    if (isRateLimited(clientIP)) {
      responseStatus = 429
      errorMessage = 'Rate limit exceeded'
      
      // Log suspicious activity
      await supabase.from('webhook_logs').insert({
        endpoint: url.pathname,
        method: method,
        headers: { 'x-forwarded-for': clientIP },
        payload: null,
        response_status: 429,
        processing_time_ms: Date.now() - startTime,
        error_message: 'Rate limit exceeded',
        ip_address: clientIP,
        user_agent: userAgent
      })
      
      throw new Error(errorMessage)
    }

    // Only allow POST requests
    if (method !== 'POST') {
      responseStatus = 405
      errorMessage = 'Method not allowed'
      throw new Error(errorMessage)
    }

    // Parse and validate payload
    const body = await req.text()
    if (!body) {
      responseStatus = 400
      errorMessage = 'Empty payload'
      throw new Error(errorMessage)
    }

    try {
      payload = JSON.parse(body)
    } catch {
      responseStatus = 400
      errorMessage = 'Invalid JSON payload'
      throw new Error(errorMessage)
    }

    // Enhanced webhook signature verification
    const signature = req.headers.get('x-google-ads-signature') || ''
    const webhookSecret = Deno.env.get('GOOGLE_ADS_WEBHOOK_SECRET') || ''
    
    const isValidSignature = await verifyWebhookSignature(body, signature, webhookSecret)
    if (!isValidSignature) {
      responseStatus = 401
      errorMessage = 'Invalid webhook signature'
      
      // Log potential security breach
      await supabase.from('webhook_logs').insert({
        endpoint: url.pathname,
        method: method,
        headers: Object.fromEntries(req.headers.entries()),
        payload: payload,
        response_status: 401,
        processing_time_ms: Date.now() - startTime,
        error_message: 'Invalid signature - potential security breach',
        ip_address: clientIP,
        user_agent: userAgent
      })
      
      throw new Error(errorMessage)
    }

    // Sanitize and validate lead data
    const leadData = {
      email: sanitizeInput(payload.email || ''),
      name: sanitizeInput(payload.name) || null,
      phone: sanitizeInput(payload.phone) || null,
      campaign_id: sanitizeInput(payload.campaign_id) || null,
      ad_group_id: sanitizeInput(payload.ad_group_id) || null,
      keyword: sanitizeInput(payload.keyword) || null,
      source: 'google_ads',
      status: 'new',
      metadata: payload.metadata || {}
    }

    // Enhanced validation
    if (!leadData.email || !validateEmail(leadData.email)) {
      responseStatus = 400
      errorMessage = 'Valid email is required'
      throw new Error(errorMessage)
    }

    // Additional validation for suspicious patterns
    if (leadData.name && leadData.name.length > 100) {
      responseStatus = 400
      errorMessage = 'Name too long'
      throw new Error(errorMessage)
    }

    // Insert lead into database with error handling
    const { error: insertError } = await supabase
      .from('leads')
      .insert(leadData)

    if (insertError) {
      console.error('Database insertion error:', insertError.message)
      responseStatus = 500
      errorMessage = 'Failed to save lead data'
      throw new Error(errorMessage)
    }

    // Return success response
    return new Response(
      JSON.stringify({ success: true, message: 'Lead processed successfully' }),
      {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
          ...securityHeaders
        },
        status: responseStatus
      }
    )

  } catch (error) {
    console.error('Webhook error:', error)
    
    if (!responseStatus || responseStatus === 200) {
      responseStatus = 500
      errorMessage = 'Internal server error'
    }

    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Processing failed',
        timestamp: new Date().toISOString()
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
          ...securityHeaders
        },
        status: responseStatus
      }
    )

  } finally {
    // Enhanced logging with security context
    const processingTime = Date.now() - startTime
    
    try {
      await supabase.from('webhook_logs').insert({
        endpoint: url.pathname,
        method: method,
        headers: Object.fromEntries(req.headers.entries()),
        payload: payload,
        response_status: responseStatus,
        processing_time_ms: processingTime,
        error_message: errorMessage || null,
        ip_address: clientIP,
        user_agent: userAgent
      })
    } catch (logError) {
      console.error('Failed to log webhook request:', logError)
    }
  }
})
