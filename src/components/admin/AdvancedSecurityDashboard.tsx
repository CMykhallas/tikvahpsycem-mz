
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Shield, AlertTriangle, Activity, Zap, Eye, Target, CheckCircle, XCircle } from 'lucide-react';
import { enhancedSecurityMonitor } from '@/utils/securityMonitoringEnhanced';
import { advancedThreatDetector, threatResponseSystem } from '@/utils/advancedThreatDetection';
import { securityAuditor, SecurityAuditResult } from '@/utils/securityAudit';

export const AdvancedSecurityDashboard = () => {
  const [auditResult, setAuditResult] = useState<SecurityAuditResult | null>(null);
  const [isRunningAudit, setIsRunningAudit] = useState(false);
  const [threatHistory, setThreatHistory] = useState<any[]>([]);

  const metrics = enhancedSecurityMonitor.getSecurityMetrics();
  const recentEvents = enhancedSecurityMonitor.getRecentEvents(20);

  useEffect(() => {
    // Load threat history
    setThreatHistory(advancedThreatDetector.getThreatHistory());
  }, []);

  const runSecurityAudit = async () => {
    setIsRunningAudit(true);
    try {
      const result = await securityAuditor.runFullAudit();
      setAuditResult(result);
    } catch (error) {
      console.error('Security audit failed:', error);
    }
    setIsRunningAudit(false);
  };

  const testThreatDetection = () => {
    const testInputs = [
      "'; DROP TABLE users; --",
      "<script>alert('xss')</script>",
      "admin' OR '1'='1",
      "javascript:alert(document.cookie)"
    ];

    testInputs.forEach(input => {
      const analysis = advancedThreatDetector.analyzeThreat(input, {
        ip: '192.168.1.100',
        userAgent: 'Test Agent',
        path: '/test'
      });
      
      const response = threatResponseSystem.handleThreat(analysis, {
        ip: '192.168.1.100',
        userAgent: 'Test Agent'
      });

      console.log('Threat Analysis:', analysis);
      console.log('Response:', response);
    });

    // Refresh threat history
    setThreatHistory(advancedThreatDetector.getThreatHistory());
  };

  const getGradeColor = (grade: string) => {
    if (grade.startsWith('A')) return 'text-green-600';
    if (grade.startsWith('B')) return 'text-yellow-600';
    if (grade.startsWith('C')) return 'text-orange-600';
    return 'text-red-600';
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Security Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security Score</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {auditResult ? (
                <span className={getGradeColor(auditResult.grade)}>
                  {auditResult.grade}
                </span>
              ) : (
                <span className="text-muted-foreground">--</span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {auditResult ? `${auditResult.score}% compliance` : 'Run audit to check'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Threats</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {threatHistory.filter(t => Date.now() - t.lastSeen < 300000).length}
            </div>
            <p className="text-xs text-muted-foreground">Last 5 minutes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Blocked IPs</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.blockedIPs.size}</div>
            <p className="text-xs text-muted-foreground">Currently blocked</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security Events</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recentEvents.length}</div>
            <p className="text-xs text-muted-foreground">Last 24 hours</p>
          </CardContent>
        </Card>
      </div>

      {/* Security Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Security Management</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-4">
          <Button onClick={runSecurityAudit} disabled={isRunningAudit}>
            <Shield className="w-4 h-4 mr-2" />
            {isRunningAudit ? 'Running Audit...' : 'Run Security Audit'}
          </Button>
          <Button onClick={testThreatDetection} variant="outline">
            <Zap className="w-4 h-4 mr-2" />
            Test Threat Detection
          </Button>
          <Button 
            onClick={() => advancedThreatDetector.clearThreatHistory()} 
            variant="outline"
          >
            <Eye className="w-4 h-4 mr-2" />
            Clear Threat History
          </Button>
        </CardContent>
      </Card>

      <Tabs defaultValue="audit" className="space-y-4">
        <TabsList>
          <TabsTrigger value="audit">Security Audit</TabsTrigger>
          <TabsTrigger value="threats">Threat Detection</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="events">Security Events</TabsTrigger>
        </TabsList>

        <TabsContent value="audit" className="space-y-4">
          {auditResult ? (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Audit Results</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{auditResult.passed}</div>
                      <div className="text-sm text-muted-foreground">Passed</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">{auditResult.failed}</div>
                      <div className="text-sm text-muted-foreground">Failed</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-600">{auditResult.warnings}</div>
                      <div className="text-sm text-muted-foreground">Warnings</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-800">{auditResult.critical}</div>
                      <div className="text-sm text-muted-foreground">Critical</div>
                    </div>
                  </div>
                  
                  <Progress value={auditResult.score} className="mb-4" />
                  
                  <div className="space-y-2">
                    {auditResult.results.map((result) => (
                      <div key={result.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          {result.status === 'pass' ? (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-600" />
                          )}
                          <div>
                            <div className="font-medium">{result.name}</div>
                            <div className="text-sm text-muted-foreground">{result.details}</div>
                          </div>
                        </div>
                        <Badge className={getSeverityColor(result.severity)}>
                          {result.severity}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {auditResult.recommendations.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Recommendations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {auditResult.recommendations.map((rec, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                          <span className="text-sm">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                Run a security audit to get detailed analysis of your application's security posture.
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>

        <TabsContent value="threats" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Threat Detection History</CardTitle>
            </CardHeader>
            <CardContent>
              {threatHistory.length === 0 ? (
                <p className="text-muted-foreground">No threats detected</p>
              ) : (
                <div className="space-y-3">
                  {threatHistory.map((threat, index) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{threat.key}</span>
                        <Badge variant="destructive">
                          {threat.count} attempts
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Last seen: {new Date(threat.lastSeen).toLocaleString()}
                      </div>
                      <details className="mt-2">
                        <summary className="text-xs cursor-pointer text-primary">
                          View events ({threat.events.length})
                        </summary>
                        <div className="mt-2 space-y-1">
                          {threat.events.slice(-3).map((event: any, eventIndex: number) => (
                            <div key={eventIndex} className="text-xs bg-muted p-2 rounded">
                              <div>Input: {event.input}</div>
                              <div>Time: {new Date(event.timestamp).toLocaleTimeString()}</div>
                            </div>
                          ))}
                        </div>
                      </details>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          {auditResult?.compliance ? (
            <div className="grid gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>GDPR Compliance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-2">
                    <span>Compliance Status</span>
                    <Badge variant={auditResult.compliance.gdpr.compliant ? "default" : "destructive"}>
                      {auditResult.compliance.gdpr.compliant ? "Compliant" : "Non-Compliant"}
                    </Badge>
                  </div>
                  <Progress value={auditResult.compliance.gdpr.score} className="mb-2" />
                  <div className="text-sm text-muted-foreground">
                    Score: {auditResult.compliance.gdpr.score}%
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>OWASP Compliance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-2">
                    <span>Compliance Status</span>
                    <Badge variant={auditResult.compliance.owasp.compliant ? "default" : "destructive"}>
                      {auditResult.compliance.owasp.compliant ? "Compliant" : "Non-Compliant"}
                    </Badge>
                  </div>
                  <Progress value={auditResult.compliance.owasp.score} className="mb-2" />
                  <div className="text-sm text-muted-foreground">
                    Score: {auditResult.compliance.owasp.score}%
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>ISO 27001 Compliance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-2">
                    <span>Compliance Status</span>
                    <Badge variant={auditResult.compliance.iso27001.compliant ? "default" : "destructive"}>
                      {auditResult.compliance.iso27001.compliant ? "Compliant" : "Non-Compliant"}
                    </Badge>
                  </div>
                  <Progress value={auditResult.compliance.iso27001.score} className="mb-2" />
                  <div className="text-sm text-muted-foreground">
                    Score: {auditResult.compliance.iso27001.score}%
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                Run a security audit to check compliance status.
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>

        <TabsContent value="events" className="space-y-4">
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
                        <Activity className="w-4 h-4" />
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
        </TabsContent>
      </Tabs>
    </div>
  );
};
