'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { getAgents } from '@/lib/api'
import { Card } from '@/ui/Card'
import { Button } from '@/ui/Button'
import { Badge } from '@/ui/Badge'
import { Search, User, Mail, Phone, ShieldCheck } from 'lucide-react'

const UserAgentsPage = () => {
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
    agent.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    agent.agency_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    agent.specialization?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-extrabold text-slate-900 mb-2">Find Your Agent</h1>
        <p className="text-slate-500 text-lg">
          Connect with verified real estate professionals who can help you find your dream home.
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
          <Search className="w-5 h-5" />
        </div>
        <input 
          type="text" 
          placeholder="Search by agent name, agency, or specialization..."
          className="w-full h-14 pl-12 pr-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 shadow-sm"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Results Count */}
      {!isLoading && (
        <div className="flex items-center justify-between">
          <p className="text-slate-600 font-medium">
            {filteredAgents.length} {filteredAgents.length === 1 ? 'agent' : 'agents'} found
          </p>
        </div>
      )}

      {/* Agents Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-[420px] bg-white rounded-3xl shadow-sm animate-pulse"></div>
          ))}
        </div>
      ) : filteredAgents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAgents.map((agent) => (
            <Card key={agent.id} className="group overflow-hidden rounded-3xl border-slate-200 shadow-sm hover:shadow-xl transition-all hover:-translate-y-1 bg-white">
              {/* Agent Image Header */}
              <div className="h-32 bg-gradient-to-br from-blue-600 to-blue-400 relative overflow-hidden">
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/5 transition-colors"></div>
              </div>

              {/* Profile Pic */}
              <div className="relative -mt-16 flex justify-center px-6">
                <div className="w-28 h-28 rounded-2xl overflow-hidden border-4 border-white shadow-lg bg-slate-100">
                  <img 
                    src={agent.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(agent.full_name)}&background=0D8ABC&color=fff&size=200`} 
                    alt={agent.full_name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
              </div>

              <div className="p-6 pt-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <h2 className="text-xl font-bold text-slate-900">{agent.full_name}</h2>
                  {agent.is_verified && (
                    <ShieldCheck className="w-5 h-5 text-blue-500" />
                  )}
                </div>
                
                {agent.agency_name && (
                  <p className="text-sm text-slate-500 mb-3">{agent.agency_name}</p>
                )}

                {agent.is_verified ? (
                  <Badge className="bg-green-50 text-green-600 hover:bg-green-100 border-none mb-4 px-3 py-1 rounded-full font-semibold text-xs">
                    Verified Agent
                  </Badge>
                ) : (
                  <Badge className="bg-slate-100 text-slate-600 hover:bg-slate-200 border-none mb-4 px-3 py-1 rounded-full font-semibold text-xs">
                    Pending Verification
                  </Badge>
                )}

                {agent.specialization && (
                  <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                    <span className="font-semibold">Specialization:</span> {agent.specialization}
                  </p>
                )}

                {agent.experience_years && (
                  <div className="bg-slate-50 p-3 rounded-xl mb-4">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Experience</p>
                    <p className="text-lg font-black text-slate-900">{agent.experience_years} Years</p>
                  </div>
                )}

                <div className="space-y-2 mb-6 text-sm">
                  {agent.phone && (
                    <div className="flex items-center gap-2 text-slate-600">
                      <Phone className="w-4 h-4 text-blue-500" />
                      <span className="truncate">{agent.phone}</span>
                    </div>
                  )}
                  {agent.email && (
                    <div className="flex items-center gap-2 text-slate-600">
                      <Mail className="w-4 h-4 text-blue-500" />
                      <span className="truncate">{agent.email}</span>
                    </div>
                  )}
                </div>

                <Link href={`/agent/${agent.id}`}>
                  <Button className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-sm active:scale-95">
                    View Profile & Listings
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-slate-200">
          <User className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 mb-2">No Agents Found</h2>
          <p className="text-slate-500">
            {searchQuery 
              ? "We couldn't find any agents matching your search. Try different keywords."
              : "No agents are currently available."}
          </p>
        </div>
      )}
    </div>
  )
}

export default UserAgentsPage
