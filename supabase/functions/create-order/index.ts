import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import Stripe from "https://esm.sh/stripe@18.5.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  console.log(`[CREATE-ORDER] ${step}${details ? ` - ${JSON.stringify(details)}` : ''}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Iniciando criação de pedido");

    const { products, paymentMethod, userInfo } = await req.json();

    if (!products || products.length === 0) {
      throw new Error("Carrinho vazio");
    }

    // Calcular total
    const total = products.reduce((sum: number, p: any) => {
      return sum + (p.price_after_discount * p.quantity);
    }, 0);

    logStep("Total calculado", { total });

    // Criar pedido
    const { data: order, error: orderError } = await supabaseClient
      .from("orders")
      .insert({
        amount: Math.round(total * 100), // Centavos
        status: "pending",
        payment_method: paymentMethod,
        products: products,
        metadata: {
          customer_name: userInfo?.name,
          customer_email: userInfo?.email,
          customer_phone: userInfo?.phone,
        },
      })
      .select()
      .single();

    if (orderError) throw orderError;

    logStep("Pedido criado", { orderId: order.id });

    // Se for Stripe, criar checkout session
    if (paymentMethod === "stripe") {
      const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
        apiVersion: "2025-08-27.basil",
      });

      const lineItems = products.map((p: any) => ({
        price_data: {
          currency: "mzn",
          product_data: {
            name: p.name,
            description: p.description,
          },
          unit_amount: Math.round(p.price_after_discount * 100),
        },
        quantity: p.quantity,
      }));

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: lineItems,
        mode: "payment",
        success_url: `${req.headers.get("origin")}/success?order_id=${order.id}`,
        cancel_url: `${req.headers.get("origin")}/loja`,
        metadata: {
          order_id: order.id,
        },
      });

      // Atualizar ordem com session ID
      await supabaseClient
        .from("orders")
        .update({ stripe_session_id: session.id })
        .eq("id", order.id);

      return new Response(
        JSON.stringify({
          success: true,
          orderId: order.id,
          checkoutUrl: session.url,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // Para M-Pesa e transferência, retornar apenas orderId
    return new Response(
      JSON.stringify({
        success: true,
        orderId: order.id,
        total: total,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    logStep("ERRO", { message: error.message });
    return new Response(
      JSON.stringify({
        success: false,
        error: "Erro ao criar pedido",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
