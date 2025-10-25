import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Plus, Search, Filter, RefreshCw } from 'lucide-react'
import { formatCurrency } from '../utils/format'
import { menuService, authService } from '../services/api'
import { useAuthStore } from '../store/authStore'
import { customToast } from '../utils/toast'

interface MenuItem {
  id: string
  name: string
  description?: string
  price: number
  category: string
  imageUrl?: string
  isAvailable: boolean
}

export default function MenuPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [showAvailableOnly, setShowAvailableOnly] = useState(false)
  const [hasError, setHasError] = useState(false)
  const { isAuthenticated } = useAuthStore()

  const fetchMenuData = async () => {
    setIsLoading(true)
    setHasError(false)
    
    // Debug: Check auth state
    const authState = useAuthStore.getState()
    console.log('Auth state:', {
      isAuthenticated: authState.isAuthenticated,
      hasAccessToken: !!authState.accessToken,
      hasUser: !!authState.user,
      userCompanyId: authState.user?.companyId
    })
    
    try {
      const [items, cats] = await Promise.all([
        menuService.getMenuItems(),
        menuService.getCategories(),
      ])
      setMenuItems(items || [])
      setCategories(cats || [])
    } catch (error: any) {
      console.error('Menu data fetch error:', error)
      console.error('Error response:', error.response?.data)
      setHasError(true)
      
      // Handle specific error cases
      if (error.response?.status === 401) {
        // Check if we have a refresh token to try
        const { refreshToken, refreshTokens } = useAuthStore.getState()
        if (refreshToken) {
          try {
            await refreshTokens()
            // Retry the request after token refresh
            return fetchMenuData()
          } catch (refreshError) {
            console.error('Token refresh failed:', refreshError)
            customToast.error('Session expired. Please login again.')
            // Force logout and redirect
            useAuthStore.getState().logout()
            window.location.href = '/login'
            return
          }
        } else {
          customToast.error('Please login to view menu items')
          useAuthStore.getState().logout()
          window.location.href = '/login'
        }
      } else if (error.response?.status === 403) {
        customToast.error('You do not have permission to view menu items')
      } else if (error.response?.status >= 500) {
        customToast.error('Server error. Please try again later.')
      } else if (error.code === 'NETWORK_ERROR' || !error.response) {
        customToast.error('Network error. Please check your connection.')
      } else {
        const message = error.response?.data?.message || error.message || 'Failed to load menu items'
        customToast.error(message)
      }
      
      // Set empty arrays to prevent UI errors
      setMenuItems([])
      setCategories(['Main Dishes', 'Appetizers', 'Beverages', 'Desserts']) // Fallback categories
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    // Check auth state on mount
    const authState = useAuthStore.getState()
    console.log('MenuPage mount - Auth check:', {
      isAuthenticated,
      hasToken: !!authState.accessToken,
      hasUser: !!authState.user
    })
    
    if (isAuthenticated && authState.accessToken && authState.user) {
      fetchMenuData()
    } else if (!isAuthenticated) {
      console.log('User not authenticated, checking localStorage...')
      // Try to restore auth state
      authState.checkAuth()
    }
  }, [isAuthenticated])

  // Additional effect to handle auth state changes
  useEffect(() => {
    const authState = useAuthStore.getState()
    
    // If we have token but no user data, something went wrong
    if (isAuthenticated && !authState.user) {
      console.log('Auth state inconsistent, forcing logout')
      authState.logout()
    }
  }, [isAuthenticated])

  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !selectedCategory || item.category === selectedCategory
    const matchesAvailability = !showAvailableOnly || item.isAvailable
    
    return matchesSearch && matchesCategory && matchesAvailability
  })

  const groupedItems = filteredItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = []
    }
    acc[item.category].push(item)
    return acc
  }, {} as Record<string, MenuItem[]>)

  // Show message if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="h-full flex flex-col">
        <div className="flex-1 flex items-center justify-center">
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-gray-500 mb-4">Please login to view menu items</p>
              <Button onClick={() => window.location.href = '/login'}>
                Go to Login
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="h-full flex flex-col">
        <div className="animate-pulse">
          <div className="h-6 sm:h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="flex-1 overflow-y-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-40 sm:h-48 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header - Fixed */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 sm:mb-6 flex-shrink-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Menu</h1>
          <p className="text-sm sm:text-base text-gray-600">Browse and manage menu items</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={async () => {
              try {
                customToast.loading('Attempting test login...')
                
                // First send OTP
                await authService.sendOtp('+1234567890')
                console.log('OTP sent')
                
                // Then verify with dev OTP
                const { login } = useAuthStore.getState()
                await login('+1234567890', '123456')
                
                customToast.dismiss() // Remove loading toast
                customToast.success('Test login successful!')
                
                // Fetch data after successful login
                setTimeout(() => {
                  fetchMenuData()
                }, 1000)
              } catch (error: any) {
                customToast.dismiss()
                console.error('Test login failed:', error)
                console.error('Error response:', error.response?.data)
                customToast.error(`Test login failed: ${error.response?.data?.message || error.message}`)
              }
            }}
            variant="outline"
            size="sm"
          >
            Test Login
          </Button>
          <Button
            onClick={() => {
              const authState = useAuthStore.getState()
              console.log('Debug Auth State:', authState)
              customToast.success(`Auth: ${authState.isAuthenticated}, User: ${!!authState.user}`)
            }}
            variant="outline"
            size="sm"
          >
            Debug Auth
          </Button>
          <Button
            onClick={() => customToast.success('Test success toast - click to dismiss!')}
            variant="outline"
            size="sm"
          >
            Test Toast
          </Button>
          <Button className="self-start sm:self-center">
            <Plus className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Add Item</span>
            <span className="sm:hidden">Add</span>
          </Button>
        </div>
      </div>

      {/* Filters - Fixed */}
      <Card className="mb-4 sm:mb-6 flex-shrink-0">
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search menu items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="input min-w-0 sm:min-w-[150px]"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              
              <Button
                variant={showAvailableOnly ? 'primary' : 'outline'}
                onClick={() => setShowAvailableOnly(!showAvailableOnly)}
                className="whitespace-nowrap"
              >
                <Filter className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Available Only</span>
                <span className="sm:hidden">Available</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Menu Items - Scrollable */}
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-6 pb-6">
          {Object.keys(groupedItems).length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-gray-500 mb-4">
                  {hasError ? 'Failed to load menu items' : 'No menu items found'}
                </p>
                {hasError && (
                  <Button onClick={fetchMenuData} variant="outline">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Try Again
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            Object.entries(groupedItems).map(([category, items]) => (
              <div key={category}>
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4 sticky top-0 bg-gray-50 py-2 z-10">
                  {category}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-6">
                  {items.map((item) => (
                    <Card key={item.id} className={`${!item.isAvailable ? 'opacity-60' : ''} transition-all duration-200 hover:shadow-md`}>
                      {item.imageUrl && (
                        <div className="h-36 sm:h-40 lg:h-48 bg-gray-200 rounded-t-lg overflow-hidden">
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-full h-full object-cover transition-transform duration-200 hover:scale-105"
                          />
                        </div>
                      )}
                      <CardHeader className="p-3 sm:p-4">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-base sm:text-lg truncate">{item.name}</CardTitle>
                            {item.description && (
                              <CardDescription className="mt-1 text-sm line-clamp-2">
                                {item.description}
                              </CardDescription>
                            )}
                          </div>
                          <span className={`px-2 py-1 text-xs rounded-full whitespace-nowrap flex-shrink-0 ${
                            item.isAvailable 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {item.isAvailable ? 'Available' : 'Unavailable'}
                          </span>
                        </div>
                      </CardHeader>
                      <CardContent className="p-3 sm:p-4 pt-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-lg sm:text-xl lg:text-2xl font-bold text-primary-600 truncate">
                            {formatCurrency(item.price)}
                          </span>
                          <div className="flex space-x-1 sm:space-x-2 flex-shrink-0">
                            <Button size="sm" variant="outline" className="text-xs px-2 py-1">
                              Edit
                            </Button>
                            <Button size="sm" variant="outline" className="text-xs px-2 py-1">
                              Delete
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
