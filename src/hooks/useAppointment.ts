
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
      const { error } = await supabase
        .from("appointments")
        .insert([{
          ...formData,
          preferred_date: new Date(formData.preferred_date).toISOString()
        }]);

      if (error) throw error;

      // Enviar email de confirmação
      await supabase.functions.invoke('send-appointment-email', {
        body: formData
      });

      toast.success("Agendamento realizado com sucesso! Receberá confirmação por email brevemente.");
      return { success: true };
    } catch (error) {
      console.error("Erro ao agendar:", error);
      toast.error("Erro ao realizar agendamento. Tente novamente.");
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  };

  return { submitAppointment, isLoading };
};
