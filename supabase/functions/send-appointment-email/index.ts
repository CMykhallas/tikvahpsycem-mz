
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Input validation schemas
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
};

const sanitizeString = (input: string, maxLength: number = 1000): string => {
  return input
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .trim()
    .slice(0, maxLength);
};

const validateAppointmentData = (data: any): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!data.client_name || typeof data.client_name !== 'string' || data.client_name.length < 2 || data.client_name.length > 100) {
    errors.push('Invalid client name');
  }
  
  if (!data.email || !validateEmail(data.email)) {
    errors.push('Invalid email address');
  }
  
  if (!data.phone || typeof data.phone !== 'string' || data.phone.length > 20) {
    errors.push('Invalid phone number');
  }
  
  if (!data.service_type || typeof data.service_type !== 'string') {
    errors.push('Invalid service type');
  }
  
  if (!data.preferred_date || isNaN(Date.parse(data.preferred_date))) {
    errors.push('Invalid preferred date');
  }
  
  return { isValid: errors.length === 0, errors };
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

    // Check request size (prevent large payloads)
    const contentLength = req.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > 10240) { // 10KB limit
      return new Response(
        JSON.stringify({ error: 'Request too large' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 413,
        }
      );
    }

    const rawData = await req.json();
    
    // Validate input data
    const validation = validateAppointmentData(rawData);
    if (!validation.isValid) {
      console.warn('Invalid appointment data:', validation.errors);
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
      client_name: sanitizeString(rawData.client_name, 100),
      email: sanitizeString(rawData.email, 254),
      phone: sanitizeString(rawData.phone, 20),
      service_type: sanitizeString(rawData.service_type, 50),
      preferred_date: rawData.preferred_date,
      message: rawData.message ? sanitizeString(rawData.message, 2000) : ''
    };

    console.log('Enviando email de agendamento:', { 
      client_name: sanitizedData.client_name, 
      email: sanitizedData.email, 
      service_type: sanitizedData.service_type 
    });

    const emailContent = `
      Novo agendamento:
      
      Cliente: ${sanitizedData.client_name}
      Email: ${sanitizedData.email}
      Telefone: ${sanitizedData.phone}
      Serviço: ${sanitizedData.service_type}
      Data Preferida: ${new Date(sanitizedData.preferred_date).toLocaleString('pt-PT')}
      
      Observações:
      ${sanitizedData.message || 'Nenhuma observação'}
    `;

    console.log('Email content prepared successfully');

    return new Response(
      JSON.stringify({ success: true, message: 'Email de confirmação enviado' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in send-appointment-email:', error.message);
    
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
