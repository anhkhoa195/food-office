import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import { useEffect } from 'react'
import toast from 'react-hot-toast'
import Layout from './layouts/Layout'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import MenuPage from './pages/MenuPage'
import OrderSessionsPage from './pages/OrderSessionsPage'
import OrdersPage from './pages/OrdersPage'
import ReportsPage from './pages/ReportsPage'
import ProfilePage from './pages/ProfilePage'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  const { checkAuth } = useAuthStore()

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  // Add global click handler for toast dismissal
  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const target = event.target as Element
      
      // Check if click is on a toast element
      const toastElement = target.closest('[data-hot-toast]') || 
                          target.closest('[role="status"]') ||
                          target.closest('.Toaster__toast')
      
      if (toastElement) {
        // Get toast ID if available
        const toastId = toastElement.getAttribute('data-hot-toast') ||
                       toastElement.getAttribute('data-toast-id')
        
        if (toastId) {
          toast.dismiss(toastId)
        } else {
          // Dismiss the most recent toast if no specific ID
          toast.dismiss()
        }
      }
    }

    document.addEventListener('click', handleClick)
    
    return () => {
      document.removeEventListener('click', handleClick)
    }
  }, [])

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="menu" element={<MenuPage />} />
        <Route path="order-sessions" element={<OrderSessionsPage />} />
        <Route path="orders" element={<OrdersPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>
    </Routes>
  )
}

export default App
