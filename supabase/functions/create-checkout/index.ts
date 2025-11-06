import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-CHECKOUT] ${step}${detailsStr}`);
};

// Mapeamento dos tipos de serviço para os price_ids do Stripe
const SERVICE_PRICES: Record<string, { priceId: string; name: string }> = {
  "individual": { 
    priceId: "price_1SQNJv2EoHHPABdIGNldgDeZ", 
    name: "Terapia Individual" 
  },
  "casal": { 
    priceId: "price_1SQNS72EoHHPABdIKxkd37Pr", 
    name: "Terapia de Casal" 
  },
  "familiar": { 
    priceId: "price_1SQNcY2EoHHPABdIo4PFDe34", 
    name: "Terapia Familiar" 
  },
  "consultoria": { 
    priceId: "price_1S4Kgv2EoHHPABdItORxIuRB", 
    name: "Consultoria Organizacional" 
  }
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    logStep("Stripe key verified");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const requestData = await req.json();
    logStep("Request data received", { 
      serviceType: requestData.serviceType,
      hasAppointmentData: !!requestData.appointmentData 
    });

    // Validar tipo de serviço
    const serviceType = requestData.serviceType;
    const serviceConfig = SERVICE_PRICES[serviceType];
    
    if (!serviceConfig) {
      logStep("Invalid service type", { serviceType });
      return new Response(
        JSON.stringify({ error: "Tipo de serviço inválido" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    // Extrair dados do agendamento
    const appointmentData = requestData.appointmentData;
    if (!appointmentData || !appointmentData.email) {
      return new Response(
        JSON.stringify({ error: "Dados de agendamento inválidos" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    logStep("Stripe client initialized");

    // Verificar se já existe um cliente Stripe
    const customers = await stripe.customers.list({ 
      email: appointmentData.email, 
      limit: 1 
    });
    
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Existing customer found", { customerId });
    }

    // Criar sessão de checkout
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : appointmentData.email,
      line_items: [
        {
          price: serviceConfig.priceId,
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${req.headers.get("origin")}/obrigado?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/appointment`,
      metadata: {
        client_name: appointmentData.client_name,
        phone: appointmentData.phone,
        service_type: serviceType,
        preferred_date: appointmentData.preferred_date,
      },
    });

    logStep("Checkout session created", { 
      sessionId: session.id, 
      customerId: session.customer 
    });

    // Salvar agendamento no banco com status pending_payment
    const { error: appointmentError } = await supabaseClient
      .from("appointments")
      .insert({
        client_name: appointmentData.client_name,
        email: appointmentData.email,
        phone: appointmentData.phone,
        service_type: serviceType,
        preferred_date: appointmentData.preferred_date,
        message: appointmentData.message || "",
        status: "pending_payment",
      });

    if (appointmentError) {
      logStep("Error saving appointment", { error: appointmentError.message });
      // Não bloquear o checkout se houver erro ao salvar
    } else {
      logStep("Appointment saved successfully");
    }

    return new Response(
      JSON.stringify({ 
        url: session.url,
        sessionId: session.id 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in create-checkout", { message: errorMessage });
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
