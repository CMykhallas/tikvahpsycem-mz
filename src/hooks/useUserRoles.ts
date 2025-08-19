
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { toast } from 'sonner'

interface UserWithRole {
  id: string
  email: string
  full_name?: string
  created_at: string
  user_roles: {
    role: 'admin' | 'staff' | 'user'
  }[]
}

export const useUserRoles = () => {
  const queryClient = useQueryClient()

  const { data: users, isLoading, error } = useQuery({
    queryKey: ['users-with-roles'],
    queryFn: async () => {
      // First get all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select(`
          id,
          email,
          full_name,
          created_at
        `)
        .order('created_at', { ascending: false })

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError)
        throw profilesError
      }

      // Then get user roles for all users
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role')

      if (rolesError) {
        console.error('Error fetching user roles:', rolesError)
        throw rolesError
      }

      // Combine the data
      const usersWithRoles = profiles.map(profile => {
        const roles = userRoles
          .filter(role => role.user_id === profile.id)
          .map(role => ({ role: role.role as 'admin' | 'staff' | 'user' }))
        
        return {
          ...profile,
          user_roles: roles.length > 0 ? roles : [{ role: 'user' as const }]
        }
      })

      return usersWithRoles as UserWithRole[]
    },
  })

  const updateUserRole = useMutation({
    mutationFn: async ({ userId, newRole }: { userId: string; newRole: 'admin' | 'staff' | 'user' }) => {
      // First, delete existing roles for the user
      const { error: deleteError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId)

      if (deleteError) {
        console.error('Error deleting old roles:', deleteError)
        throw deleteError
      }

      // Then, insert the new role
      const { data, error } = await supabase
        .from('user_roles')
        .insert({ user_id: userId, role: newRole })
        .select()

      if (error) {
        console.error('Error updating user role:', error)
        throw error
      }

      return data[0]
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users-with-roles'] })
      toast.success('User role updated successfully')
    },
    onError: (error) => {
      console.error('Failed to update user role:', error)
      toast.error('Failed to update user role')
    },
  })

  return {
    users,
    isLoading,
    error,
    updateUserRole,
  }
}
