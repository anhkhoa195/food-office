import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Plus, Calendar, Clock, Users } from 'lucide-react'
import { formatDateTime } from '../utils/format'
import { ordersService } from '../services/api'
import toast from 'react-hot-toast'

interface OrderSession {
  id: string
  title: string
  description?: string
  startTime: string
  endTime: string
  isActive: boolean
  createdAt: string
  createdBy: {
    id: string
    name?: string
    phone: string
  }
  orderCount: number
}

export default function OrderSessionsPage() {
  const [sessions, setSessions] = useState<OrderSession[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showActiveOnly, setShowActiveOnly] = useState(false)

  useEffect(() => {
    fetchSessions()
  }, [showActiveOnly])

  const fetchSessions = async () => {
    try {
      const data = await ordersService.getOrderSessions({ 
        active: showActiveOnly ? true : undefined 
      })
      setSessions(data)
    } catch (error) {
      toast.error('Failed to load order sessions')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteSession = async (id: string) => {
    if (!confirm('Are you sure you want to delete this order session?')) {
      return
    }

    try {
      await ordersService.deleteOrderSession(id)
      toast.success('Order session deleted successfully')
      fetchSessions()
    } catch (error) {
      toast.error('Failed to delete order session')
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Order Sessions</h1>
          <p className="text-gray-600">Manage group food order sessions</p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant={showActiveOnly ? 'primary' : 'outline'}
            onClick={() => setShowActiveOnly(!showActiveOnly)}
          >
            Active Only
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Session
          </Button>
        </div>
      </div>

      {sessions.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No order sessions</h3>
            <p className="text-gray-500 mb-4">
              {showActiveOnly 
                ? 'No active order sessions at the moment'
                : 'Create your first order session to get started'
              }
            </p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Order Session
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sessions.map((session) => (
            <Card key={session.id} className={`${!session.isActive ? 'opacity-60' : ''}`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{session.title}</CardTitle>
                    {session.description && (
                      <CardDescription className="mt-1">
                        {session.description}
                      </CardDescription>
                    )}
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    session.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {session.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>{formatDateTime(session.startTime)}</span>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="h-4 w-4 mr-2" />
                    <span>Ends: {formatDateTime(session.endTime)}</span>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <Users className="h-4 w-4 mr-2" />
                    <span>{session.orderCount} orders</span>
                  </div>
                  
                  <div className="text-xs text-gray-500">
                    Created by {session.createdBy.name || session.createdBy.phone}
                  </div>
                </div>
                
                <div className="flex space-x-2 mt-4">
                  <Button size="sm" className="flex-1">
                    View Orders
                  </Button>
                  <Button size="sm" variant="outline">
                    Edit
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleDeleteSession(session.id)}
                  >
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
