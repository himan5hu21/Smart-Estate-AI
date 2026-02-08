'use client'

import { useParams } from 'next/navigation'
import { User, MapPin, Phone, Mail, Award, Building2 } from 'lucide-react'
import { Button } from '@/ui/Button'
import Link from 'next/link'

const MOCK_AGENT_PUBLIC = {
  id: '505',
  name: 'David Wilson',
  title: 'Senior Real Estate Agent',
  company: 'SmartEstate Premier',
  location: 'Los Angeles, CA',
  bio: 'Helping clients find their dream homes since 2015. Specializing in luxury properties and beach-front estates.',
  stats: {
    sold: 45,
    active: 8,
    experience: '8 Years'
  },
  listings: [
    { id: 1, title: 'Luxury Villa', price: '$2,500,000', image: 'bg-gray-200' },
    { id: 2, title: 'Modern Condo', price: '$850,000', image: 'bg-gray-200' },
    { id: 3, title: 'Beach House', price: '$1,200,000', image: 'bg-gray-200' },
  ]
}

export default function AgentProfilePage() {
  const params = useParams()

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header Profile */}
      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden mb-8">
        <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
        <div className="px-8 pb-8">
          <div className="relative flex flex-col md:flex-row items-start md:items-end -mt-12 mb-6 gap-6">
            <div className="w-32 h-32 bg-white p-1 rounded-full shadow-lg">
              <div className="w-full h-full bg-gray-200 rounded-full flex items-center justify-center">
                 <User size={48} className="text-gray-400" />
              </div>
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold">{MOCK_AGENT_PUBLIC.name}</h1>
              <p className="text-muted-foreground">{MOCK_AGENT_PUBLIC.title} at {MOCK_AGENT_PUBLIC.company}</p>
            </div>
            <div className="flex gap-3">
              <Button>Contact Agent</Button>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-8">
              <section>
                <h2 className="text-xl font-bold mb-3">About</h2>
                <p className="text-muted-foreground leading-relaxed">
                  {MOCK_AGENT_PUBLIC.bio}
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold mb-4">Active Listings</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {MOCK_AGENT_PUBLIC.listings.map((listing) => (
                    <Link key={listing.id} href={`/property/${listing.id}`} className="group block border rounded-xl overflow-hidden hover:shadow-md transition-all">
                      <div className={`aspect-video ${listing.image} relative`}>
                         <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/50">Image</div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold group-hover:text-primary transition-colors">{listing.title}</h3>
                        <p className="text-primary font-bold mt-1">{listing.price}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            </div>

            <div className="space-y-6">
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="font-bold mb-4">Contact Info</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span>{MOCK_AGENT_PUBLIC.location}</span>
                  </div>
                   <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span>Contact via Form</span>
                  </div>
                   <div className="flex items-center gap-3">
                    <Building2 className="w-4 h-4 text-muted-foreground" />
                    <span>{MOCK_AGENT_PUBLIC.company}</span>
                  </div>
                </div>
              </div>

               <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="font-bold mb-4">Stats</h3>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="font-bold text-xl">{MOCK_AGENT_PUBLIC.stats.sold}</p>
                    <p className="text-xs text-muted-foreground">Sold</p>
                  </div>
                   <div>
                    <p className="font-bold text-xl">{MOCK_AGENT_PUBLIC.stats.active}</p>
                    <p className="text-xs text-muted-foreground">Active</p>
                  </div>
                   <div>
                    <p className="font-bold text-xl">{MOCK_AGENT_PUBLIC.stats.experience}</p>
                    <p className="text-xs text-muted-foreground">Exp</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
