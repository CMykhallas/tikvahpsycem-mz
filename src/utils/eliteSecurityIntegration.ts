/**
 * ELITE SECURITY - INTEGRATION MODULE
 * One-stop configuration para ativar todas as camadas de segurança
 */

import { headerObfuscationMiddleware, errorMaskingMiddleware } from './headerObfuscation';
import { CSPViolationReporter, generateCSPHeader } from './cspAndSri';
import { DeviceTrackingManager } from './deviceFingerprinting';
import { WebAuthnService } from './webauthnService';
import { IncidentResponseEngine, ThreatLevel } from './incidentResponseEngine';

// =========================================
// SECURITY INITIALIZATION
// =========================================

export class EliteSecuritySystem {
  /**
   * Inicializar todas as camadas de segurança na aplicação
   */
  static initializeAllLayers(): void {
    console.log('🛡️ Initializing ELITE Security System...');

    // 1. Setup CSP
    this.setupCSP();

    // 2. Setup device tracking
    this.setupDeviceTracking();

    // 3. Setup threat detection
    this.setupThreatDetection();

    // 4. Setup WebAuthn for admin users
    this.setupWebAuthn();

    // 5. Setup incident response
    this.setupIncidentResponse();

    console.log('✅ ELITE Security System initialized successfully');
  }

  /**
   * 1. Content Security Policy
   */
  private static setupCSP(): void {
    console.log('📋 Setting up Content Security Policy...');

    // Obter CSP header
    const cspHeader = generateCSPHeader();
    console.log('CSP Header configured:', cspHeader.substring(0, 50) + '...');

    // Setup violation reporting
    CSPViolationReporter.setupViolationListener();
    console.log('✅ CSP violation reporting enabled');
  }

  /**
   * 2. Device Fingerprinting & Tracking
   */
  private static async setupDeviceTracking(): Promise<void> {
    console.log('📱 Setting up device fingerprinting...');

    try {
      const deviceId = await DeviceTrackingManager.getOrCreateDeviceId();
      console.log('✅ Device ID generated:', deviceId.substring(0, 20) + '...');

      // Reportar fingerprint periodicamente
      setInterval(() => {
        DeviceTrackingManager.reportFingerprint();
      }, 60000); // A cada minuto

      console.log('✅ Device tracking initialized');
    } catch (error) {
      console.warn('⚠️ Device tracking setup failed:', error);
    }
  }

  /**
   * 3. Threat Detection Setup
   */
  private static setupThreatDetection(): void {
    console.log('🎯 Setting up threat detection...');

    // Monitor CSP violations (potential XSS)
    document.addEventListener('securitypolicyviolation', async (event: SecurityPolicyViolationEvent) => {
      console.warn('⚠️ CSP Violation detected:', event.violatedDirective);

      // Avaliar nível de ameaça
      const threatLevel = this.evaluateThreatLevel('CSP_VIOLATION', {
        directive: event.violatedDirective,
        blockedURI: event.blockedURI
      });

      if (threatLevel !== ThreatLevel.LOW) {
        await this.handleThreat(threatLevel, 'CSP_VIOLATION');
      }
    });

    console.log('✅ Threat detection initialized');
  }

  /**
   * 4. WebAuthn Setup
   */
  private static setupWebAuthn(): void {
    console.log('🔐 Setting up WebAuthn/FIDO2...');

    // Verificar suporte
    if (WebAuthnService.isWebAuthnSupported()) {
      console.log('✅ WebAuthn is supported on this browser');
    } else {
      console.warn('⚠️ WebAuthn is NOT supported on this browser');
    }
  }

  /**
   * 5. Incident Response Setup
   */
  private static setupIncidentResponse(): void {
    console.log('⚡ Setting up incident response...');

    // Setup global error handler
    window.addEventListener('error', async (event: ErrorEvent) => {
      // Detectar se é tentativa de exploit
      if (this.isExploitAttempt(event.error)) {
        await this.handleThreat(ThreatLevel.HIGH, 'EXPLOIT_ATTEMPT', {
          error: event.error.message
        });
      }
    });

    console.log('✅ Incident response initialized');
  }

  /**
   * Avaliar nível de ameaça
   */
  private static evaluateThreatLevel(
    eventType: string,
    context: Record<string, any>
  ): ThreatLevel {
    // Lógica simples de scoring
    let score = 0;

    // CSP violations são médias por padrão
    if (eventType === 'CSP_VIOLATION') {
      score += 50;
    }

    // Se for bloqueado de domínio externo suspeito
    if (context.blockedURI && !this.isTrustedDomain(context.blockedURI)) {
      score += 30;
    }

    // Converter score para ThreatLevel
    if (score >= 80) return ThreatLevel.CRITICAL;
    if (score >= 60) return ThreatLevel.HIGH;
    if (score >= 30) return ThreatLevel.MEDIUM;
    return ThreatLevel.LOW;
  }

