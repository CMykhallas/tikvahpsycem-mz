
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const validateCheckoutData = (data: any): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!data.serviceId || typeof data.serviceId !== 'string' || data.serviceId.length > 50) {
    errors.push('Invalid service ID');
  }
  
  if (data.userId && (typeof data.userId !== 'string' || data.userId.length > 50)) {
    errors.push('Invalid user ID');
  }
  
  return { isValid: errors.length === 0, errors };
};

const sanitizeString = (input: string, maxLength: number = 100): string => {
  return input
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .trim()
    .slice(0, maxLength);
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Check content type
    const contentType = req.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return new Response(
        JSON.stringify({ error: 'Invalid content type' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    // Check request size
    const contentLength = req.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > 1024) { // 1KB limit for checkout requests
      return new Response(
        JSON.stringify({ error: 'Request too large' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 413,
        }
      );
    }

    const rawData = await req.json();
    
    // Validate input
    const validation = validateCheckoutData(rawData);
    if (!validation.isValid) {
      console.warn('Invalid checkout data:', validation.errors);
      return new Response(
        JSON.stringify({ error: 'Invalid input data' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    // Sanitize data
    const sanitizedData = {
      serviceId: sanitizeString(rawData.serviceId, 50),
      userId: rawData.userId ? sanitizeString(rawData.userId, 50) : null
    };
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    // Buscar informações do serviço with additional validation
    const { data: service, error: serviceError } = await supabaseClient
      .from('services')
      .select('id, name, price, currency')
      .eq('id', sanitizedData.serviceId)
      .single();

    if (serviceError || !service) {
      console.warn('Service not found:', sanitizedData.serviceId);
      return new Response(
        JSON.stringify({ error: 'Serviço não encontrado' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404,
        }
      );
    }

    // Validate service data
    if (!service.price || service.price <= 0 || !service.currency) {
      console.error('Invalid service configuration:', service.id);
      return new Response(
        JSON.stringify({ error: 'Configuração de serviço inválida' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    // Create mock checkout URL with service validation
    const mockCheckoutUrl = `https://checkout-demo.stripe.com/pay/cs_test_${service.id}`;

    // Criar registro de pedido apenas se userId for fornecido
    if (sanitizedData.userId) {
      const { error: orderError } = await supabaseClient.from('orders').insert({
        user_id: sanitizedData.userId,
        service_id: service.id,
        amount: service.price,
        currency: service.currency,
        status: 'pending'
      });

      if (orderError) {
        console.error('Error creating order:', orderError.message);
        // Don't expose database errors to client
        return new Response(
          JSON.stringify({ error: 'Erro ao processar pedido' }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
          }
        );
      }
    }

    console.log('Checkout session created successfully for service:', service.name);

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
    console.error('Error in create-checkout:', error.message);
    
    // Don't expose internal error details
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
