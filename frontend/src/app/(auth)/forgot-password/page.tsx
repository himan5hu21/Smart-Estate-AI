'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { forgotPasswordSchema, ForgotPasswordFormValues } from '@/lib/schemas'
import { Button } from '@/ui/Button'
import { Input } from '@/ui/Input'
import { Card } from '@/ui/Card'
import { Home, Mail, Loader2, ArrowLeft } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'

const ForgotPasswordPage = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  })

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    setIsLoading(true)
    setError('')
    setSuccess(false)

    try {
      const supabase = createClient()
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/dashboard/reset-password`,
      })
      
      if (resetError) throw resetError
      
      setSuccess(true)
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-64px)] p-4 bg-slate-50">
      <Card className="w-full max-w-md p-8 shadow-xl border-slate-200">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white mx-auto mb-4">
              <Home className="w-7 h-7" />
            </div>
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">Forgot Password?</h1>
          <p className="text-slate-500 mt-2">No worries, we'll send you reset instructions.</p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg">
            {error}
          </div>
        )}

        {success ? (
          <div className="text-center space-y-6">
            <div className="p-4 bg-green-50 border border-green-100 text-green-700 rounded-lg">
              Check your email for a password reset link.
            </div>
            <Link href="/login" className="inline-flex items-center text-blue-600 font-semibold hover:underline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Sign In
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
            <Input
              label="Email Address"
              type="email"
              placeholder="name@example.com"
              register={register}
              name="email"
              error={errors.email}
              prefix={<Mail className="w-4.5 h-4.5" />}
              required
            />

            <Button 
              type="submit" 
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-base transition-all active:scale-[0.98]"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Sending instructions...</span>
                </div>
              ) : (
                'Reset Password'
              )}
            </Button>

            <div className="text-center">
              <Link href="/login" className="inline-flex items-center text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Sign In
              </Link>
            </div>
          </form>
        )}
      </Card>
    </div>
  )
}

export default ForgotPasswordPage
