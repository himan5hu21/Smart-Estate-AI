'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Search, Home, MapPin, TrendingUp, ShieldCheck, Clock, Users } from 'lucide-react'
import { Button } from '@/ui/Button'
import { Input } from '@/ui/Input'
import PropertyCard from '@/components/PropertyCard'
import { getProperties, getCurrentUser } from '@/lib/api'

const HomePage = () => {
  const [query, setQuery] = useState('')
  const [trendingProperties, setTrendingProperties] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Check if user is logged in and redirect to their dashboard
  useEffect(() => {
    const checkUserAndRedirect = async () => {
      try {
        const user = await getCurrentUser()
        if (user?.profile?.role) {
          const role = user.profile.role
          switch (role) {
            case 'admin':
              router.push('/admin/dashboard')
              break
            case 'agent':
              router.push('/agent/dashboard')
              break
            case 'seller':
              router.push('/seller/dashboard')
              break
            case 'buyer':
              router.push('/user/dashboard')
              break
            default:
              router.push('/user/dashboard')
          }
        }
      } catch (error) {
        // User not logged in, stay on homepage
        console.log('User not logged in, showing public homepage')
      }
    }
    checkUserAndRedirect()
  }, [router])

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const data = await getProperties({ status: 'active' })
        setTrendingProperties(data.slice(0, 6))
      } catch (error) {
        console.error('Failed to fetch trending properties:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchTrending()
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/search?location=${encodeURIComponent(query)}`)
    } else {
      router.push('/search')
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[700px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
            alt="Hero Background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px]"></div>
        </div>

        <div className="relative z-10 max-w-5xl w-full px-4 text-center">
          <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 leading-tight">
            Find Your <span className="text-blue-400">Dream Estate</span> <br /> 
            Powered by AI
          </h1>
          <p className="text-xl md:text-2xl text-slate-200 mb-12 max-w-3xl mx-auto font-light">
            SmartEstate utilizes cutting-edge AI to match you with properties that perfectly fit your lifestyle and budget.
          </p>

          <form 
            onSubmit={handleSearch}
            className="bg-white/10 backdrop-blur-md p-3 rounded-3xl border border-white/20 shadow-2xl flex flex-col md:flex-row gap-3 max-w-4xl mx-auto"
          >
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-white/70">
                <Search className="w-6 h-6" />
              </div>
              <input
                type="text"
                placeholder="Where would you like to live?"
                className="w-full pl-14 h-16 bg-white/10 border-none focus:ring-2 focus:ring-blue-400 text-white text-xl placeholder:text-white/50 rounded-2xl outline-none"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <Button 
              type="submit"
              className="md:w-44 h-16 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xl rounded-2xl shadow-lg transition-transform active:scale-95"
            >
              Find Home
            </Button>
          </form>

          <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-white/90 text-sm md:text-base">
            <span className="flex items-center gap-3"><MapPin className="w-5 h-5 text-blue-400" /> Premium Locations</span>
            <span className="flex items-center gap-3"><TrendingUp className="w-5 h-5 text-blue-400" /> Market Intelligence</span>
            <span className="flex items-center gap-3"><ShieldCheck className="w-5 h-5 text-blue-400" /> Secure Transactions</span>
          </div>
        </div>
      </section>

      {/* Trending Properties Section */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-end mb-16">
            <div>
              <h2 className="text-4xl font-bold text-slate-900 mb-4">Trending Properties</h2>
              <p className="text-slate-500 text-lg">The most viewed and sought-after listings this week.</p>
            </div>
            <Link href="/search" className="text-blue-600 font-bold hover:text-blue-700 flex items-center gap-2 group text-lg">
              View all <TrendingUp className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-[450px] bg-slate-100 animate-pulse rounded-3xl"></div>
              ))}
            </div>
          ) : trendingProperties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {trendingProperties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          ) : (
            <div className="text-center py-24 bg-slate-50 rounded-[40px] border-2 border-dashed border-slate-200">
              <Home className="w-16 h-16 text-slate-300 mx-auto mb-6" />
              <p className="text-slate-500 text-xl font-medium">No properties found at the moment.</p>
            </div>
          )}
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-24 px-4 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-bold text-slate-900 mb-6">Why Choose SmartEstate?</h2>
            <p className="text-slate-500 text-xl max-w-3xl mx-auto">We're redefining real estate with technology and transparency.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              {
                title: 'AI-Powered Insights',
                desc: 'Our proprietary algorithms help you find undervalued properties and predict market trends with high accuracy.',
                icon: <TrendingUp className="w-10 h-10 text-blue-600" />
              },
              {
                title: 'Professional Agents',
                desc: 'Connect with verified top-tier agents who have deep knowledge of local markets and legal complexities.',
                icon: <Users className="w-10 h-10 text-blue-600" />
              },
              {
                title: 'Virtual Tours',
                desc: 'Experience properties from anywhere in the world with our high-definition 3D virtual tour integrations.',
                icon: <Home className="w-10 h-10 text-blue-600" />
              }
            ].map((item, idx) => (
              <div key={idx} className="bg-white p-10 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl transition-all hover:-translate-y-2 group">
                <div className="w-20 h-20 bg-blue-50 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-blue-600 transition-colors">
                  <div className="group-hover:text-white transition-colors">
                    {item.icon}
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">{item.title}</h3>
                <p className="text-slate-500 leading-relaxed text-lg">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

export default HomePage
