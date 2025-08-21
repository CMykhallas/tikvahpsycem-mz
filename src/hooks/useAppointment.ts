
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { validateFormInput, rateLimiter, securityLog, csrfToken } from "@/utils/security";

export const useAppointment = () => {
  const [isLoading, setIsLoading] = useState(false);

  const submitAppointment = async (formData: {
    client_name: string;
    email: string;
    phone: string;
    service_type: string;
    preferred_date: string;
    message?: string;
  }) => {
    setIsLoading(true);
    
    try {
      // Rate limiting check
      const clientIP = 'client_' + Date.now(); // In production, get real client IP
      if (rateLimiter.check(clientIP, 3, 600000)) { // 3 appointments per 10 minutes
        securityLog.logFailedAttempt('rate_limit', { ip: clientIP, form: 'appointment' });
        toast.error("Too many appointment requests. Please wait before submitting again.");
        return { success: false };
      }

      // Validate input
      const validation = validateFormInput({
        name: formData.client_name,
        email: formData.email,
        phone: formData.phone,
        message: formData.message
      });

      if (!validation.isValid) {
        securityLog.logSuspiciousActivity('invalid_form_input', { errors: validation.errors });
        toast.error(validation.errors.join(', '));
        return { success: false };
      }

      // Validate date is in the future
      const appointmentDate = new Date(formData.preferred_date);
      if (appointmentDate <= new Date()) {
        toast.error("Por favor, selecione uma data futura para o agendamento.");
        return { success: false };
      }

      // Generate CSRF token for this session if not exists
      if (!csrfToken.get()) {
        csrfToken.generate();
      }

      const { error } = await supabase
        .from("appointments")
        .insert([{
          ...formData,
          preferred_date: appointmentDate.toISOString()
        }]);

      if (error) throw error;

      // Send email confirmation
      await supabase.functions.invoke('send-appointment-email', {
        body: formData
      });

      toast.success("Agendamento realizado com sucesso! Receberá confirmação por email brevemente.");
      return { success: true };
    } catch (error) {
      console.error("Erro ao agendar:", error);
      securityLog.logFailedAttempt('form_submission', { error: error.message, form: 'appointment' });
      toast.error("Erro ao realizar agendamento. Tente novamente.");
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  };

  return { submitAppointment, isLoading };
};
