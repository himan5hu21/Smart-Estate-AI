'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Home, Search, User, Menu, X, LogOut, PlusCircle, LayoutDashboard } from 'lucide-react'
import { logout, getCurrentUser } from '@/lib/auth'
import { Button } from '@/ui/Button'

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchUser = async () => {
      const currentUser = await getCurrentUser()
      setUser(currentUser)
    }
    fetchUser()
  }, [])

  const handleLogout = async () => {
    await logout()
    router.refresh()
    window.location.href = '/'
  }

  // Get role from profile (more reliable) or fallback to user_metadata
  const role = user?.profile?.role || user?.user_metadata?.role

  const navLinks = [
    { name: 'Home', href: '/', icon: <Home className="w-4 h-4" /> },
    { name: 'Search', href: '/search', icon: <Search className="w-4 h-4" /> },
    { name: 'Agents', href: '/agents', icon: <User className="w-4 h-4" /> },
  ]

  if (user) {
    switch (role) {
      case 'admin':
        navLinks.push({ name: 'Admin Panel', href: '/admin/dashboard', icon: <LayoutDashboard className="w-4 h-4" /> })
        break
      case 'agent':
        navLinks.push({ name: 'Dashboard', href: '/agent/dashboard', icon: <LayoutDashboard className="w-4 h-4" /> })
        break
      case 'seller':
        navLinks.push({ name: 'Dashboard', href: '/seller/dashboard', icon: <LayoutDashboard className="w-4 h-4" /> })
        break
      case 'buyer':
        navLinks.push({ name: 'Dashboard', href: '/user/dashboard', icon: <LayoutDashboard className="w-4 h-4" /> })
        break
      default:
        // Fallback for any other role
        navLinks.push({ name: 'Dashboard', href: '/user/dashboard', icon: <LayoutDashboard className="w-4 h-4" /> })
        break
    }
  }

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
                <Home className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold text-slate-900">SmartEstate</span>
            </Link>
            <div className="hidden sm:ml-8 sm:flex sm:space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="inline-flex items-center px-1 pt-1 text-sm font-medium text-slate-600 hover:text-blue-600 border-b-2 border-transparent hover:border-blue-600 transition-colors gap-2"
                >
                  {link.icon}
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4">
                <span className="text-sm text-slate-600 font-medium">
                  Hi, {user.user_metadata?.full_name || 'User'}
                </span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleLogout}
                  className="flex items-center gap-2 border-slate-200 text-slate-600 hover:text-red-600 hover:border-red-100"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link href="/login">
                  <Button variant="ghost" size="sm" className="text-slate-600">
                    Login
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>
          <div className="-mr-2 flex items-center sm:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-slate-400 hover:text-slate-500 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="sm:hidden bg-white border-b border-slate-200">
          <div className="pt-2 pb-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-slate-600 hover:bg-slate-50 hover:border-blue-600 hover:text-blue-600 flex items-center gap-3"
                onClick={() => setIsOpen(false)}
              >
                {link.icon}
                {link.name}
              </Link>
            ))}
          </div>
          <div className="pt-4 pb-3 border-t border-slate-200">
            {user ? (
              <div className="space-y-1">
                <div className="px-4 py-2 text-sm text-slate-500">
                  Logged in as {user.user_metadata?.full_name}
                </div>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-base font-medium text-slate-600 hover:bg-slate-50 hover:text-red-600 flex items-center gap-3"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            ) : (
              <div className="space-y-1 px-4 py-2">
                <Link href="/login" onClick={() => setIsOpen(false)}>
                  <Button variant="outline" className="w-full mb-2">Login</Button>
                </Link>
                <Link href="/signup" onClick={() => setIsOpen(false)}>
                  <Button className="w-full bg-blue-600 text-white">Sign Up</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar
