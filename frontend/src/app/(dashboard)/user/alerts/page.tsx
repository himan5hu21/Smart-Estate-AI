'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/ui/Card'
import { Button } from '@/ui/Button'
import { Input } from '@/ui/Input'
import { Select } from '@/ui/Select'
import { Badge } from '@/ui/Badge'
import Link from 'next/link'
import MapPicker from '@/ui/MapPicker'
import { createClient } from '@/utils/supabase/client'
import { aiClient } from '@/lib/ai-client'

interface Alert {
  id: string
  user_id: string
  preferences: {
    office_location: { latitude: number; longitude: number }
    max_commute_minutes: number
    min_price?: number
    max_price?: number
    bedrooms?: number
    property_type?: string
    locations?: string[]
    amenities?: string[]
  }
  enabled: boolean
  created_at: string
  updated_at: string
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  
  // Form state
  const [officeLocation, setOfficeLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [maxCommute, setMaxCommute] = useState(30)
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [bedrooms, setBedrooms] = useState('')
  const [propertyType, setPropertyType] = useState('')
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([])

  const supabase = createClient()

  useEffect(() => {
    loadUserAndAlerts()
  }, [])

  const buildAlertPayloadFromExisting = (alert: Alert, enabled: boolean) => ({
    user_id: alert.user_id,
    office_location: alert.preferences.office_location,
    max_commute_minutes: alert.preferences.max_commute_minutes,
    min_price: alert.preferences.min_price ?? null,
    max_price: alert.preferences.max_price ?? null,
    bedrooms: alert.preferences.bedrooms ?? null,
    property_type: alert.preferences.property_type ?? null,
    locations: alert.preferences.locations ?? null,
    amenities: alert.preferences.amenities ?? null,
    enabled
  })

  const loadUserAndAlerts = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const user = session?.user
      if (user) {
        setUserId(user.id)
        setAccessToken(session?.access_token ?? null)
        await loadAlerts(user.id, session?.access_token ?? undefined)
      }
    } catch (error) {
      console.error('Error loading user:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadAlerts = async (uid: string, token?: string) => {
    try {
      const data = await aiClient.getUserAlerts(uid, token || accessToken || undefined)
      setAlerts(data)
    } catch (error) {
      console.error('Error loading alerts:', error)
    }
  }

  const createAlert = async () => {
    if (!userId || !officeLocation) return

    try {
      const alertData = {
        user_id: userId,
        office_location: {
          latitude: officeLocation.lat,
          longitude: officeLocation.lng
        },
        max_commute_minutes: maxCommute,
        min_price: minPrice ? parseFloat(minPrice) : null,
        max_price: maxPrice ? parseFloat(maxPrice) : null,
        bedrooms: bedrooms ? parseInt(bedrooms) : null,
        property_type: propertyType || null,
        locations: null,
        amenities: selectedAmenities.length > 0 ? selectedAmenities : null,
        enabled: true
      }

      await aiClient.createAlert(alertData, accessToken || undefined)
      await loadAlerts(userId)
      setShowCreateForm(false)
      resetForm()
    } catch (error) {
      console.error('Error creating alert:', error)
    }
  }

  const toggleAlert = async (alertId: string, currentStatus: boolean) => {
    try {
      const alert = alerts.find(a => a.id === alertId)
      if (!alert) return

      await aiClient.updateAlert(alertId, buildAlertPayloadFromExisting(alert, !currentStatus), accessToken || undefined)

      if (userId) {
        await loadAlerts(userId)
      }
    } catch (error) {
      console.error('Error toggling alert:', error)
    }
  }

  const deleteAlert = async (alertId: string) => {
    if (!confirm('Are you sure you want to delete this alert?')) return

    try {
      await aiClient.deleteAlert(alertId, accessToken || undefined)

      if (userId) {
        await loadAlerts(userId)
      }
    } catch (error) {
      console.error('Error deleting alert:', error)
    }
  }

  const resetForm = () => {
    setOfficeLocation(null)
    setMaxCommute(30)
    setMinPrice('')
    setMaxPrice('')
    setBedrooms('')
    setPropertyType('')
    setSelectedAmenities([])
  }

  const amenitiesList = ['Parking', 'Gym', 'Swimming Pool', 'Security', 'Garden', 'Elevator']

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Property Alerts</h1>
          <p className="text-muted-foreground">Get notified when properties matching your criteria are listed.</p>
        </div>
        <Button onClick={() => setShowCreateForm(!showCreateForm)}>
          {showCreateForm ? 'Cancel' : '+ Create Alert'}
        </Button>
      </div>

      {showCreateForm && (
        <Card className="p-6 space-y-4">
          <h2 className="text-xl font-semibold">Create New Alert</h2>
          
          <div>
            <label className="block text-sm font-medium mb-2">Office Location *</label>
            <MapPicker
              onLocationSelect={(lat, lng) => setOfficeLocation({ lat, lng })}
              initialLat={officeLocation?.lat}
              initialLng={officeLocation?.lng}
            />
            {officeLocation && (
              <p className="text-sm text-muted-foreground mt-2">
                Selected: {officeLocation.lat.toFixed(4)}, {officeLocation.lng.toFixed(4)}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Max Commute Time (minutes)</label>
            <Input
              type="number"
              value={maxCommute}
              onChange={(e) => setMaxCommute(parseInt(e.target.value))}
              min={5}
              max={120}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Min Price</label>
              <Input
                type="number"
                placeholder="e.g., 5000000"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Max Price</label>
              <Input
                type="number"
                placeholder="e.g., 15000000"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Bedrooms</label>
              <Select value={bedrooms} onChange={(e) => setBedrooms(e.target.value)}>
                <option value="">Any</option>
                <option value="1">1 BHK</option>
                <option value="2">2 BHK</option>
                <option value="3">3 BHK</option>
                <option value="4">4+ BHK</option>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Property Type</label>
              <Select value={propertyType} onChange={(e) => setPropertyType(e.target.value)}>
                <option value="">Any</option>
                <option value="apartment">Apartment</option>
                <option value="villa">Villa</option>
                <option value="house">House</option>
                <option value="plot">Plot</option>
              </Select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Amenities</label>
            <div className="flex flex-wrap gap-2">
              {amenitiesList.map(amenity => (
                <Badge
                  key={amenity}
                  variant={selectedAmenities.includes(amenity) ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => {
                    setSelectedAmenities(prev =>
                      prev.includes(amenity)
                        ? prev.filter(a => a !== amenity)
                        : [...prev, amenity]
                    )
                  }}
                >
                  {amenity}
                </Badge>
              ))}
            </div>
          </div>

          <Button onClick={createAlert} disabled={!officeLocation} className="w-full">
            Create Alert
          </Button>
        </Card>
      )}

      {alerts.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-dashed">
          <p className="text-muted-foreground">You have no active alerts.</p>
          <p className="text-sm text-muted-foreground mt-2">Create an alert to get notified about new properties.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {alerts.map(alert => (
            <Card key={alert.id} className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-lg font-semibold">Property Alert</h3>
                    <Badge variant={alert.enabled ? 'default' : 'outline'}>
                      {alert.enabled ? 'Active' : 'Paused'}
                    </Badge>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Commute:</span>
                      <span>Max {alert.preferences.max_commute_minutes} minutes from office</span>
                    </div>

                    {(alert.preferences.min_price || alert.preferences.max_price) && (
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Price:</span>
                        <span>
                          {alert.preferences.min_price && `INR ${(alert.preferences.min_price / 100000).toFixed(1)}L`}
                          {alert.preferences.min_price && alert.preferences.max_price && ' - '}
                          {alert.preferences.max_price && `INR ${(alert.preferences.max_price / 100000).toFixed(1)}L`}
                        </span>
                      </div>
                    )}

                    {alert.preferences.bedrooms && (
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Bedrooms:</span>
                        <span>{alert.preferences.bedrooms} BHK</span>
                      </div>
                    )}

                    {alert.preferences.property_type && (
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Type:</span>
                        <span className="capitalize">{alert.preferences.property_type}</span>
                      </div>
                    )}

                    {alert.preferences.amenities && alert.preferences.amenities.length > 0 && (
                      <div className="flex items-start gap-2">
                        <span className="font-medium">Amenities:</span>
                        <div className="flex flex-wrap gap-1">
                          {alert.preferences.amenities.map(amenity => (
                            <Badge key={amenity} variant="outline" className="text-xs">
                              {amenity}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="text-xs text-muted-foreground mt-3">
                      Created {new Date(alert.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>                <div className="flex gap-2">
                  <Link href={`/user/alerts/${alert.id}/properties`}><Button variant="outline" size="sm">View Alert Properties</Button></Link>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleAlert(alert.id, alert.enabled)}
                  >
                    {alert.enabled ? 'Pause' : 'Resume'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteAlert(alert.id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>            </Card>
          ))}
        </div>
      )}
    </div>
  )
}



















