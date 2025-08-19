
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
    const { serviceId, userId } = await req.json();
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    // Buscar informações do serviço
    const { data: service, error: serviceError } = await supabaseClient
      .from('services')
      .select('*')
      .eq('id', serviceId)
      .single();

    if (serviceError) {
      throw new Error('Serviço não encontrado');
    }

    // Aqui você integraria com Stripe ou outro processador de pagamentos
    // Por enquanto, vamos simular uma URL de checkout
    const mockCheckoutUrl = `https://checkout-demo.stripe.com/pay/cs_test_${serviceId}`;

    // Criar registro de pedido
    if (userId) {
      await supabaseClient.from('orders').insert({
        user_id: userId,
        service_id: serviceId,
        amount: service.price,
        currency: service.currency,
        status: 'pending'
      });
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        url: mockCheckoutUrl,
        service: service.name 
      }),
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
