
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
      const { data, error } = await (supabase as any)
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle()

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
      const { data, error } = await (supabase as any)
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
        toast.error('Email ou senha inválidos. Tente novamente.')
        return false
      }

      toast.success('Login realizado com sucesso!')
      return true
    } catch (error) {
      console.error('Erro no login:', error)
      toast.error('Ocorreu um erro durante o login. Tente novamente.')
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
        if (error.message.includes('User already registered')) {
          toast.error('Este email já está registrado. Tente fazer login.')
        } else if (error.message.includes('Invalid email')) {
          toast.error('Email inválido. Verifique e tente novamente.')
        } else if (error.message.includes('Password')) {
          toast.error('A senha deve ter pelo menos 6 caracteres.')
        } else {
          toast.error('Erro ao criar conta. Tente novamente.')
        }
        return false
      }

      toast.success('Conta criada com sucesso! Verifique seu email para confirmar.')
      return true
    } catch (error) {
      console.error('Erro no cadastro:', error)
      toast.error('Ocorreu um erro durante o cadastro. Tente novamente.')
      return false
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        toast.error('Erro ao sair. Tente novamente.')
        return false
      }
      toast.success('Logout realizado com sucesso!')
      return true
    } catch (error) {
      console.error('Erro no logout:', error)
      toast.error('Ocorreu um erro ao sair. Tente novamente.')
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
