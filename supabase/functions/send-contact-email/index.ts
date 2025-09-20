
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { name, email, phone, subject, message } = await req.json();

    console.log('Enviando email de contato:', { name, email, subject });

    // Send notification email to admin
    const adminEmailResponse = await resend.emails.send({
      from: 'Sistema <onboarding@resend.dev>',
      to: ['admin@yoursite.com'], // Replace with your admin email
      subject: `Nova mensagem de contato: ${subject}`,
      html: `
        <h2>Nova mensagem de contato recebida</h2>
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Nome:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Telefone:</strong> ${phone || 'Não informado'}</p>
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
      from: 'Atendimento <onboarding@resend.dev>',
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
