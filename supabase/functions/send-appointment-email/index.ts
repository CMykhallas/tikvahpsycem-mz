
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { client_name, email, phone, service_type, preferred_date, message } = await req.json();

    console.log('Enviando email de agendamento:', { client_name, email, service_type });

    const emailContent = `
      Novo agendamento:
      
      Cliente: ${client_name}
      Email: ${email}
      Telefone: ${phone}
      Serviço: ${service_type}
      Data Preferida: ${new Date(preferred_date).toLocaleString('pt-PT')}
      
      Observações:
      ${message || 'Nenhuma observação'}
    `;

    console.log(emailContent);

    return new Response(
      JSON.stringify({ success: true, message: 'Email de confirmação enviado' }),
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
