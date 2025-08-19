
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
      const { error } = await supabase
        .from("contacts")
        .insert([formData]);

      if (error) throw error;

      // Enviar email via edge function
      await supabase.functions.invoke('send-contact-email', {
        body: formData
      });

      toast.success("Mensagem enviada com sucesso! Receberá confirmação por email brevemente.");
      return { success: true };
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
      toast.error("Erro ao enviar mensagem. Tente novamente.");
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  };

  return { submitContact, isLoading };
};
