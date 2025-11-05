
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Input validation and sanitization
const MAX_PAYLOAD_SIZE = 10240; // 10KB

function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 255;
}

function sanitizeString(str: string, maxLength: number): string {
  if (!str || typeof str !== 'string') return '';
  return str
    .trim()
    .slice(0, maxLength)
    .replace(/[<>]/g, '') // Remove potential HTML injection characters
    .replace(/[\r\n]+/g, '\n'); // Normalize line breaks
}

function validateContactData(data: any): { valid: boolean; error?: string } {
  if (!data || typeof data !== 'object') {
    return { valid: false, error: 'Invalid request payload' };
  }

  const { name, email, subject, message } = data;

  if (!name || !email || !subject || !message) {
    return { valid: false, error: 'Missing required fields' };
  }

  if (!validateEmail(email)) {
    return { valid: false, error: 'Invalid email address' };
  }

  if (name.length > 100 || subject.length > 200 || message.length > 2000) {
    return { valid: false, error: 'Input exceeds maximum length' };
  }

  return { valid: true };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Validate content type
    const contentType = req.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return new Response(
        JSON.stringify({ error: 'Content-Type must be application/json' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Check payload size
    const contentLength = req.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > MAX_PAYLOAD_SIZE) {
      return new Response(
        JSON.stringify({ error: 'Payload too large' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 413 }
      );
    }

    const rawData = await req.json();

    // Validate input data
    const validation = validateContactData(rawData);
    if (!validation.valid) {
      console.error('Validation failed:', validation.error);
      return new Response(
        JSON.stringify({ error: validation.error }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Sanitize all inputs
    const name = sanitizeString(rawData.name, 100);
    const email = rawData.email.trim().toLowerCase();
    const phone = rawData.phone ? sanitizeString(rawData.phone, 20) : 'Não informado';
    const subject = sanitizeString(rawData.subject, 200);
    const message = sanitizeString(rawData.message, 2000);

    console.log('Enviando email de contato:', { name, email, subject });

    // Send notification email to admin
    const adminEmailResponse = await resend.emails.send({
      from: 'Tikvah Psycem <onboarding@resend.dev>',
      to: ['suporte.oficina.psicologo@proton.me'], // Admin email
      subject: `Nova mensagem de contato: ${subject}`,
      html: `
        <h2>Nova mensagem de contato recebida</h2>
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Nome:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Telefone:</strong> ${phone}</p>
          <p><strong>Assunto:</strong> ${subject}</p>
        </div>
        <h3>Mensagem:</h3>
        <div style="background: #fff; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
          ${message.replace(/\n/g, '<br>')}
        </div>
        <p style="color: #666; font-size: 12px; margin-top: 20px;">
          Esta mensagem foi enviada através do formulário de contato do site.
        </p>
      `,
    });

    // Send confirmation email to user
    const userEmailResponse = await resend.emails.send({
      from: 'Tikvah Psycem <onboarding@resend.dev>',
      to: [email],
      subject: 'Mensagem recebida - Obrigado pelo contato!',
      html: `
        <h2>Olá, ${name}!</h2>
        <p>Recebemos sua mensagem e entraremos em contato em breve.</p>
        
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Resumo da sua mensagem:</h3>
          <p><strong>Assunto:</strong> ${subject}</p>
          <p><strong>Mensagem:</strong></p>
          <div style="background: #fff; padding: 15px; border: 1px solid #ddd; border-radius: 4px; margin-top: 10px;">
            ${message.replace(/\n/g, '<br>')}
          </div>
        </div>
        
        <p>Agradecemos o seu interesse e responderemos em até 24 horas.</p>
        
        <p style="color: #666; font-size: 12px; margin-top: 20px;">
          Esta é uma mensagem automática. Por favor, não responda a este email.
        </p>
      `,
    });

    console.log('Emails enviados:', { 
      adminEmailId: adminEmailResponse.data?.id, 
      userEmailId: userEmailResponse.data?.id 
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Email enviado com sucesso',
        adminEmailId: adminEmailResponse.data?.id,
        userEmailId: userEmailResponse.data?.id
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Erro ao enviar email:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
