
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { LoginForm } from '@/components/auth/LoginForm'
import { useAuth } from '@/hooks/useAuth'

const AdminLogin = () => {
  const { isAuthenticated, isStaff, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading && isAuthenticated && isStaff) {
      navigate('/admin')
    }
  }, [isAuthenticated, isStaff, loading, navigate])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold">Admin Access</h2>
          <p className="mt-2 text-gray-600">Sign in to access the admin dashboard</p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}

export default AdminLogin
