import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { useSecurityMonitoring } from '@/hooks/useSecurityMonitoring';
import { SecurityAuditResult } from '@/utils/securityAudit';
import { AlertTriangle, CheckCircle, XCircle, Shield, Download, RefreshCw } from 'lucide-react';

export const SecurityAuditReport = () => {
  const [auditResult, setAuditResult] = useState<SecurityAuditResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastAudit, setLastAudit] = useState<Date | null>(null);
  const { runSecurityAudit, securityEvents, getMetrics } = useSecurityMonitoring();

  const runAudit = async () => {
    setIsLoading(true);
    try {
      const result = await runSecurityAudit();
      setAuditResult(result);
      setLastAudit(new Date());
    } catch (error) {
      console.error('Erro na auditoria:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    runAudit();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pass': return 'text-green-600 bg-green-50 border-green-200';
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'fail': return 'text-red-600 bg-red-50 border-red-200';
      case 'critical': return 'text-red-800 bg-red-100 border-red-300';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getGradeColor = (grade: string) => {
    if (grade.startsWith('A')) return 'text-green-600';
    if (grade.startsWith('B')) return 'text-blue-600';
    if (grade.startsWith('C')) return 'text-yellow-600';
    if (grade.startsWith('D')) return 'text-orange-600';
    return 'text-red-600';
  };

  const generateCSVReport = () => {
    if (!auditResult) return;

    const csvContent = [
      ['Check ID', 'Name', 'Status', 'Severity', 'Details', 'Fix'],
      ...auditResult.results.map(result => [
        result.id,
        result.name,
        result.status,
        result.severity,
        result.details,
        result.fix || 'N/A'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `security-audit-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const criticalIssues = [
    {
      id: 'csp_blocking',
      title: 'Content Security Policy muito restritiva',
      description: 'A CSP atual pode estar bloqueando conteúdo legítimo',
      severity: 'high',
      fix: 'Revisar e ajustar as políticas de CSP para permitir recursos necessários'
    },
    {
      id: 'supabase_otp_expiry',
      title: 'OTP expiry do Supabase excede limites recomendados',
      description: 'Tempo de expiração do OTP está configurado acima do recomendado',
      severity: 'warning',
      fix: 'Reduzir o tempo de expiração do OTP para máximo 10 minutos'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Cabeçalho da Auditoria */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Shield className="h-6 w-6" />
              <CardTitle>Relatório de Auditoria de Segurança</CardTitle>
            </div>
            <div className="flex space-x-2">
              <Button 
                onClick={runAudit} 
                disabled={isLoading}
                size="sm"
              >
                {isLoading ? (
                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Executar Nova Auditoria
              </Button>
              {auditResult && (
                <Button onClick={generateCSVReport} variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar CSV
                </Button>
              )}
            </div>
          </div>
          {lastAudit && (
            <p className="text-sm text-muted-foreground">
              Última auditoria: {lastAudit.toLocaleString('pt-PT')}
            </p>
          )}
        </CardHeader>
      </Card>

      {/* Problemas Críticos Identificados */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <span>Problemas Críticos Identificados</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {criticalIssues.map((issue) => (
            <Alert key={issue.id} className="border-l-4 border-l-red-500">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{issue.title}</h4>
                    <Badge variant={issue.severity === 'high' ? 'destructive' : 'outline'}>
                      {issue.severity}
                    </Badge>
                  </div>
                  <p className="text-sm">{issue.description}</p>
                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                    <p className="text-sm font-medium text-blue-800">Solução:</p>
                    <p className="text-sm text-blue-700">{issue.fix}</p>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          ))}
        </CardContent>
      </Card>

      {/* Resumo da Auditoria */}
      {auditResult && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <div className={`text-3xl font-bold ${getGradeColor(auditResult.grade)}`}>
                  {auditResult.grade}
                </div>
                <p className="text-sm text-muted-foreground">Nota de Segurança</p>
                <p className="text-xs text-muted-foreground">{auditResult.score}/100</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-green-600">{auditResult.passed}</p>
                  <p className="text-xs text-muted-foreground">Testes Aprovados</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-red-600">{auditResult.failed + auditResult.critical}</p>
                  <p className="text-xs text-muted-foreground">Testes Falhados</p>
                </div>
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-yellow-600">{auditResult.warnings}</p>
                  <p className="text-xs text-muted-foreground">Avisos</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Detalhes dos Testes */}
      {auditResult && (
        <Card>
          <CardHeader>
            <CardTitle>Detalhes dos Testes de Segurança</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {auditResult.results.map((result) => (
                <div 
                  key={result.id} 
                  className={`p-4 rounded-lg border ${getStatusColor(result.status)}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{result.name}</h4>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">{result.severity}</Badge>
                      <Badge variant={result.status === 'pass' ? 'default' : 'destructive'}>
                        {result.status}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-sm mb-2">{result.description}</p>
                  <p className="text-sm font-medium">Resultado: {result.details}</p>
                  {result.fix && (
                    <div className="mt-2 p-2 bg-white/50 rounded border">
                      <p className="text-sm font-medium">Correção:</p>
                      <p className="text-sm">{result.fix}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recomendações de Segurança */}
      {auditResult && auditResult.recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recomendações de Segurança</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {auditResult.recommendations.map((recommendation, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                  <span className="text-sm">{recommendation}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Estado de Conformidade */}
      {auditResult && (
        <Card>
          <CardHeader>
            <CardTitle>Estado de Conformidade</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">GDPR</h4>
                <div className="flex items-center justify-between">
                  <span className="text-sm">
                    {auditResult.compliance.gdpr.compliant ? 'Conforme' : 'Não Conforme'}
                  </span>
                  <Badge variant={auditResult.compliance.gdpr.compliant ? 'default' : 'destructive'}>
                    {auditResult.compliance.gdpr.score}%
                  </Badge>
                </div>
              </div>
              
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">OWASP</h4>
                <div className="flex items-center justify-between">
                  <span className="text-sm">
                    {auditResult.compliance.owasp.compliant ? 'Conforme' : 'Não Conforme'}
                  </span>
                  <Badge variant={auditResult.compliance.owasp.compliant ? 'default' : 'destructive'}>
                    {auditResult.compliance.owasp.score}%
                  </Badge>
                </div>
              </div>
              
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">ISO 27001</h4>
                <div className="flex items-center justify-between">
                  <span className="text-sm">
                    {auditResult.compliance.iso27001.compliant ? 'Conforme' : 'Não Conforme'}
                  </span>
                  <Badge variant={auditResult.compliance.iso27001.compliant ? 'default' : 'destructive'}>
                    {auditResult.compliance.iso27001.score}%
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Eventos de Segurança Recentes */}
      <Card>
        <CardHeader>
          <CardTitle>Eventos de Segurança Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          {securityEvents.length > 0 ? (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {securityEvents.slice(0, 10).map((event) => (
                <div key={event.id} className="flex items-center justify-between p-2 border rounded">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{event.event}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(event.timestamp).toLocaleString('pt-PT')}
                    </p>
                  </div>
                  <Badge variant={event.severity === 'critical' ? 'destructive' : 'outline'}>
                    {event.severity}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Nenhum evento de segurança registado recentemente.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};