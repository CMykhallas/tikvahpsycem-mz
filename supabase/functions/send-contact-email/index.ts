
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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

    // Aqui você integraria com um serviço de email como Resend, SendGrid, etc.
    // Por enquanto, vamos simular o envio e log
    console.log('Enviando email de contato:', { name, email, subject });

    // Simulação de envio de email
    const emailContent = `
      Nova mensagem de contato:
      
      Nome: ${name}
      Email: ${email}
      Telefone: ${phone || 'Não informado'}
      Assunto: ${subject}
      
      Mensagem:
      ${message}
    `;

    // Log para debugging
    console.log(emailContent);

    return new Response(
      JSON.stringify({ success: true, message: 'Email enviado com sucesso' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
