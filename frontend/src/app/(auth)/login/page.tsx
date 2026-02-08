'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { login } from '@/lib/auth'
import { loginSchema, LoginFormValues } from '@/lib/schemas'
import { Button } from '@/ui/Button'
import { Input } from '@/ui/Input'
import { Card } from '@/ui/Card'
import { Home, Mail, Lock, Loader2 } from 'lucide-react'

const LoginPage = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true)
    setError('')

    try {
      const { data: authData, error: loginError } = await login(data.email, data.password)
      if (loginError) throw loginError
      
      const user = authData.user
      const profile = authData.profile
      // Prioritize profile role, fallback to metadata
      const role = profile?.role || user?.user_metadata?.role

      if (role === 'admin') {
        router.push('/admin/dashboard')
      } else if (role === 'agent') {
        router.push('/agent/dashboard')
      } else if (role === 'seller') {
        router.push('/seller/dashboard')
      } else {
        router.push('/user/saved')
      }
      
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Failed to login')
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
          <h1 className="text-2xl font-bold text-slate-900">Welcome Back</h1>
          <p className="text-slate-500 mt-2">Sign in to your account to continue</p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg">
            {error}
          </div>
        )}

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

          <div className="space-y-1">
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              register={register}
              name="password"
              error={errors.password}
              prefix={<Lock className="w-4.5 h-4.5" />}
              required
            />
            <div className="text-right">
              <Link href="/forgot-password" summer-class="text-sm font-medium text-blue-600 hover:underline">
                Forgot password?
              </Link>
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-base transition-all active:scale-[0.98]"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Signing in...</span>
              </div>
            ) : (
              'Sign In'
            )}
          </Button>
        </form>

        <div className="mt-8 text-center text-sm text-slate-600">
          Don't have an account?{' '}
          <Link href="/signup" className="text-blue-600 font-semibold hover:underline">
            Create an account
          </Link>
        </div>
      </Card>
    </div>
  )
}

export default LoginPage
