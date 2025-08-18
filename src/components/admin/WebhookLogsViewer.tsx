
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useWebhookLogs } from '@/hooks/useWebhookLogs'
import { formatDistanceToNow } from 'date-fns'
import { Activity, Clock, AlertTriangle, CheckCircle } from 'lucide-react'

export const WebhookLogsViewer = () => {
  const { logs, isLoading, stats } = useWebhookLogs(50)

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return 'bg-green-100 text-green-800'
    if (status >= 400) return 'bg-red-100 text-red-800'
    return 'bg-yellow-100 text-yellow-800'
  }

  const getStatusIcon = (status: number) => {
    if (status >= 200 && status < 300) return <CheckCircle className="h-4 w-4" />
    if (status >= 400) return <AlertTriangle className="h-4 w-4" />
    return <Clock className="h-4 w-4" />
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="text-sm font-medium">Total Requests</p>
                  <p className="text-2xl font-bold">{stats.totalRequests}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <div>
                  <p className="text-sm font-medium">Success Rate</p>
                  <p className="text-2xl font-bold">{stats.successRate.toFixed(1)}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <div>
                  <p className="text-sm font-medium">Errors</p>
                  <p className="text-2xl font-bold">{stats.errorRequests}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-yellow-600" />
                <div>
                  <p className="text-sm font-medium">Avg Time</p>
                  <p className="text-2xl font-bold">{stats.averageProcessingTime}ms</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Webhook Logs</CardTitle>
          <CardDescription>
            Recent webhook requests and responses ({logs?.length || 0} entries)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Endpoint</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Processing Time</TableHead>
                  <TableHead>Timestamp</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs?.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      <div className="font-mono text-sm">{log.endpoint}</div>
                      {log.error_message && (
                        <div className="text-xs text-red-600 mt-1">{log.error_message}</div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{log.method}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(log.response_status)}
                        <Badge className={getStatusColor(log.response_status)}>
                          {log.response_status}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {log.processing_time_ms ? `${log.processing_time_ms}ms` : 'N/A'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
