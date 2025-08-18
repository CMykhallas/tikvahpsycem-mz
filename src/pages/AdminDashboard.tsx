
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { AdminDashboard as AdminDashboardComponent } from '@/components/admin/AdminDashboard'
import { useAuth } from '@/hooks/useAuth'

const AdminDashboard = () => {
  const { isAuthenticated, isStaff, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading && (!isAuthenticated || !isStaff)) {
      navigate('/admin/login')
    }
  }, [isAuthenticated, isStaff, loading, navigate])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!isAuthenticated || !isStaff) {
    return null
  }

  return <AdminDashboardComponent />
}

export default AdminDashboard
