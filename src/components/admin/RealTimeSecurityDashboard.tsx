import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Shield, AlertTriangle, Activity, Ban, TrendingUp, Filter,
  Clock, DollarSign, Zap, RefreshCw
} from 'lucide-react';
import { useSecurityIncidents } from '@/hooks/useSecurityIncidents';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6'];

export const RealTimeSecurityDashboard = () => {
  const { incidents, blockedIPs, stats, loading, fetchIncidents, fetchStats } = useSecurityIncidents();
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [timeWindow, setTimeWindow] = useState<string>('24 hours');

  const filteredIncidents = severityFilter === 'all' 
    ? incidents 
    : incidents.filter(i => i.severity === severityFilter);

  // Prepare chart data
  const incidentsBySeverity = [
    { name: 'Critical', value: incidents.filter(i => i.severity === 'critical').length, color: '#dc2626' },
    { name: 'High', value: incidents.filter(i => i.severity === 'high').length, color: '#ea580c' },
    { name: 'Medium', value: incidents.filter(i => i.severity === 'medium').length, color: '#ca8a04' },
    { name: 'Low', value: incidents.filter(i => i.severity === 'low').length, color: '#16a34a' },
  ];

  const incidentsByType = incidents.reduce((acc, incident) => {
    const type = incident.incident_type;
    const existing = acc.find(item => item.name === type);
    if (existing) {
      existing.value++;
    } else {
      acc.push({ name: type, value: 1 });
    }
    return acc;
  }, [] as { name: string; value: number }[]);

  // Timeline data (group by hour)
  const timelineData = incidents.reduce((acc, incident) => {
    const date = new Date(incident.created_at);
    const hour = `${date.getHours()}:00`;
    const existing = acc.find(item => item.time === hour);
    if (existing) {
      existing.count++;
      if (incident.severity === 'critical') existing.critical++;
    } else {
      acc.push({ 
        time: hour, 
        count: 1, 
        critical: incident.severity === 'critical' ? 1 : 0 
      });
    }
    return acc;
  }, [] as { time: string; count: number; critical: number }[]).slice(-24);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-300';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const handleRefresh = async () => {
    await Promise.all([
      fetchIncidents(),
      fetchStats(timeWindow)
    ]);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6" />
          <h2 className="text-2xl font-bold">Dashboard de Segurança em Tempo Real</h2>
        </div>
        <div className="flex gap-2">
          <Select value={timeWindow} onValueChange={(value) => {
            setTimeWindow(value);
            fetchStats(value);
          }}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1 hour">Última Hora</SelectItem>
              <SelectItem value="24 hours">Últimas 24h</SelectItem>
              <SelectItem value="7 days">Últimos 7 dias</SelectItem>
              <SelectItem value="30 days">Últimos 30 dias</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleRefresh} variant="outline" size="icon">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Critical Alert */}
      {stats && (stats.critical_incidents > 0 || stats.price_tampering_attempts > 0) && (
        <Alert className="border-red-300 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>⚠️ ALERTA CRÍTICO:</strong> Detectados {stats.critical_incidents} incidentes críticos e {stats.price_tampering_attempts} tentativas de manipulação de preços!
          </AlertDescription>
        </Alert>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Incidentes</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_incidents || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.critical_incidents || 0} críticos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tentativas de Fraude</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stats?.price_tampering_attempts || 0}
            </div>
            <p className="text-xs text-muted-foreground">Manipulação de preços</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">IPs Bloqueados</CardTitle>
            <Ban className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.blocked_ips || 0}</div>
            <p className="text-xs text-muted-foreground">{blockedIPs.length} ativos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rate Limits</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.rate_limit_violations || 0}</div>
            <p className="text-xs text-muted-foreground">Violações detectadas</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="incidents" className="space-y-4">
        <TabsList>
          <TabsTrigger value="incidents">Incidentes</TabsTrigger>
          <TabsTrigger value="analytics">Análise</TabsTrigger>
          <TabsTrigger value="blocked">IPs Bloqueados</TabsTrigger>
        </TabsList>

        <TabsContent value="incidents" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Incidentes de Segurança</CardTitle>
                <div className="flex gap-2">
                  <Select value={severityFilter} onValueChange={setSeverityFilter}>
                    <SelectTrigger className="w-[150px]">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {filteredIncidents.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    Nenhum incidente registrado
                  </p>
                ) : (
                  filteredIncidents.map((incident) => (
                    <div 
                      key={incident.id} 
                      className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <Badge className={getSeverityColor(incident.severity)}>
                              {incident.severity}
                            </Badge>
                            <span className="font-medium">{incident.incident_type}</span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {new Date(incident.created_at).toLocaleString('pt-PT')}
                            </span>
                            <span>IP: {incident.ip_address}</span>
                            {incident.endpoint && <span>Endpoint: {incident.endpoint}</span>}
                          </div>
                          {incident.details && (
                            <details className="mt-2">
                              <summary className="text-xs cursor-pointer text-primary">
                                Ver detalhes
                              </summary>
                              <pre className="text-xs bg-muted p-2 rounded mt-1 overflow-auto max-h-32">
                                {JSON.stringify(incident.details, null, 2)}
                              </pre>
                            </details>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Incidents by Severity */}
            <Card>
              <CardHeader>
                <CardTitle>Incidentes por Severidade</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={incidentsBySeverity}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.name}: ${entry.value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {incidentsBySeverity.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Incidents by Type */}
            <Card>
              <CardHeader>
                <CardTitle>Tipos de Incidentes</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={incidentsByType}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Timeline de Incidentes (Últimas 24h)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={timelineData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="count" stroke="#3b82f6" name="Total" />
                    <Line type="monotone" dataKey="critical" stroke="#dc2626" name="Críticos" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="blocked" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>IPs Bloqueados ({blockedIPs.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {blockedIPs.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    Nenhum IP bloqueado
                  </p>
                ) : (
                  blockedIPs.map((blocked) => (
                    <div 
                      key={blocked.id} 
                      className="p-4 border border-red-200 rounded-lg bg-red-50"
                    >
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Ban className="h-4 w-4 text-red-600" />
                            <span className="font-mono font-bold">{blocked.ip_address}</span>
                            <Badge variant="destructive">BLOQUEADO</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Razão: {blocked.reason}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>
                              Bloqueado: {new Date(blocked.blocked_at).toLocaleString('pt-PT')}
                            </span>
                            {blocked.expires_at && (
                              <span>
                                Expira: {new Date(blocked.expires_at).toLocaleString('pt-PT')}
                              </span>
                            )}
                          </div>
                          {blocked.metadata && (
                            <details className="mt-2">
                              <summary className="text-xs cursor-pointer text-primary">
                                Ver metadata
                              </summary>
                              <pre className="text-xs bg-white p-2 rounded mt-1 overflow-auto max-h-32">
                                {JSON.stringify(blocked.metadata, null, 2)}
                              </pre>
                            </details>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
