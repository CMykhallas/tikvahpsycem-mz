
import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useLeads } from '@/hooks/useLeads'
import { formatDistanceToNow } from 'date-fns'
import { Mail, Phone, Calendar, Tag } from 'lucide-react'

export const LeadsManagement = () => {
  const { leads, isLoading, updateLeadStatus } = useLeads()
  const [selectedStatus, setSelectedStatus] = useState<string>('all')

  const filteredLeads = leads?.filter(lead => 
    selectedStatus === 'all' || lead.status === selectedStatus
  ) || []

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800'
      case 'contacted': return 'bg-yellow-100 text-yellow-800'
      case 'qualified': return 'bg-green-100 text-green-800'
      case 'converted': return 'bg-purple-100 text-purple-800'
      case 'closed': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const handleStatusUpdate = (leadId: string, newStatus: 'new' | 'contacted' | 'qualified' | 'converted' | 'closed') => {
    updateLeadStatus.mutate({ id: leadId, status: newStatus })
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
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Leads Management</CardTitle>
            <CardDescription>
              Manage and track customer leads ({filteredLeads.length} total)
            </CardDescription>
          </div>
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="contacted">Contacted</SelectItem>
              <SelectItem value="qualified">Qualified</SelectItem>
              <SelectItem value="converted">Converted</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Contact</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLeads.map((lead) => (
                <TableRow key={lead.id}>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{lead.email}</span>
                      </div>
                      {lead.name && (
                        <div className="text-sm text-muted-foreground">{lead.name}</div>
                      )}
                      {lead.phone && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Phone className="h-3 w-3" />
                          {lead.phone}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <Badge variant="outline">{lead.source}</Badge>
                      {lead.campaign_id && (
                        <div className="text-xs text-muted-foreground">
                          Campaign: {lead.campaign_id}
                        </div>
                      )}
                      {lead.keyword && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Tag className="h-3 w-3" />
                          {lead.keyword}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(lead.status)}>
                      {lead.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      {formatDistanceToNow(new Date(lead.created_at), { addSuffix: true })}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={lead.status}
                      onValueChange={(value) => 
                        handleStatusUpdate(lead.id, value as 'new' | 'contacted' | 'qualified' | 'converted' | 'closed')
                      }
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="contacted">Contacted</SelectItem>
                        <SelectItem value="qualified">Qualified</SelectItem>
                        <SelectItem value="converted">Converted</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
