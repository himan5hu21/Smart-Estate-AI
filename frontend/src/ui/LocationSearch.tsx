'use client'

import React from 'react'
import { MapPin } from 'lucide-react'

interface LocationSearchProps {
  onAddressChange: (address: string) => void
  onPincodeChange: (pincode: string) => void
  address?: string
  pincode?: string
  role?: 'agent' | 'seller' | 'buyer' | 'admin'
}

export function LocationSearch({ 
  onAddressChange,
  onPincodeChange,
  address = '',
  pincode = '',
  role = 'agent',
}: LocationSearchProps) {
  const roleColors = {
    agent: 'agent-primary',
    seller: 'seller-primary',
    buyer: 'buyer-primary',
    admin: 'admin-primary'
  }

  const focusRingColor = roleColors[role]

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-3">
        <MapPin className="w-5 h-5 text-gray-600" />
        <h3 className="text-sm font-semibold text-gray-700">Property Location</h3>
      </div>

      {/* Address Field */}
      <div className="space-y-1.5">
        <label className="text-sm font-semibold text-gray-700/90">
          Full Address <span className="text-red-500">*</span>
        </label>
        <textarea
          value={address}
          onChange={(e) => onAddressChange(e.target.value)}
          placeholder="Enter complete address (e.g., Building name, Street, Area, City, State)"
          rows={3}
          className={`flex w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm shadow-sm placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-${focusRingColor}/20 focus-visible:border-${focusRingColor} transition-all resize-none`}
        />
        <p className="text-xs text-gray-500">
          Include building name, street, area, city, and state
        </p>
      </div>

      {/* Pincode Field */}
      <div className="space-y-1.5">
        <label className="text-sm font-semibold text-gray-700/90">
          Pincode <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={pincode}
          onChange={(e) => {
            const value = e.target.value.replace(/\D/g, '').slice(0, 6)
            onPincodeChange(value)
          }}
          placeholder="Enter 6-digit pincode"
          maxLength={6}
          className={`flex w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm shadow-sm placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-${focusRingColor}/20 focus-visible:border-${focusRingColor} transition-all`}
        />
        <p className="text-xs text-gray-500">
          6-digit postal code
        </p>
      </div>
    </div>
  )
}
