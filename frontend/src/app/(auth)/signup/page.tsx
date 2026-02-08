'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { signup } from '@/lib/auth'
import { signupSchema, SignupFormValues } from '@/lib/schemas'
import { Button } from '@/ui/Button'
import { Input } from '@/ui/Input'
import { Card } from '@/ui/Card'
import { Select } from '@/ui/Select'
import { Home, Mail, Lock, UserCircle, Loader2 } from 'lucide-react'

const SignupPage = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      role: 'buyer',
    },
  })

  const onSubmit = async (data: SignupFormValues) => {
    setIsLoading(true)
    setError('')

    try {
      const { error: signupError } = await signup(
        data.email, 
        data.password, 
        data.fullName, 
        data.role
      )
      if (signupError) throw signupError
      
      router.push('/login?message=Check your email to confirm registration')
    } catch (err: any) {
      console.error('Signup error:', err);
      // Specific check for common database trigger failure
      if (err.message?.toLowerCase().includes('database error') || err.message?.toLowerCase().includes('saving new user')) {
        setError('Database Error: The user was created but the profile could not be saved. Please ensure you have run the updated SQL trigger in Supabase.');
      } else {
        setError(err.message || 'Failed to sign up. Please try again.');
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-64px)] p-4 bg-slate-50">
      <Card className="w-full max-w-lg p-8 shadow-xl border-slate-200 my-8">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white mx-auto mb-4">
              <Home className="w-7 h-7" />
            </div>
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">Create Account</h1>
          <p className="text-slate-500 mt-2">Join SmartEstate and find your dream home</p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
          <Input
            label="Full Name"
            placeholder="John Doe"
            register={register}
            name="fullName"
            error={errors.fullName}
            prefix={<UserCircle className="w-4.5 h-4.5" />}
            required
          />

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

          <Select
            label="Register As"
            name="role"
            setValue={setValue}
            watch={watch}
            error={errors.role}
            searchable={false}
            clearable={false}
            options={[
              { label: 'Buyer', value: 'buyer' },
              { label: 'Seller', value: 'seller' },
              { label: 'Agent', value: 'agent' },
            ]}
          />

          <Button 
            type="submit" 
            className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-base transition-all active:scale-[0.98]"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Creating account...</span>
              </div>
            ) : (
              'Create Account'
            )}
          </Button>
        </form>

        <div className="mt-8 text-center text-sm text-slate-600">
          Already have an account?{' '}
          <Link href="/login" className="text-blue-600 font-semibold hover:underline">
            Sign in
          </Link>
        </div>
      </Card>
    </div>
  )
}

export default SignupPage
