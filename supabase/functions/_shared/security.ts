// =========================================
// ENTERPRISE-GRADE SECURITY UTILITIES
// =========================================

// FINAL FIX: Using the npm: specifier for Deno/Supabase Edge Runtime compatibility
import { createClient, SupabaseClient } from 'npm:@supabase/supabase-js@2';

// =========================================
// TYPES & INTERFACES
// =========================================

export interface SecurityIncident {
  incident_type: 'PRICE_TAMPERING' | 'RATE_LIMIT' | 'VALIDATION_FAILURE' | 'XSS_ATTEMPT' | 'SQL_INJECTION' | 'SUSPICIOUS_PATTERN';
  severity: 'low' | 'medium' | 'high' | 'critical';
  ip_address: string;
  user_agent?: string;
  user_id?: string;
  endpoint: string;
  details: Record<string, any>;
}

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  blockDurationMs: number;
}

export interface PriceValidationResult {
  isValid: boolean;
  expectedTotal: number;
  actualTotal: number;
  discrepancy: number;
  tamperedProducts?: string[];
  validatedProducts?: Array<{
    id: string;
    price_after_discount: number;
    quantity: number;
    name: string;
  }>;
}

// =========================================
// SECURITY LOGGER
// =========================================

export class SecurityLogger {
  constructor(private supabase: SupabaseClient) {}

  async logIncident(incident: SecurityIncident): Promise<void> {
    try {
      await this.supabase.from('security_incidents').insert({
        ...incident,
        created_at: new Date().toISOString()
      });
      if (incident.severity === 'critical') {
        console.error(`🚨 CRITICAL: ${incident.incident_type} from ${incident.ip_address}`);
      }
    } catch (error) {
      console.error('[SECURITY LOGGER EXCEPTION]', error);
    }
  }
}

// =========================================
// ADVANCED RATE LIMITER
// =========================================

export class AdvancedRateLimiter {
  private readonly configs: Record<string, RateLimitConfig> = {
    'create-order': { windowMs: 900000, maxRequests: 5, blockDurationMs: 3600000 },
    'process-payment': { windowMs: 300000, maxRequests: 5, blockDurationMs: 1800000 }
  };

  constructor(private supabase: SupabaseClient, private logger: SecurityLogger) {}

  async checkRateLimit(ip: string, endpoint: string, userId?: string): Promise<{ allowed: boolean; retryAfter?: number }> {
    try {
      const key = userId ? `${endpoint}:u:${userId}` : `${endpoint}:ip:${ip}`;
      const config = this.configs[endpoint] || { windowMs: 60000, maxRequests: 10, blockDurationMs: 60000 };

      const { data: rateLimit } = await this.supabase.from('rate_limits').select('*').eq('key', key).maybeSingle();
      const now = Date.now();
      
      if (rateLimit?.blocked_until && now < new Date(rateLimit.blocked_until).getTime()) {
        return { allowed: false, retryAfter: Math.ceil((new Date(rateLimit.blocked_until).getTime() - now) / 1000) };
      }
      
      if (!rateLimit || now > new Date(rateLimit.reset_time).getTime()) {
        await this.supabase.from('rate_limits').upsert({
          key, count: 1, reset_time: new Date(now + config.windowMs).toISOString()
        });
        return { allowed: true };
      }
      
      const newCount = rateLimit.count + 1;
      if (newCount > config.maxRequests) {
        const blockedUntil = new Date(now + config.blockDurationMs).toISOString();
        await this.supabase.from('rate_limits').update({ count: newCount, blocked_until: blockedUntil }).eq('key', key);
        return { allowed: false, retryAfter: Math.ceil(config.blockDurationMs / 1000) };
      }
      
      await this.supabase.from('rate_limits').update({ count: newCount }).eq('key', key);
      return { allowed: true };
    } catch {
      return { allowed: true }; // Fail-open
    }
  }
}

// =========================================
// PRICE VALIDATOR
// =========================================

export class PriceValidator {
  private readonly TOLERANCE = 0.01;
  constructor(private supabase: SupabaseClient, private logger: SecurityLogger) {}

  async validateOrder(clientProducts: any[], ip: string, endpoint: string): Promise<PriceValidationResult> {
    const { data: dbProducts } = await this.supabase
      .from('products')
      .select('id, name, price_after_discount, active')
      .in('id', clientProducts.map(p => p.id));

    if (!dbProducts) throw new Error('Validation Error');

    const dbMap = new Map(dbProducts.map(p => [p.id, p]));
    const tampered: string[] = [];
    const validated: any[] = [];

    for (const cp of clientProducts) {
      const dbp = dbMap.get(cp.id);
      if (!dbp || !dbp.active || Math.abs(dbp.price_after_discount - cp.price_after_discount) > this.TOLERANCE) {
        tampered.push(cp.id);
      } else {
        validated.push({ ...dbp, quantity: cp.quantity });
      }
    }

    const expectedTotal = validated.reduce((s, p) => s + (p.price_after_discount * p.quantity), 0);
    const actualTotal = clientProducts.reduce((s, p) => s + (p.price_after_discount * p.quantity), 0);
    const isValid = tampered.length === 0 && Math.abs(expectedTotal - actualTotal) <= this.TOLERANCE;

    if (!isValid) {
      await this.logger.logIncident({
        incident_type: 'PRICE_TAMPERING', severity: 'critical', ip_address: ip, endpoint,
        details: { tampered, expectedTotal, actualTotal }
      });
    }

    return { isValid, expectedTotal, actualTotal, discrepancy: Math.abs(expectedTotal - actualTotal), tamperedProducts: tampered, validatedProducts: validated };
  }
}

// =========================================
// SECURITY MIDDLEWARE
// =========================================

export async function securityMiddleware(req: Request, endpoint: string, supabase: SupabaseClient): Promise<Response | null> {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown';
  const ua = req.headers.get('user-agent') || '';
  const logger = new SecurityLogger(supabase);

  if (ua.length < 10 || /bot|crawler|spider/i.test(ua)) {
    return new Response(JSON.stringify({ error: 'Access Denied' }), { status: 403 });
  }

  const limiter = new AdvancedRateLimiter(supabase, logger);
  const check = await limiter.checkRateLimit(ip, endpoint);
  
  if (!check.allowed) {
    return new Response(JSON.stringify({ error: 'Rate limit exceeded', retryAfter: check.retryAfter }), { status: 429 });
  }

  return null;
}
