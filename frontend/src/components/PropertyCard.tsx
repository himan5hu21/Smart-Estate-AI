'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { MapPin, Bed, Bath, Square, Heart, ArrowUpRight } from 'lucide-react'
import { Card } from '@/ui/Card'
import { Button } from '@/ui/Button'
import { Badge } from '@/ui/Badge'
import { saveProperty, unsaveProperty } from '@/lib/api'

interface PropertyCardProps {
  property: {
    id: string
    title: string
    price: number
    location: string
    type: string
    images: string[]
    status: string
    bedrooms: number
    bathrooms: number
    area_sqft: number
  }
  userRole?: 'buyer' | 'agent' | 'seller' | 'admin' | null
  initialSaved?: boolean
  onSaveChange?: (propertyId: string, isSaved: boolean) => void
}

const PropertyCard = ({ property, userRole, initialSaved = false, onSaveChange }: PropertyCardProps) => {
  const [isSaved, setIsSaved] = useState(initialSaved)
  const [isSaving, setIsSaving] = useState(false)

  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  })

  // Fallback image
  const displayImage = property.images && property.images.length > 0 
    ? property.images[0] 
    : 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'

  // Determine the correct property detail route based on user role
  const getPropertyLink = () => {
    if (!userRole) return `/property/${property.id}` // Public route
    
    switch (userRole) {
      case 'buyer':
        return `/user/property/${property.id}`
      case 'agent':
        return `/agent/property/${property.id}`
      case 'seller':
        return `/seller/property/${property.id}`
      case 'admin':
        return `/admin/properties/${property.id}`
      default:
        return `/property/${property.id}`
    }
  }

  const handleSaveToggle = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (isSaving) return
    
    setIsSaving(true)
    try {
      if (isSaved) {
        await unsaveProperty(parseInt(property.id))
        setIsSaved(false)
        onSaveChange?.(property.id, false)
      } else {
        await saveProperty(parseInt(property.id))
        setIsSaved(true)
        onSaveChange?.(property.id, true)
      }
    } catch (error) {
      console.error('Error toggling save:', error)
      // Revert on error
      setIsSaved(!isSaved)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Link href={getPropertyLink()} className="block group h-full">
      <Card className="overflow-hidden border-slate-200 bg-white hover:shadow-2xl hover:shadow-blue-900/10 transition-all duration-300 h-full flex flex-col relative w-full group">
        {/* Image Container */}
        <div className="relative aspect-4/3 overflow-hidden">
          <img
            src={displayImage}
            alt={property.title}
            className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700"
            onError={(e) => {
              e.currentTarget.src = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
            }}
          />
          
          {/* Overlays */}
          <div className="absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          <div className="absolute top-4 left-4 flex gap-2">
            <Badge className="bg-white/95 backdrop-blur-md text-slate-900 font-semibold shadow-sm border-white/20">
              {property.type}
            </Badge>
            {property.status === 'pending' && (
              <Badge className="bg-amber-500/90 backdrop-blur-md text-white font-semibold border-none shadow-sm">
                Pending
              </Badge>
            )}
          </div>

          {/* Save/Heart Button */}
          <button 
            onClick={handleSaveToggle}
            disabled={isSaving}
            className={`absolute top-4 right-4 p-2 rounded-full backdrop-blur-md transition-all duration-300 ${
              isSaved 
                ? 'bg-red-500 text-white opacity-100' 
                : 'bg-white/20 text-white hover:bg-white hover:text-red-500 opacity-0 group-hover:opacity-100'
            } translate-y-2 group-hover:translate-y-0 disabled:opacity-50`}
            title={isSaved ? 'Remove from saved' : 'Save property'}
          >
            <Heart className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
          </button>

          <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 delay-75">
            <Button size="sm" className="bg-white text-slate-900 hover:bg-blue-50 font-semibold shadow-lg rounded-lg">
              View Details <ArrowUpRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col flex-1">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-bold text-slate-900 line-clamp-1 group-hover:text-blue-600 transition-colors" title={property.title}>
              {property.title}
            </h3>
          </div>
          
          <div className="flex items-center text-slate-500 text-sm mb-6 gap-1.5">
            <MapPin className="w-4 h-4 shrink-0 text-blue-500" />
            <span className="line-clamp-1">{property.location}</span>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6 py-4 border-y border-slate-100">
            <div className="flex flex-col items-center justify-center gap-1 text-center">
              <Bed className="w-5 h-5 text-slate-400 group-hover:text-blue-500 transition-colors" />
              <div className="text-xs text-slate-500 font-medium">
                <span className="text-slate-900 font-bold text-sm block">{property.bedrooms}</span>
                Beds
              </div>
            </div>
            <div className="flex flex-col items-center justify-center gap-1 text-center border-x border-slate-100">
              <Bath className="w-5 h-5 text-slate-400 group-hover:text-blue-500 transition-colors" />
              <div className="text-xs text-slate-500 font-medium">
                <span className="text-slate-900 font-bold text-sm block">{property.bathrooms}</span>
                Baths
              </div>
            </div>
            <div className="flex flex-col items-center justify-center gap-1 text-center">
              <Square className="w-5 h-5 text-slate-400 group-hover:text-blue-500 transition-colors" />
              <div className="text-xs text-slate-500 font-medium">
                <span className="text-slate-900 font-bold text-sm block">{property.area_sqft}</span>
                Sqft
              </div>
            </div>
          </div>

          <div className="mt-auto flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">Price</span>
              <span className="text-2xl font-bold text-blue-600">
                {formatter.format(property.price)}
              </span>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  )
}

export default PropertyCard