  /**
   * Detectar tentativas de exploit
   */
  private static isExploitAttempt(error: Error): boolean {
    const message = error.message || '';

    // Padrões comuns de exploit
    const exploitPatterns = [
      /script.*src/i,
      /eval\(/i,
      /function\(\)/i,
      /alert\(/i,
      /prompt\(/i,
      /\.innerHTML\s*=/i,
      /\.innerHTML\s*\+=/i,
      /document\.write/i
    ];

    return exploitPatterns.some(pattern => pattern.test(message));
  }

  /**
   * Verificar se domínio é confiável
   */
  private static isTrustedDomain(uri: string): boolean {
    const trustedDomains = [
      'cdn.jsdelivr.net',
      'cdnjs.cloudflare.com',
      'fonts.googleapis.com',
      'fonts.gstatic.com',
      'js.stripe.com',
      'api.resend.com',
      'supabase.co'
    ];

    return trustedDomains.some(domain => uri.includes(domain));
  }

  /**
   * Lidar com ameaça detectada
   */
  private static async handleThreat(
    threatLevel: ThreatLevel,
    threatType: string,
    context?: Record<string, any>
  ): Promise<void> {
    console.warn(`⚠️ THREAT DETECTED [${threatLevel}]:`, threatType);

    // Obter IP do cliente (ao reportar)
    const ip = await this.getClientIP();

    // Chamar incident response engine
    const response = await IncidentResponseEngine.respondToThreat(
      threatLevel,
      ip,
      undefined,
      { threatType, ...context }
    );

    console.log('📋 Incident response:', response);
  }

  /**
   * Obter IP do cliente
   */
  private static async getClientIP(): Promise<string> {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const { ip } = await response.json();
      return ip;
    } catch {
      return 'unknown';
    }
  }
}

// =========================================
// EXPRESS/FASTIFY MIDDLEWARE
// =========================================

/**
 * Middleware para Express.js
 */
export const eliteSecurityMiddleware = [
  headerObfuscationMiddleware,
  errorMaskingMiddleware,
  (req: any, res: any, next: any) => {
    // Adicionar CSP header
    const cspHeader = generateCSPHeader();
    res.setHeader('Content-Security-Policy', cspHeader);
    next();
  }
];

/**
 * Middleware para Fastify
 */
export const eliteSecurityFastifyPlugin = async (fastify: any, options: any) => {
  // Register all security headers
  fastify.register(require('@fastify/helmet'));

  // Custom CSP
  fastify.addHook('onSend', async (request: any, reply: any) => {
    const cspHeader = generateCSPHeader();
    reply.header('Content-Security-Policy', cspHeader);
  });
};

// =========================================
// VITE INTEGRATION
// =========================================

/**
 * Plugin Vite para injetar segurança
 */
export const viteEliteSecurityPlugin = {
  name: 'vite-elite-security',
  
  apply: 'serve' as const,

  async transformIndexHtml(html: string) {
    // Adicionar CSP meta tag
    const cspMeta = `<meta http-equiv="Content-Security-Policy" content="${generateCSPHeader()}">`;

    // Adicionar script de inicialização de segurança
    const securityScript = `
      <script>
        window.EliteSecuritySystem = window.EliteSecuritySystem || {};
        document.addEventListener('DOMContentLoaded', () => {
          import('/@/utils/eliteSecurityIntegration').then(mod => {
            mod.EliteSecuritySystem.initializeAllLayers();
          });
        });
      </script>
    `;

    // Injetar no <head>
    return html
      .replace('</head>', `${cspMeta}${securityScript}</head>`);
  }
};

// =========================================
// EXPORT
// =========================================

export default {
  EliteSecuritySystem,
  eliteSecurityMiddleware,
  eliteSecurityFastifyPlugin,
  viteEliteSecurityPlugin
};

/**
 * USAGE:
 * 
 * // 1. No main.tsx
 * import { EliteSecuritySystem } from '@/utils/eliteSecurityIntegration';
 * EliteSecuritySystem.initializeAllLayers();
 * 
 * // 2. No Express
 * import { eliteSecurityMiddleware } from '@/utils/eliteSecurityIntegration';
 * app.use(...eliteSecurityMiddleware);
 * 
 * // 3. No vite.config.ts
 * import { viteEliteSecurityPlugin } from '@/utils/eliteSecurityIntegration';
 * export default {
 *   plugins: [viteEliteSecurityPlugin, ...]
 * }
 */
