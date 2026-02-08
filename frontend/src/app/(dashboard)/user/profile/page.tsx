'use client'

import { useEffect, useState } from 'react'
import { getCurrentUser, updateProfile, getProfile } from '@/lib/api'
import { uploadFile } from '@/lib/storage'
import { Input } from '@/ui/Input'
import { Button } from '@/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/Card'

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const user = await getCurrentUser()
        if (user) {
          // Fetch detailed profile from DB
          const dbProfile = await getProfile(user.id)
          
          setProfile({
            id: user.id,
            full_name: dbProfile?.full_name || user.user_metadata?.full_name || '',
            email: user.email,
            phone: dbProfile?.phone || user.user_metadata?.phone || '',
            role: dbProfile?.role || user.user_metadata?.role || 'buyer',
            // Agent fields
            experience_years: dbProfile?.experience_years || 0,
            specialization: dbProfile?.specialization || '',
            office_address: dbProfile?.office_address || '',
            document_urls: dbProfile?.document_urls || []
          })
        }
      } catch (e) {
        console.error("Error loading profile", e)
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [])

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setUpdating(true)
    try {
      let docUrl = null;
      if (profile._docFile) {
        docUrl = await uploadFile(profile._docFile, 'property-images'); // Using existing bucket
      }

      await updateProfile(profile.id, {
        full_name: profile.full_name,
        phone: profile.phone,
        // Update agent fields if present
        ...(profile.role === 'agent' ? {
           experience_years: profile.experience_years,
           specialization: profile.specialization,
           office_address: profile.office_address,
           ...(docUrl ? { document_urls: [docUrl] } : {})
        } : {})
      })
      alert('Profile updated successfully!')
      // Refresh strictly to clear file input state implied
      window.location.reload() 
    } catch (error) {
      console.error(error)
      alert('Failed to update profile.')
    } finally {
      setUpdating(false)
    }
  }

  if (loading) return <div className="p-8">Loading profile...</div>

  return (
    <div className="p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Your Profile</h1>
          <p className="text-muted-foreground">Manage your personal information.</p>
        </div>

      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Full Name</label>
              <Input 
                value={profile.full_name} 
                onChange={(e) => setProfile({...profile, full_name: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email Address</label>
              <Input value={profile.email} disabled />
              <p className="text-xs text-muted-foreground">Email cannot be changed.</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Phone Number</label>
              <Input 
                value={profile.phone} 
                onChange={(e) => setProfile({...profile, phone: e.target.value})}
                placeholder="+1 234 567 890"
              />
            </div>

            {profile?.role === 'agent' && (
              <>
                <div className="pt-4 border-t">
                  <h3 className="text-lg font-semibold mb-3">Agent Details</h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Experience (Years)</label>
                      <Input 
                        type="number"
                        value={profile.experience_years} 
                        onChange={(e) => setProfile({...profile, experience_years: parseInt(e.target.value) || 0})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Specialization</label>
                      <Input 
                        value={profile.specialization} 
                        onChange={(e) => setProfile({...profile, specialization: e.target.value})}
                        placeholder="e.g. Residential, Commercial"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Office Address</label>
                      <Input 
                        value={profile.office_address} 
                        onChange={(e) => setProfile({...profile, office_address: e.target.value})}
                        placeholder="123 Business Park..."
                      />
                    </div>
                     <div className="space-y-2">
                      <label className="text-sm font-medium">Agent Documents (ID/RERA)</label>
                      {profile.document_urls && profile.document_urls.length > 0 && (
                        <div className="mb-2 text-sm text-blue-600">
                           <a href={profile.document_urls[0]} target="_blank" rel="noopener noreferrer">View Current Document</a>
                        </div>
                      )}
                      <input 
                        type="file"
                        accept=".pdf,.jpg,.png"
                        onChange={async (e) => {
                          const file = e.target.files?.[0]
                          if (file) {
                             // Upload immediately for simplicity or handle in submit
                             // Let's handle in submit by storing file in state if we want, 
                             // but here I'll just store the file object in a temp state to upload on submit
                             // actually, let's use the same state pattern as add-property if possible, but here profile is one object
                             // I'll add a separate state for docFile in the component
                             setProfile({...profile, _docFile: file}) 
                          }
                        }}
                        className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            <Button type="submit" className="w-full" disabled={updating}>
              {updating ? 'Saving...' : 'Update Profile'}
            </Button>
          </form>
        </CardContent>
      </Card>
      </div>
    </div>
  )
}
