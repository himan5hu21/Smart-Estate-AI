import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: You *must* call auth.getUser() to run the method that refreshes the session
  const { data: { user } } = await supabase.auth.getUser()

  const path = request.nextUrl.pathname

  // Fetch real role from DB if user exists
  let userRole = user?.user_metadata?.role
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    if (profile) {
      userRole = profile.role
    }
  }

  // Define public paths that don't require authentication
  const isPublicPath = 
    path === '/' || 
    path.startsWith('/login') || 
    path.startsWith('/signup') || 
    path.startsWith('/forgot-password') || 
    path === '/auth/callback' ||
    path.startsWith('/agents') || // Public list of agents
    path.startsWith('/search') || // Public search
    path.startsWith('/property/'); // Public property details (note the trailing slash)

  // Special handling for /agent/[id] routes (public agent profiles)
  // These should be accessible without auth
  const isAgentPublicProfile = path.match(/^\/agent\/[^\/]+$/)

  // Dashboard routes that require authentication
  const isDashboardRoute = 
    path.startsWith('/admin/') ||
    path.startsWith('/agent/dashboard') ||
    path.startsWith('/agent/add-property') ||
    path.startsWith('/agent/leads') ||
    path.startsWith('/agent/my-listings') ||
    path.startsWith('/agent/onboarding') ||
    path.startsWith('/agent/profile') ||
    path.startsWith('/agent/property/') ||
    path.startsWith('/seller/') ||
    path.startsWith('/user/')

  // If user is logged in and tries to access auth pages, redirect to their dashboard
  if (user && (path.startsWith('/login') || path.startsWith('/signup') || path.startsWith('/forgot-password'))) {
    return NextResponse.redirect(new URL(getUserDashboard(userRole), request.url))
  }

  // Allow access to public paths
  if (isPublicPath || isAgentPublicProfile) {
    return supabaseResponse
  }

  // Protected routes logic - require authentication
  if (!user && isDashboardRoute) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Role-based access control for authenticated users
  if (user && isDashboardRoute) {
    // Admin routes - only admins can access
    if (path.startsWith('/admin/') && userRole !== 'admin') {
      return NextResponse.redirect(new URL(getUserDashboard(userRole), request.url))
    }

    // Agent routes - only agents can access (admins might be allowed too if you want)
    if ((path.startsWith('/agent/dashboard') || 
         path.startsWith('/agent/add-property') || 
         path.startsWith('/agent/leads') ||
         path.startsWith('/agent/my-listings') ||
         path.startsWith('/agent/onboarding') ||
         path.startsWith('/agent/profile') ||
         path.startsWith('/agent/property/')) && 
        userRole !== 'agent' && userRole !== 'admin') {
      return NextResponse.redirect(new URL(getUserDashboard(userRole), request.url))
    }

    // Seller routes - only sellers can access
    if (path.startsWith('/seller/') && userRole !== 'seller' && userRole !== 'admin') {
      return NextResponse.redirect(new URL(getUserDashboard(userRole), request.url))
    }

    // User/Buyer routes - only buyers can access (or you might want to allow all)
    if (path.startsWith('/user/') && userRole === 'admin') {
      // Optionally redirect admin away from user routes
      return NextResponse.redirect(new URL('/admin/dashboard', request.url))
    }
  }

  return supabaseResponse
}

function getUserDashboard(role: string | undefined) {
  switch (role) {
    case 'admin': return '/admin/dashboard'
    case 'agent': return '/agent/dashboard'
    case 'seller': return '/seller/dashboard'
    case 'buyer': return '/user/dashboard'
    default: return '/user/dashboard'
  }
}
