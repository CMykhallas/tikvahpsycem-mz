import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SecurityAuditReport } from '@/components/admin/SecurityAuditReport';
import { useAuth } from '@/hooks/useAuth';
import { SEOHead } from '@/components/SEOHead';

const SecurityAudit = () => {
  const { isAuthenticated, isStaff, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && (!isAuthenticated || !isStaff)) {
      navigate('/admin/login');
    }
  }, [isAuthenticated, isStaff, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated || !isStaff) {
    return null;
  }

  return (
    <>
      <SEOHead 
        title="Auditoria de Segurança - Tikvah Psycem"
        description="Relatório completo de auditoria de segurança, cibersegurança e análise de vulnerabilidades"
        keywords="auditoria segurança, cibersegurança, análise vulnerabilidades, relatório segurança"
      />
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-2">
              Auditoria de Segurança
            </h1>
            <p className="text-muted-foreground">
              Relatório completo de análise de segurança, cibersegurança e identificação de vulnerabilidades
            </p>
          </div>
          
          <SecurityAuditReport />
        </div>
      </div>
    </>
  );
};

export default SecurityAudit;