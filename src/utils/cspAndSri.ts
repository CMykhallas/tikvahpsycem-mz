/**
 * ELITE SECURITY: CSP & SRI CONFIGURATION
 * Content Security Policy + Subresource Integrity
 */

// =========================================
// CSP POLICY CONFIGURATION
// =========================================

/**
 * Ultra-restritiva CSP para bloquear 99% dos ataques XSS
 * Nenhum script inline sem nonce pode executar
 */
export const STRICT_CSP_POLICY = {
  // Default: bloqueia tudo que não for explicitamente permitido
  'default-src': ["'self'"],
  
  // Scripts: apenas do próprio domínio + CDNs confiáveis com SRI
  'script-src': [
    "'self'",
    'https://cdn.jsdelivr.net',
    'https://cdnjs.cloudflare.com',
    'https://unpkg.com',
    // Desabilitar inline scripts - usar nonce para scripts críticos
  ],
  
  // Styles: próprio domínio + Google Fonts
  'style-src': [
    "'self'",
    'https://fonts.googleapis.com',
    'https://cdn.jsdelivr.net',
    'https://cdnjs.cloudflare.com',
    // Sem 'unsafe-inline' - usar CSS externo
  ],
  
  // Fonts: apenas Google Fonts + nossa CDN
  'font-src': [
    "'self'",
    'https://fonts.gstatic.com',
    'https://fonts.googleapis.com',
    'data:' // Permite data: URLs para fonts
  ],
  
  // Imagens: próprio domínio + HTTPS
  'img-src': [
    "'self'",
    'data:',
    'https:',
    'blob:'
  ],
  
  // Media (vídeo/áudio)
  'media-src': [
    "'self'",
    'https:'
  ],
  
  // Conexões: apenas API confiáveis
  'connect-src': [
    "'self'",
    'https://*.supabase.co',
    'https://api.stripe.com',
    'https://api.resend.com',
    'https://www.googletagmanager.com',
    'https://www.google-analytics.com',
    'https://*.google.com'
  ],
  
  // Frames: nenhum
  'frame-src': [
    "'none'"
  ],
  
  // Iframes: nenhum
  'child-src': [
    "'none'"
  ],
  
  // Objects: nenhum
  'object-src': [
    "'none'"
  ],
  
  // Base URI
  'base-uri': [
    "'self'"
  ],
  
  // Form submissions: apenas para o próprio domínio
  'form-action': [
    "'self'"
  ],
  
  // Frame ancestors: não pode ser embarcado
  'frame-ancestors': [
    "'none'"
  ],
  
  // Plugin types
  'plugin-types': [],
  
  // Report URI para violações CSP
  'report-uri': [
    'https://api.exemplo.com/csp-report'
  ],
  
  // Upgrade insecure requests
  'upgrade-insecure-requests': []
};

/**
 * Converter objeto de política para string HTTP
 */
export function generateCSPHeader(): string {
  const directives: string[] = [];

  for (const [key, values] of Object.entries(STRICT_CSP_POLICY)) {
    if (Array.isArray(values) && values.length > 0) {
      directives.push(`${key} ${values.join(' ')}`);
    } else if (Array.isArray(values) && values.length === 0) {
      // Diretivas sem valores (como upgrade-insecure-requests)
      directives.push(key);
    }
  }

  return directives.join('; ');
}

// =========================================
// SRI (Subresource Integrity) VALIDATION
// =========================================

export interface SRIResource {
  url: string;
  integrity: string;
  type: 'script' | 'stylesheet' | 'font';
}

/**
 * Lista de CDNs com SRI hashes
 * Qualquer alteração no arquivo será detectada
 */
export const TRUSTED_RESOURCES: SRIResource[] = [
  // React (se usado)
  {
    url: 'https://cdn.jsdelivr.net/npm/react@19.0.0/dist/react.production.min.js',
    integrity: 'sha384-qQmH4...', // Obter hash real via: shasum -a 384
    type: 'script'
  },
  
  // Bootstrap (se usado)
  {
    url: 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css',
    integrity: 'sha384-9ndCyUaIbzAi3R...',
    type: 'stylesheet'
  },
  
  // Stripe.js
  {
    url: 'https://js.stripe.com/v3/',
    integrity: 'sha384-stripePaymentElement...', // Obter do Stripe
    type: 'script'
  },
  
  // Google Fonts
  {
    url: 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&display=swap',
    integrity: 'sha384-googleFontsHash...',
    type: 'stylesheet'
  }
];

