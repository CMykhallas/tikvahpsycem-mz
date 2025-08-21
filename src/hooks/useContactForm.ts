
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { validateFormInput, rateLimiter, securityLog, csrfToken } from "@/utils/security";

export const useContactForm = () => {
  const [isLoading, setIsLoading] = useState(false);

  const submitContact = async (formData: {
    name: string;
    email: string;
    phone?: string;
    subject: string;
    message: string;
  }) => {
    setIsLoading(true);
    
    try {
      // Rate limiting check
      const clientIP = 'client_' + Date.now(); // In production, get real client IP
      if (rateLimiter.check(clientIP, 5, 300000)) { // 5 requests per 5 minutes
        securityLog.logFailedAttempt('rate_limit', { ip: clientIP, form: 'contact' });
        toast.error("Too many requests. Please wait before submitting again.");
        return { success: false };
      }

      // Validate input
      const validation = validateFormInput(formData);
      if (!validation.isValid) {
        securityLog.logSuspiciousActivity('invalid_form_input', { errors: validation.errors });
        toast.error(validation.errors.join(', '));
        return { success: false };
      }

      // Generate CSRF token for this session if not exists
      if (!csrfToken.get()) {
        csrfToken.generate();
      }

      const { error } = await supabase
        .from("contacts")
        .insert([formData]);

      if (error) throw error;

      // Send email via edge function
      await supabase.functions.invoke('send-contact-email', {
        body: formData
      });

      toast.success("Mensagem enviada com sucesso! Receberá confirmação por email brevemente.");
      return { success: true };
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
      securityLog.logFailedAttempt('form_submission', { error: error.message, form: 'contact' });
      toast.error("Erro ao enviar mensagem. Tente novamente.");
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  };

  return { submitContact, isLoading };
};
