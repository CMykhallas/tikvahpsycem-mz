
import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, Shield, Database, Activity } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { LeadsManagement } from './LeadsManagement'
import { UserRoleManagement } from './UserRoleManagement'
import { WebhookLogsViewer } from './WebhookLogsViewer'

export const AdminDashboard = () => {
  const { signOut, profile, userRole } = useAuth()

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {profile?.full_name || profile?.email} ({userRole})
          </p>
        </div>
        <Button onClick={handleSignOut} variant="outline">
          Sign Out
        </Button>
      </div>

      <Tabs defaultValue="leads" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="leads" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Leads
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Users
          </TabsTrigger>
          <TabsTrigger value="webhooks" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Webhooks
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            System
          </TabsTrigger>
        </TabsList>

        <TabsContent value="leads">
          <LeadsManagement />
        </TabsContent>

        <TabsContent value="users">
          <UserRoleManagement />
        </TabsContent>

        <TabsContent value="webhooks">
          <WebhookLogsViewer />
        </TabsContent>

        <TabsContent value="system">
          <Card>
            <CardHeader>
              <CardTitle>System Information</CardTitle>
              <CardDescription>
                System status and configuration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                  <span className="font-medium">Database Status</span>
                  <span className="text-green-600 font-medium">Connected</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                  <span className="font-medium">Authentication</span>
                  <span className="text-green-600 font-medium">Active</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                  <span className="font-medium">RLS Policies</span>
                  <span className="text-green-600 font-medium">Enabled</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                  <span className="font-medium">Security Headers</span>
                  <span className="text-green-600 font-medium">Active</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
