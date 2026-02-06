/**
 * TIKVAH PSYCHOLOGICAL CENTER - EDGE GATEWAY
 * Contact Form Integration Service (Production Grade)
 * * Versão: 2.1.0
 * Stack: Deno, Supabase, Resend
 */

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "npm:@supabase/supabase-js@2";

// --- CONFIGURAÇÕES GLOBAIS ---
const CONFIG = {
  EMAIL_SENDER: "Tikvah Psycem <onboarding@resend.dev>",
  ADMIN_RECIPIENT: "suporte.oficina.psicologo@proton.me",
  RATE_LIMIT_MAX: 5,           // Submissões por hora
  RATE_LIMIT_WINDOW: 3600000,  // 1 hora em ms
  MIN_SUBMISSION_TIME: 3000,   // 3 segundos (anti-bot)
  MAX_SUBMISSION_TIME: 86400000, // 24 horas
  MAX_PAYLOAD_SIZE: 15360,     // 15KB
  MAX_FIELD_LENGTHS: {
    name: 120,
    subject: 200,
    message: 3000,
    phone: 30,
    email: 255
  }
};

const SPAM_KEYWORDS = [
  "crypto", "viagra", "casino", "free money", "lottery", "pills", 
  "poker", "betting", "investing", "bitcoin", "weight loss"
];

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-submission-token",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
};

// --- INTERFACES ---
interface RequestPayload {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  website_url?: string; // Honeypot
  submission_token?: string; // Timestamp Base64
}

interface SecurityLog {
  ip_address: string;
  event_type: "SPAM_ATTEMPT" | "RATE_LIMIT_EXCEEDED" | "SUCCESSFUL_SUBMISSION" | "SYSTEM_ERROR";
  severity: "info" | "warning" | "critical";
  details: Record<string, unknown>;
}

// --- UTILITÁRIOS DE SEGURANÇA E HIGIENE ---

/**
 * Escapa caracteres para prevenir injeção de HTML/Scripts nos e-mails
 */
