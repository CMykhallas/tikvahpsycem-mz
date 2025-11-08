import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[MPESA-PAYMENT] ${step}${detailsStr}`);
};

// Validação de entrada ultra-segura
const validatePhone = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  if (!/^258(8[2345]|8[67])\d{7}$/.test(cleaned)) {
    throw new Error('Número de telefone M-Pesa inválido');
  }
  return cleaned;
};

const sanitizeString = (input: string, maxLength: number = 200): string => {
  return input
    .trim()
    .slice(0, maxLength)
    .replace(/[<>\"'`]/g, '');
};

// Rate limiting
const rateLimits = new Map<string, { count: number; resetTime: number }>();

const checkRateLimit = (ip: string): boolean => {
  const now = Date.now();
  const limit = rateLimits.get(ip);
  
  if (!limit || now > limit.resetTime) {
    rateLimits.set(ip, { count: 1, resetTime: now + 60000 }); // 1 min
    return true;
  }
  
  if (limit.count >= 5) {
    return false;
  }
  
  limit.count++;
  return true;
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
    logStep("Iniciando processamento M-Pesa");

    // Rate limiting por IP
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    if (!checkRateLimit(ip)) {
      throw new Error("Muitas requisições. Tente novamente em 1 minuto");
    }

    // Validar secret keys
    const consumerKey = Deno.env.get("MPESA_CONSUMER_KEY");
    const consumerSecret = Deno.env.get("MPESA_CONSUMER_SECRET");
    
    if (!consumerKey || !consumerSecret) {
      throw new Error("Configuração M-Pesa incompleta");
    }

    const { phoneNumber, amount, orderId } = await req.json();
    
    // Validações de segurança
    const validPhone = validatePhone(phoneNumber);
    const validAmount = Number(amount);
    
    if (isNaN(validAmount) || validAmount <= 0 || validAmount > 100000) {
      throw new Error("Valor inválido");
    }

    logStep("Dados validados", { phone: `${validPhone.slice(0, 6)}****`, amount: validAmount });

    // Obter token OAuth M-Pesa
    const authString = btoa(`${consumerKey}:${consumerSecret}`);
    const tokenResponse = await fetch("https://api.vm.co.mz:18352/ipg/v1x/oauth/token", {
      method: "POST",
      headers: {
        "Authorization": `Basic ${authString}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    });

    if (!tokenResponse.ok) {
      throw new Error("Falha na autenticação M-Pesa");
    }

    const { access_token } = await tokenResponse.json();
    logStep("Token M-Pesa obtido");

    // Iniciar transação C2B (Customer to Business)
    const c2bPayload = {
      input_TransactionReference: `TKV${Date.now()}`,
      input_CustomerMSISDN: validPhone,
      input_Amount: validAmount.toString(),
      input_ThirdPartyReference: orderId,
      input_ServiceProviderCode: "258855487746", // Número da Tikvah (NUNCA ALTERAR)
    };

    const c2bResponse = await fetch("https://api.vm.co.mz:18352/ipg/v1x/c2bPayment/singleStage/", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(c2bPayload),
    });

    const c2bData = await c2bResponse.json();
    logStep("Resposta M-Pesa", { status: c2bResponse.status, code: c2bData.output_ResponseCode });

    if (c2bData.output_ResponseCode === "INS-0") {
      // Sucesso - Atualizar pedido
      const { error: updateError } = await supabaseClient
        .from("orders")
        .update({
          status: "processing",
          payment_method: "mpesa",
          mpesa_reference: c2bData.output_TransactionID,
          phone_number: validPhone,
        })
        .eq("id", orderId);

      if (updateError) {
        logStep("Erro ao atualizar pedido", updateError);
      }

      return new Response(
        JSON.stringify({
          success: true,
          transactionId: c2bData.output_TransactionID,
          message: "Pagamento processado com sucesso",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    } else {
      throw new Error(c2bData.output_ResponseDesc || "Pagamento M-Pesa falhou");
    }

  } catch (error) {
    logStep("ERRO", { message: error.message });
    return new Response(
      JSON.stringify({
        success: false,
        error: "Erro ao processar pagamento",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
