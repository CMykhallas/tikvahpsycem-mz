
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useCheckout = () => {
  const [isLoading, setIsLoading] = useState(false);

  const createCheckoutSession = async (serviceId: string, userId?: string) => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { serviceId, userId }
      });

      if (error) throw error;

      if (data?.url) {
        // Abrir checkout do Stripe em nova aba
        window.open(data.url, '_blank');
        toast.success("Redirecionando para o pagamento...");
      }
      
      return { success: true, data };
    } catch (error: any) {
      console.error("Erro ao criar sessão de checkout:", error);
      
      // Mostrar mensagem específica de segurança se disponível
      if (error.message?.includes('Price validation failed')) {
        toast.error("Erro de validação de preço. Por favor, recarregue a página.");
      } else if (error.message?.includes('Rate limit')) {
        toast.error("Muitas tentativas. Por favor, aguarde alguns minutos.");
      } else {
        toast.error("Erro ao processar pagamento. Tente novamente.");
      }
      
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  };

  return { createCheckoutSession, isLoading };
};