function escapeHTML(str: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return str.replace(/[&<>"']/g, (m) => map[m]);
}

/**
 * Sanitiza strings removendo tags e limitando tamanho
 */
function sanitizeInput(str: string, maxLength: number): string {
  if (!str || typeof str !== 'string') return "";
  return str
    .trim()
    .replace(/<[^>]*>?/gm, '') // Remove HTML tags
    .slice(0, maxLength);
}

/**
 * Validação robusta de formato de e-mail
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return emailRegex.test(email) && email.length <= CONFIG.MAX_FIELD_LENGTHS.email;
}

/**
 * Gera logs estruturados para o console do Deno
 */
function structuredLog(level: 'INFO' | 'WARN' | 'ERROR', message: string, data?: any) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [${level}] ${message}`, data ? JSON.stringify(data) : "");
}

// --- HANDLERS PRINCIPAIS ---

serve(async (req: Request) => {
  // 1. Manuseio de Preflight (CORS)
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  // 2. Inicialização de Clientes
  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const resendApiKey = Deno.env.get("RESEND_API_KEY") ?? "";

  const supabase = createClient(supabaseUrl, supabaseKey);
  const resend = new Resend(resendApiKey);

  // Identificação do IP do cliente (considerando proxies do Supabase)
  const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";

  try {
    structuredLog('INFO', 'Nova requisição de contato recebida', { ip: clientIp });

    // 3. Verificações de Cabeçalho e Tamanho
    const contentType = req.headers.get("content-type");
    if (!contentType?.includes("application/json")) {
      throw { status: 415, message: "Tipo de conteúdo não suportado. Use JSON." };
    }

    const contentLength = parseInt(req.headers.get("content-length") || "0");
    if (contentLength > CONFIG.MAX_PAYLOAD_SIZE) {
      throw { status: 413, message: "Corpo da requisição excede o limite permitido." };
    }

    // 4. Parsing e Validação de Estrutura
    const body: RequestPayload = await req.json();
    const { 
      name, email, phone, subject, message, 
      website_url, submission_token 
    } = body;

    // 5. CAMADA DE SEGURANÇA 1: Honeypot
    if (website_url) {
      structuredLog('WARN', 'Honeypot ativado. Bot detectado.', { ip: clientIp });
      await supabase.from("security_incidents").insert({
        ip_address: clientIp,
        event_type: "SPAM_ATTEMPT",
        severity: "warning",
        details: { reason: "Honeypot field filled", email }
      });
      return new Response(JSON.stringify({ error: "Spam block activated" }), { status: 403, headers: CORS_HEADERS });
    }

    // 6. CAMADA DE SEGURANÇA 2: Validação de Tempo (Token)
    if (!submission_token) {
      throw { status: 400, message: "Token de segurança ausente." };
    }
    
    try {
      const decodedToken = atob(submission_token);
      const startTime = parseInt(decodedToken);
      const currentTime = Date.now();
      const elapsed = currentTime - startTime;

      if (elapsed < CONFIG.MIN_SUBMISSION_TIME) {
        structuredLog('WARN', 'Submissão rápida demais (Bot)', { elapsed, ip: clientIp });
        return new Response(JSON.stringify({ error: "Submission too fast" }), { status: 403, headers: CORS_HEADERS });
      }
      
      if (elapsed > CONFIG.MAX_SUBMISSION_TIME) {
        throw new Error("Token expirado");
      }
    } catch (e) {
      throw { status: 400, message: "Token de segurança inválido ou expirado." };
    }

    // 7. CAMADA DE SEGURANÇA 3: Rate Limiting Persistente
    const { count, error: countError } = await supabase
      .from("contact_submissions")
      .select("*", { count: 'exact', head: true })
      .eq("ip_address", clientIp)
      .gt("created_at", new Date(Date.now() - CONFIG.RATE_LIMIT_WINDOW).toISOString());

    if (countError) structuredLog('ERROR', 'Erro ao verificar Rate Limit', countError);

    if (count && count >= CONFIG.RATE_LIMIT_MAX) {
      structuredLog('WARN', 'Limite de taxa excedido', { ip: clientIp });
      return new Response(JSON.stringify({ 
        error: "Muitas mensagens enviadas. Por favor, tente novamente em 1 hora." 
      }), { status: 429, headers: CORS_HEADERS });
    }

    // 8. CAMADA DE SEGURANÇA 4: Filtro de Conteúdo (Keyword Scanner)
    const fullText = `${subject} ${message} ${name}`.toLowerCase();
    const containsSpam = SPAM_KEYWORDS.some(word => fullText.includes(word));
    
    if (containsSpam) {
      structuredLog('WARN', 'Palavra de spam detectada', { ip: clientIp });
      await supabase.from("security_incidents").insert({
        ip_address: clientIp,
        event_type: "SPAM_ATTEMPT",
        severity: "info",
        details: { reason: "Keyword blacklist match", content: fullText.slice(0, 100) }
      });
      return new Response(JSON.stringify({ error: "Your message was flagged as spam." }), { status: 400, headers: CORS_HEADERS });
    }

    // 9. Higienização Final dos Dados
    if (!name || !email || !subject || !message) {
      throw { status: 400, message: "Campos obrigatórios ausentes." };
    }

    if (!isValidEmail(email)) {
      throw { status: 400, message: "Endereço de e-mail inválido." };
    }

    const cleanName = sanitizeInput(name, CONFIG.MAX_FIELD_LENGTHS.name);
    const cleanEmail = email.toLowerCase().trim();
    const cleanSubject = sanitizeInput(subject, CONFIG.MAX_FIELD_LENGTHS.subject);
    const cleanMessage = sanitizeInput(message, CONFIG.MAX_FIELD_LENGTHS.message);
    const cleanPhone = sanitizeInput(phone || "N/A", CONFIG.MAX_FIELD_LENGTHS.phone);

    // Preparação de dados seguros para o Template HTML
    const safeName = escapeHTML(cleanName);
    const safeSubject = escapeHTML(cleanSubject);
    const safePhone = escapeHTML(cleanPhone);
    const safeMessageHtml = escapeHTML(cleanMessage).replace(/\n/g, '<br>');

    // 10. Execução de Serviços Externos (E-mail e Banco)
    structuredLog('INFO', 'Processando envio de e-mails...', { to: cleanEmail });

    const emailPromises = [
      // E-mail para o Administrador
      resend.emails.send({
        from: CONFIG.EMAIL_SENDER,
        to: [CONFIG.ADMIN_RECIPIENT],
        subject: `[TIKVAH] Novo Contato: ${safeSubject}`,
        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="background-color: #f4f7f6; padding: 20px; border-bottom: 3px solid #005a87;">
              <h2 style="color: #005a87; margin: 0;">Nova solicitação de contato</h2>
            </div>
            <div style="padding: 20px; border: 1px solid #ddd; border-top: none;">
              <p><strong>Nome:</strong> ${safeName}</p>
              <p><strong>E-mail:</strong> <a href="mailto:${cleanEmail}">${cleanEmail}</a></p>
              <p><strong>Telefone:</strong> ${safePhone}</p>
              <p><strong>Assunto:</strong> ${safeSubject}</p>
              <div style="margin-top: 20px; padding: 15px; background: #fff9e6; border-left: 5px solid #ffcc00;">
                <h4 style="margin-top: 0;">Mensagem:</h4>
                ${safeMessageHtml}
              </div>
              <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
              <small style="color: #888;">Enviado via Tikvah Gateway | IP: ${clientIp}</small>
            </div>
          </div>
        `
      }),
      // E-mail de Confirmação para o Usuário
      resend.emails.send({
        from: CONFIG.EMAIL_SENDER,
        to: [cleanEmail],
        subject: 'Recebemos sua mensagem | Tikvah Psychological Center',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
            <h2 style="color: #005a87;">Olá, ${safeName}!</h2>
            <p>Obrigado por entrar em contato com o <strong>Tikvah Psychological Center</strong>.</p>
            <p>Informamos que sua mensagem sobre <em>"${safeSubject}"</em> foi recebida com sucesso por nossa equipe de suporte.</p>
            <div style="padding: 15px; border-radius: 8px; background: #f9f9f9; border: 1px solid #ededed;">
              <p style="margin: 0; color: #666;">Responderemos ao seu e-mail em um prazo máximo de 24 horas úteis.</p>
            </div>
            <p>Atenciosamente,<br><strong>Equipe Tikvah</strong></p>
            <footer style="margin-top: 30px; font-size: 11px; color: #999; border-top: 1px solid #eee; padding-top: 10px;">
              Avenida 24 de Julho, Nº 797, 1º Andar, Maputo, Moçambique.
            </footer>
          </div>
        `
      })
    ];

    // Executa envios e auditoria em paralelo para máxima performance
    const results = await Promise.allSettled([
      ...emailPromises,
      supabase.from("contact_submissions").insert({
        name: cleanName,
        email: cleanEmail,
        phone: cleanPhone,
        subject: cleanSubject,
        message: cleanMessage,
        ip_address: clientIp,
        user_agent: req.headers.get("user-agent") || "unknown"
      })
    ]);

    // Verifica se houve falha crítica nos envios
    const emailFailures = results.filter(r => r.status === 'rejected');
    if (emailFailures.length > 0) {
      structuredLog('ERROR', 'Falha parcial no envio de e-mails', emailFailures);
    }

    // 11. Resposta Final de Sucesso
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Mensagem enviada com sucesso!",
        ref: crypto.randomUUID().slice(0, 8)
      }), 
      { status: 200, headers: CORS_HEADERS }
    );

  } catch (error: any) {
    // 12. Tratamento de Erros Centralizado
    const statusCode = error.status || 500;
    const errorMessage = error.message || "Erro interno no processamento.";

    structuredLog('ERROR', `Erro capturado: ${errorMessage}`, { 
      status: statusCode, 
      stack: error.stack 
    });

    // Tenta registrar o erro no banco para auditoria futura
    await supabase.from("security_incidents").insert({
      ip_address: clientIp,
      event_type: "SYSTEM_ERROR",
      severity: "critical",
      details: { error: errorMessage, status: statusCode }
    }).catch(() => {});

    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        code: statusCode === 500 ? "INTERNAL_SERVER_ERROR" : "VALIDATION_ERROR"
      }), 
      { status: statusCode, headers: CORS_HEADERS }
    );
  }
});

/**
 * DATABASE SCHEMA REQUIREMENT (SQL):
 * * CREATE TABLE contact_submissions (
 * id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
 * created_at TIMESTAMPTZ DEFAULT now(),
 * name TEXT,
 * email TEXT,
 * phone TEXT,
 * subject TEXT,
 * message TEXT,
 * ip_address TEXT,
 * user_agent TEXT
 * );
 * * CREATE TABLE security_incidents (
 * id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
 * created_at TIMESTAMPTZ DEFAULT now(),
 * ip_address TEXT,
 * event_type TEXT,
 * severity TEXT,
 * details JSONB
 * );
 */