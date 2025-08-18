
import { useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/integrations/supabase/client'
import { toast } from 'sonner'

interface Profile {
  id: string
  email: string
  full_name?: string
  created_at: string
  updated_at: string
}

interface UserRole {
  id: string
  user_id: string
  role: 'admin' | 'staff' | 'user'
  created_at: string
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [userRole, setUserRole] = useState<'admin' | 'staff' | 'user' | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchUserProfile(session.user.id)
        fetchUserRole(session.user.id)
      }
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
        if (session?.user) {
          fetchUserProfile(session.user.id)
          fetchUserRole(session.user.id)
        } else {
          setProfile(null)
          setUserRole(null)
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Error fetching profile:', error)
        return
      }

      setProfile(data)
    } catch (error) {
      console.error('Error fetching profile:', error)
    }
  }

  const fetchUserRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user role:', error)
        return
      }

      setUserRole(data?.role || 'user')
    } catch (error) {
      console.error('Error fetching user role:', error)
      setUserRole('user')
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        toast.error(error.message)
        return false
      }

      toast.success('Signed in successfully')
      return true
    } catch (error) {
      console.error('Sign in error:', error)
      toast.error('An error occurred during sign in')
      return false
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email: string, password: string, fullName?: string) => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      })

      if (error) {
        toast.error(error.message)
        return false
      }

      toast.success('Account created! Please check your email to verify your account.')
      return true
    } catch (error) {
      console.error('Sign up error:', error)
      toast.error('An error occurred during sign up')
      return false
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        toast.error(error.message)
        return false
      }
      toast.success('Signed out successfully')
      return true
    } catch (error) {
      console.error('Sign out error:', error)
      toast.error('An error occurred during sign out')
      return false
    }
  }

  const isAdmin = userRole === 'admin'
  const isStaff = userRole === 'staff' || userRole === 'admin'
  const isAuthenticated = !!user

  return {
    user,
    profile,
    userRole,
    loading,
    isAdmin,
    isStaff,
    isAuthenticated,
    signIn,
    signUp,
    signOut,
  }
}
