import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { User, Phone, Mail, Building } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { usersService } from '../services/api'
import toast from 'react-hot-toast'

const profileSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
})

type ProfileFormData = z.infer<typeof profileSchema>

interface UserProfile {
  id: string
  phone: string
  name?: string
  email?: string
  role: string
  isActive: boolean
  company?: {
    id: string
    name: string
    description?: string
  }
  createdAt: string
  updatedAt: string
}

export default function ProfilePage() {
  const { updateUser } = useAuthStore()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: '',
      email: '',
    },
  })

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const data = await usersService.getProfile()
      setProfile(data)
      form.reset({
        name: data.name || '',
        email: data.email || '',
      })
    } catch (error) {
      toast.error('Failed to load profile')
    } finally {
      setIsLoading(false)
    }
  }

  const onSubmit = async (data: ProfileFormData) => {
    setIsSaving(true)
    try {
      const updatedProfile = await usersService.updateProfile({
        name: data.name || undefined,
        email: data.email || undefined,
      })
      setProfile(updatedProfile)
      updateUser({
        name: updatedProfile.name,
        email: updatedProfile.email,
      })
      toast.success('Profile updated successfully')
    } catch (error) {
      toast.error('Failed to update profile')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (!profile) {
    return <div>Failed to load profile</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
        <p className="text-gray-600">Manage your account information</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Information */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Update your personal details</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label="Full Name"
                placeholder="Enter your full name"
                {...form.register('name')}
                error={form.formState.errors.name?.message}
              />
              
              <Input
                label="Email Address"
                type="email"
                placeholder="Enter your email address"
                {...form.register('email')}
                error={form.formState.errors.email?.message}
              />
              
              <Input
                label="Phone Number"
                value={profile.phone}
                disabled
                className="bg-gray-50"
              />
              
              <Button type="submit" loading={isSaving} disabled={!form.formState.isValid}>
                Save Changes
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Account Details */}
        <Card>
          <CardHeader>
            <CardTitle>Account Details</CardTitle>
            <CardDescription>Your account information and settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-primary-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">
                  {profile.name || 'No name set'}
                </p>
                <p className="text-sm text-gray-500">{profile.role}</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-sm">
                <Phone className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">{profile.phone}</span>
              </div>
              
              {profile.email && (
                <div className="flex items-center space-x-3 text-sm">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">{profile.email}</span>
                </div>
              )}
              
              {profile.company && (
                <div className="flex items-center space-x-3 text-sm">
                  <Building className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">{profile.company.name}</span>
                </div>
              )}
            </div>
            
            <div className="pt-4 border-t border-gray-200">
              <div className="text-sm text-gray-500">
                <p>Member since: {new Date(profile.createdAt).toLocaleDateString()}</p>
                <p>Last updated: {new Date(profile.updatedAt).toLocaleDateString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Company Information */}
      {profile.company && (
        <Card>
          <CardHeader>
            <CardTitle>Company Information</CardTitle>
            <CardDescription>Details about your organization</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <h4 className="font-medium text-gray-900">{profile.company.name}</h4>
                {profile.company.description && (
                  <p className="text-sm text-gray-600 mt-1">{profile.company.description}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
