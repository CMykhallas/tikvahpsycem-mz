
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

// Rate limiting store (in production, use Redis or similar)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

function isRateLimited(ip: string, limit: number = 100, windowMs: number = 900000): boolean {
  const now = Date.now()
  const key = ip
  const record = rateLimitStore.get(key)
  
  if (!record || now > record.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs })
    return false
  }
  
  if (record.count >= limit) {
    return true
  }
  
  record.count++
  return false
}

function verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
  try {
    const encoder = new TextEncoder()
    const keyData = encoder.encode(secret)
    const messageData = encoder.encode(payload)
    
    // This is a simplified signature verification
    // In production, implement proper HMAC-SHA256 verification
    return signature.length > 0 && secret.length > 0
  } catch (error) {
    console.error('Signature verification error:', error)
    return false
  }
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
    // Rate limiting
    if (isRateLimited(clientIP)) {
      responseStatus = 429
      errorMessage = 'Rate limit exceeded'
      throw new Error(errorMessage)
    }

    // Only allow POST requests
    if (method !== 'POST') {
      responseStatus = 405
      errorMessage = 'Method not allowed'
      throw new Error(errorMessage)
    }

    // Parse payload
    const body = await req.text()
    payload = body ? JSON.parse(body) : {}

    // Verify webhook signature
    const signature = req.headers.get('x-google-ads-signature') || ''
    const webhookSecret = Deno.env.get('GOOGLE_ADS_WEBHOOK_SECRET') || ''
    
    if (!verifyWebhookSignature(body, signature, webhookSecret)) {
      responseStatus = 401
      errorMessage = 'Invalid webhook signature'
      throw new Error(errorMessage)
    }

    // Process the lead data
    const leadData = {
      email: payload.email || '',
      name: payload.name || null,
      phone: payload.phone || null,
      campaign_id: payload.campaign_id || null,
      ad_group_id: payload.ad_group_id || null,
      keyword: payload.keyword || null,
      source: 'google_ads',
      status: 'new',
      metadata: payload.metadata || {}
    }

    // Validate required fields
    if (!leadData.email) {
      responseStatus = 400
      errorMessage = 'Email is required'
      throw new Error(errorMessage)
    }

    // Insert lead into database
    const { error: insertError } = await supabase
      .from('leads')
      .insert(leadData)

    if (insertError) {
      responseStatus = 500
      errorMessage = `Database error: ${insertError.message}`
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
      errorMessage = error.message || 'Internal server error'
    }

    return new Response(
      JSON.stringify({ 
        success: false, 
        error: errorMessage,
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
    // Log webhook request
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
