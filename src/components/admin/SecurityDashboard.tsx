
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, AlertTriangle, Activity, Users } from 'lucide-react';
import { enhancedSecurityMonitor } from '@/utils/securityMonitoringEnhanced';

export const SecurityDashboard = () => {
  const metrics = enhancedSecurityMonitor.getSecurityMetrics();
  const recentEvents = enhancedSecurityMonitor.getRecentEvents(10);
  
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'authentication': return <Users className="w-4 h-4" />;
      case 'rate_limiting': return <Shield className="w-4 h-4" />;
      case 'suspicious_activity': return <AlertTriangle className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed Logins</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.failedLogins}</div>
            <p className="text-xs text-muted-foreground">Last hour</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Suspicious Activities</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.suspiciousActivities}</div>
            <p className="text-xs text-muted-foreground">Last hour</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rate Limit Violations</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.rateLimitViolations}</div>
            <p className="text-xs text-muted-foreground">Last hour</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Blocked IPs</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.blockedIPs.size}</div>
            <p className="text-xs text-muted-foreground">Currently blocked</p>
          </CardContent>
        </Card>
      </div>

      {/* Security Alerts */}
      {(metrics.failedLogins > 5 || metrics.suspiciousActivities > 3) && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Elevated security activity detected. Consider reviewing recent events.
          </AlertDescription>
        </Alert>
      )}

      {/* Recent Security Events */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Security Events</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentEvents.length === 0 ? (
              <p className="text-muted-foreground">No recent security events</p>
            ) : (
              recentEvents.map((event) => (
                <div key={event.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                  <div className="mt-1">
                    {getCategoryIcon(event.category)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium truncate">{event.event}</p>
                      <div className="flex items-center space-x-2">
                        <Badge className={getSeverityColor(event.severity)}>
                          {event.severity}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(event.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {event.category} | IP: {event.ip}
                    </p>
                    {Object.keys(event.details).length > 0 && (
                      <details className="mt-2">
                        <summary className="text-xs cursor-pointer text-primary">
                          View details
                        </summary>
                        <pre className="text-xs bg-muted p-2 rounded mt-1 overflow-auto">
                          {JSON.stringify(event.details, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
