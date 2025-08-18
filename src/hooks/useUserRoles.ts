
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
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          email,
          full_name,
          created_at,
          user_roles!inner (role)
        `)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching users with roles:', error)
        throw error
      }

      return data as UserWithRole[]
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
