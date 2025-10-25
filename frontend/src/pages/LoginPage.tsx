import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card'
import { useAuthStore } from '../store/authStore'
import { authService } from '../services/api'

const phoneSchema = z.object({
  phone: z.string().min(1, 'Phone number is required').regex(/^\+[1-9]\d{1,14}$/, 'Invalid phone number format'),
})

const otpSchema = z.object({
  code: z.string().length(6, 'OTP must be 6 digits').regex(/^\d{6}$/, 'OTP must contain only digits'),
})

type PhoneFormData = z.infer<typeof phoneSchema>
type OtpFormData = z.infer<typeof otpSchema>

export default function LoginPage() {
  const [step, setStep] = useState<'phone' | 'otp'>('phone')
  const [phone, setPhone] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { login, isAuthenticated } = useAuthStore()
  const navigate = useNavigate()

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true })
    }
  }, [isAuthenticated, navigate])

  // Auto focus on OTP input when switching to OTP step
  useEffect(() => {
    if (step === 'otp') {
      // Small delay to ensure the input is rendered
      setTimeout(() => {
        const otpInput = document.getElementById('otp-input') as HTMLInputElement
        if (otpInput) {
          otpInput.focus()
        }
      }, 100)
    }
  }, [step])

  const phoneForm = useForm<PhoneFormData>({
    resolver: zodResolver(phoneSchema),
  })

  const otpForm = useForm<OtpFormData>({
    resolver: zodResolver(otpSchema),
  })

  const onPhoneSubmit = async (data: PhoneFormData) => {
    setIsLoading(true)
    try {
      await authService.sendOtp(data.phone)
      setPhone(data.phone)
      setStep('otp')
      // Clear OTP form when switching to OTP step
      otpForm.reset()
      toast.success('OTP sent successfully!')
    } catch (error) {
      toast.error('Failed to send OTP')
    } finally {
      setIsLoading(false)
    }
  }

  const onOtpSubmit = async (data: OtpFormData) => {
    setIsLoading(true)
    try {
      await login(phone, data.code)
      toast.success('Login successful!')
      // Navigation will be handled by the useEffect hook when isAuthenticated changes
    } catch (error) {
      toast.error('Invalid OTP')
    } finally {
      setIsLoading(false)
    }
  }

  const handleBackToPhone = () => {
    setStep('phone')
    otpForm.reset()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-primary-600">OfficeFood</h1>
          <p className="mt-2 text-sm text-gray-600">
            Group food orders for office teams
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              {step === 'phone' ? 'Enter your phone number' : 'Enter verification code'}
            </CardTitle>
            <CardDescription>
              {step === 'phone'
                ? 'We\'ll send you a verification code via SMS'
                : `We sent a 6-digit code to ${phone}`
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {step === 'phone' ? (
              <form onSubmit={phoneForm.handleSubmit(onPhoneSubmit)} className="space-y-4">
                <Input
                  label="Phone Number"
                  placeholder="+1234567890"
                  {...phoneForm.register('phone')}
                  error={phoneForm.formState.errors.phone?.message}
                />
                <Button
                  type="submit"
                  className="w-full"
                  loading={isLoading}
                  disabled={!phoneForm.formState.isValid}
                >
                  Send OTP
                </Button>
              </form>
            ) : (
              <form onSubmit={otpForm.handleSubmit(onOtpSubmit)} className="space-y-4">
                <Input
                  label="Verification Code"
                  placeholder="123456"
                  maxLength={6}
                  id="otp-input"
                  {...otpForm.register('code')}
                  error={otpForm.formState.errors.code?.message}
                />
                <div className="flex space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={handleBackToPhone}
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1"
                    loading={isLoading}
                    disabled={!otpForm.formState.isValid}
                  >
                    Verify
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>

        {import.meta.env.MODE === 'development' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <p className="text-sm text-yellow-800">
              <strong>Development Mode:</strong> Use OTP code <code className="bg-yellow-100 px-1 rounded">123456</code> for testing
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
