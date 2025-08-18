
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useUserRoles } from '@/hooks/useUserRoles'
import { formatDistanceToNow } from 'date-fns'
import { User, Calendar, Shield } from 'lucide-react'

export const UserRoleManagement = () => {
  const { users, isLoading, updateUserRole } = useUserRoles()

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800'
      case 'staff': return 'bg-blue-100 text-blue-800'
      case 'user': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const handleRoleUpdate = (userId: string, newRole: 'admin' | 'staff' | 'user') => {
    updateUserRole.mutate({ userId, newRole })
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
        <CardTitle>User Role Management</CardTitle>
        <CardDescription>
          Manage user roles and permissions ({users?.length || 0} users)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Current Role</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users?.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{user.email}</span>
                      </div>
                      {user.full_name && (
                        <div className="text-sm text-muted-foreground">{user.full_name}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getRoleColor(user.user_roles[0]?.role)}>
                      <Shield className="h-3 w-3 mr-1" />
                      {user.user_roles[0]?.role || 'user'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      {formatDistanceToNow(new Date(user.created_at), { addSuffix: true })}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={user.user_roles[0]?.role || 'user'}
                      onValueChange={(value) => 
                        handleRoleUpdate(user.id, value as 'admin' | 'staff' | 'user')
                      }
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="staff">Staff</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
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