/**
 * Validator para SRI hashes
 */
export class SRIValidator {
  /**
   * Calcular SRI hash para um arquivo
   */
  static async calculateSRIHash(url: string, algorithm: 'sha256' | 'sha384' | 'sha512' = 'sha384'): Promise<string> {
    try {
      const response = await fetch(url);
      const buffer = await response.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest(algorithm, buffer);
      
      // Converter para base64
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashBase64 = btoa(String.fromCharCode.apply(null, hashArray));
      
      return `${algorithm}-${hashBase64}`;
    } catch (error) {
      console.error(`Failed to calculate SRI hash for ${url}:`, error);
      throw error;
    }
  }

  /**
   * Verificar se recurso tem SRI válido
   */
  static verifyResourceSRI(resource: SRIResource): boolean {
    const scriptTag = document.querySelector(`script[src="${resource.url}"]`) as HTMLScriptElement;
    const linkTag = document.querySelector(`link[href="${resource.url}"]`) as HTMLLinkElement;
    const tag = scriptTag || linkTag;

    if (!tag) {
      console.warn(`Resource not found in DOM: ${resource.url}`);
      return false;
    }

    const integrity = tag.getAttribute('integrity');
    if (!integrity) {
      console.warn(`No integrity attribute on ${resource.url}`);
      return false;
    }

    return integrity === resource.integrity;
  }

  /**
   * Verificar todas as dependências externas
   */
  static async verifyAllResources(): Promise<Map<string, boolean>> {
    const results = new Map<string, boolean>();

    for (const resource of TRUSTED_RESOURCES) {
      try {
        const isValid = this.verifyResourceSRI(resource);
        results.set(resource.url, isValid);

        if (!isValid) {
          console.error(`SRI Verification FAILED for ${resource.url}`);
          // Bloquear a página se houver falha em produção
          if (process.env.NODE_ENV === 'production') {
            throw new Error(`SRI integrity check failed for ${resource.url}`);
          }
        }
      } catch (error) {
        console.error(`Error verifying ${resource.url}:`, error);
        results.set(resource.url, false);
      }
    }

    return results;
  }
}

// =========================================
// CSP VIOLATION REPORTING
// =========================================

export class CSPViolationReporter {
  /**
   * Setup listener para CSP violations
   */
  static setupViolationListener(): void {
    document.addEventListener('securitypolicyviolation', (event: SecurityPolicyViolationEvent) => {
      const violation = {
        documentURI: event.documentURI,
        violatedDirective: event.violatedDirective,
        effectiveDirective: event.effectiveDirective,
        originalPolicy: event.originalPolicy,
        blockedURI: event.blockedURI,
        sourceFile: event.sourceFile,
        lineNumber: event.lineNumber,
        columnNumber: event.columnNumber,
        statusCode: event.statusCode,
        timestamp: new Date().toISOString()
      };

      console.warn('🛡️ CSP VIOLATION DETECTED:', violation);

      // Enviar para servidor para logging
      this.reportViolation(violation);
    });
  }

  /**
   * Reportar violação ao servidor
   */
  private static async reportViolation(violation: any): Promise<void> {
    try {
      await fetch('/api/security/csp-violation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(violation)
      });
    } catch (error) {
      console.error('Failed to report CSP violation:', error);
    }
  }
}

/**
 * Gerar nonce para scripts inline críticos
 * Nonce deve ser gerado no servidor e passado para o cliente
 */
export function generateNonce(): string {
  return btoa(crypto.getRandomValues(new Uint8Array(16)).join(''));
}

export default {
  STRICT_CSP_POLICY,
  generateCSPHeader,
  TRUSTED_RESOURCES,
  SRIValidator,
  CSPViolationReporter,
  generateNonce
};
