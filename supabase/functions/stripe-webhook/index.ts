import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Webhook received");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    
    const signature = req.headers.get("stripe-signature");
    if (!signature) {
      logStep("Missing stripe signature");
      return new Response(JSON.stringify({ error: "No signature" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    const body = await req.text();
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    
    let event: Stripe.Event;
    
    if (webhookSecret) {
      // Verificar assinatura do webhook
      try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
        logStep("Webhook signature verified", { type: event.type });
      } catch (err) {
        logStep("Webhook signature verification failed", { error: err.message });
        return new Response(JSON.stringify({ error: "Invalid signature" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        });
      }
    } else {
      // Sem verificação de assinatura (não recomendado para produção)
      event = JSON.parse(body);
      logStep("Processing webhook without signature verification", { type: event.type });
    }

    // Processar evento de checkout completado
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      logStep("Checkout session completed", { 
        sessionId: session.id,
        customerEmail: session.customer_email,
        metadata: session.metadata 
      });

      const supabaseClient = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
      );

      // Atualizar status do agendamento
      const { data: appointments, error: fetchError } = await supabaseClient
        .from("appointments")
        .select("*")
        .eq("email", session.customer_email || session.customer_details?.email)
        .eq("service_type", session.metadata?.service_type)
        .eq("status", "pending_payment")
        .order("created_at", { ascending: false })
        .limit(1);

      if (fetchError) {
        logStep("Error fetching appointment", { error: fetchError.message });
        throw fetchError;
      }

      if (!appointments || appointments.length === 0) {
        logStep("No pending appointment found", { 
          email: session.customer_email,
          serviceType: session.metadata?.service_type 
        });
        return new Response(JSON.stringify({ received: true, message: "No appointment to update" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }

      const appointment = appointments[0];
      logStep("Appointment found", { appointmentId: appointment.id });

      // Atualizar status para confirmed
      const { error: updateError } = await supabaseClient
        .from("appointments")
        .update({ status: "confirmed" })
        .eq("id", appointment.id);

      if (updateError) {
        logStep("Error updating appointment", { error: updateError.message });
        throw updateError;
      }

      logStep("Appointment status updated to confirmed", { appointmentId: appointment.id });

      // Criar registro de pedido
      const { error: orderError } = await supabaseClient
        .from("orders")
        .insert({
          stripe_session_id: session.id,
          amount: session.amount_total,
          status: "paid",
          metadata: {
            appointment_id: appointment.id,
            service_type: session.metadata?.service_type,
            client_name: session.metadata?.client_name,
            preferred_date: session.metadata?.preferred_date,
          }
        });

      if (orderError) {
        logStep("Error creating order", { error: orderError.message });
        // Não falhar o webhook se o pedido não for criado
      } else {
        logStep("Order created successfully");
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in stripe-webhook", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
