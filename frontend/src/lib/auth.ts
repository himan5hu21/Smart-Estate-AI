'use server'

import { createClient } from '@/utils/supabase/server'

export async function login(email: string, password: string) {
  const supabase = await createClient()
  const authResponse = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (authResponse.error) {
    return { data: { user: null, profile: null }, error: authResponse.error }
  }

  if (authResponse.data.user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authResponse.data.user.id)
      .single()
    
    return { 
      data: { 
        user: authResponse.data.user, 
        profile 
      }, 
      error: null 
    }
  }

  return { data: { user: null, profile: null }, error: new Error('Login failed') }
}

export async function signup(email: string, password: string, fullName: string, role: string) {
  const supabase = await createClient()
  return await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        role: role,
      },
    },
  })
}

export async function logout() {
  const supabase = await createClient()
  return await supabase.auth.signOut()
}

export async function getCurrentUser() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return {
    ...user,
    profile,
  }
}
