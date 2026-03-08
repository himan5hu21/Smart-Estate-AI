'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getAgents } from '@/lib/api'
import { Card } from '@/ui/Card'
import { Button } from '@/ui/Button'
import { Badge } from '@/ui/Badge'
import { Search, Mail, Phone, ArrowRight } from 'lucide-react'

const AgentsPage = () => {
  const [agents, setAgents] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const data = await getAgents()
        setAgents(data)
      } catch (error) {
        console.error('Failed to fetch agents:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchAgents()
  }, [])

  const filteredAgents = agents.filter(agent => 
    agent.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gray-50/50 pb-12">
      {/* Clean Header Section */}
      <section className="bg-white border-b px-4 py-12 md:py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Find Your Real Estate Expert
          </h1>
          <p className="text-gray-500 text-lg mb-8 max-w-2xl mx-auto">
            Connect with our verified professionals to help you buy, sell, or rent your perfect property.
          </p>
          
          {/* Minimal Search Bar */}
          <div className="max-w-xl mx-auto flex items-center bg-white border rounded-full overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all">
            <div className="pl-5 text-gray-400">
              <Search className="w-5 h-5" />
            </div>
            <input 
              type="text" 
              placeholder="Search agents by name..."
              className="w-full py-3.5 px-4 text-gray-700 outline-none bg-transparent"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* Main Grid Content */}
      <main className="max-w-6xl mx-auto px-4 py-12">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <Card key={i} className="h-[320px] animate-pulse bg-gray-100 border-none shadow-none" />
            ))}
          </div>
        ) : filteredAgents.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAgents.map((agent) => (
              <Card key={agent.id} className="p-6 flex flex-col items-center text-center hover:shadow-md transition-shadow bg-white">
                {/* Simple Avatar */}
                <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-50 mb-4 border-2 border-gray-100">
                  <img 
                    src={agent.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(agent.full_name)}&background=f3f4f6&color=374151&size=200`} 
                    alt={agent.full_name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Agent Details */}
                <h2 className="text-lg font-semibold text-gray-900 mb-1">
                  {agent.full_name}
                </h2>
                <Badge variant="outline" className="mb-5 text-xs font-medium bg-gray-100 text-gray-700 hover:bg-gray-100">
                  Real Estate Agent
                </Badge>

                {/* Contact Info */}
                <div className="w-full space-y-2 mb-6 text-sm text-gray-600">
                  <div className="flex items-center justify-center gap-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span>{agent.phone || 'Not provided'}</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="truncate max-w-[200px]">{agent.email || 'No email available'}</span>
                  </div>
                </div>

                {/* Clean Action Button */}
                <div className="mt-auto w-full pt-4 border-t border-gray-100">
                  <Link href={`/agents/${agent.id}`} className="w-full">
                    <Button variant="outline" className="w-full group hover:bg-gray-50">
                      View Profile
                      <ArrowRight className="w-4 h-4 ml-2 text-gray-400 group-hover:text-gray-700 transition-colors" />
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No agents found</h2>
            <p className="text-gray-500">We couldn't find any agents matching "{searchQuery}".</p>
            <Button 
              variant="link" 
              onClick={() => setSearchQuery('')}
              className="mt-4 text-blue-600"
            >
              Clear search
            </Button>
          </div>
        )}
      </main>
    </div>
  )
}

export default AgentsPage