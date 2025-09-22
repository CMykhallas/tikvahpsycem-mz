
import { useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
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
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [userRole, setUserRole] = useState<'admin' | 'staff' | 'user' | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        
        // Defer additional data fetching to avoid auth callback issues
        if (session?.user) {
          setTimeout(() => {
            fetchUserProfile(session.user.id)
            fetchUserRole(session.user.id)
          }, 0)
        } else {
          setProfile(null)
          setUserRole(null)
        }
        setLoading(false)
      }
    )

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchUserProfile(session.user.id)
        fetchUserRole(session.user.id)
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
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

      setUserRole((data?.role as 'admin' | 'staff' | 'user') || 'user')
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
      
      // CRITICAL FIX: Add proper email redirect URL
      const redirectUrl = `${window.location.origin}/`
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
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
  const isAuthenticated = !!user && !!session

  return {
    user,
    session,
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
