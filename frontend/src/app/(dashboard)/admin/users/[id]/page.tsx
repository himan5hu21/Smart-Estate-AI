'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { User, Phone, Shield, Briefcase, Ban } from 'lucide-react'
import { Button } from '@/ui/Button'
// Update this path to where your server actions are stored
import { getProfile, deleteUser } from '@/lib/api' 

export default function AdminUserDetailsPage() {
  const params = useParams()
  const router = useRouter()
  
  const [userData, setUserData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchUserDetails() {
      try {
        if (params.id) {
          const data = await getProfile(params.id as string)
          setUserData(data)
        }
      } catch (error) {
        console.error('Error fetching user data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchUserDetails()
  }, [params.id])

  const handleBanUser = async () => {
    const confirmBan = window.confirm('Are you sure you want to ban this user? This will delete their profile.')
    if (!confirmBan) return

    try {
      await deleteUser(params.id as string)
      alert('User has been banned.')
      router.push('/admin/users')
    } catch (error) {
      console.error('Error banning user:', error)
      alert('Failed to ban user.')
    }
  }

  if (loading) {
    return (
      <div className="p-8 text-center text-muted-foreground animate-pulse h-64 flex items-center justify-center">
        Loading user details...
      </div>
    )
  }

  if (!userData) {
    return (
      <div className="p-8 text-center mt-10">
        <h2 className="text-xl font-bold text-destructive">User not found</h2>
        <p className="text-muted-foreground mt-2">The user you are looking for does not exist.</p>
      </div>
    )
  }

  // Capitalize the first letter of the role for display (e.g., 'buyer' -> 'Buyer')
  const displayRole = userData.role 
    ? userData.role.charAt(0).toUpperCase() + userData.role.slice(1) 
    : 'Unknown'

  return (
    // Added padding (p-6 md:p-8) for space around the main container
    <div className="p-6 md:p-8 space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">User Details</h1>
        <div className="flex gap-2">
          {/* Ban User button with exactly your styling */}
          <Button variant="outline" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={handleBanUser}>
            <Ban className="w-4 h-4 mr-2" />
            Ban User
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Info - Kept exact same styling as your text */}
        <div className="bg-white p-6 rounded-xl border shadow-sm md:col-span-1 h-fit">
          <div className="flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-4">
              <User size={32} />
            </div>
            <h2 className="text-lg font-bold">{userData.full_name || 'No Name'}</h2>
            {/* Same styling for the role badge as requested */}
            <span className="inline-flex mt-1 items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
              {displayRole}
            </span>
          </div>
          
          <div className="mt-6 space-y-4 pt-6 border-t">
            <div className="flex items-center gap-3 text-sm">
              <Phone className="w-4 h-4 text-muted-foreground" />
              <span>{userData.phone || 'No phone provided'}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Shield className="w-4 h-4 text-muted-foreground" />
              <span className={userData.is_verified ? "text-green-600 font-medium" : "text-yellow-600 font-medium"}>
                {userData.is_verified ? 'Verified' : 'Unverified'}
              </span>
            </div>
            {userData.agency_name && (
              <div className="flex items-center gap-3 text-sm">
                <Briefcase className="w-4 h-4 text-muted-foreground" />
                <span className="truncate" title={userData.agency_name}>{userData.agency_name}</span>
              </div>
            )}
          </div>
        </div>

        {/* Professional Stats / Activity Box */}
        <div className="md:col-span-2 space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 bg-white border rounded-lg shadow-sm">
              <p className="text-sm text-muted-foreground">Experience</p>
              <p className="text-2xl font-bold mt-1">
                {userData.experience_years ? `${userData.experience_years} Yrs` : '0'}
              </p>
            </div>
            <div className="p-4 bg-white border rounded-lg shadow-sm">
              <p className="text-sm text-muted-foreground">RERA No.</p>
              <p className="text-lg font-bold mt-2 truncate" title={userData.rera_number}>
                {userData.rera_number || 'N/A'}
              </p>
            </div>
            <div className="p-4 bg-white border rounded-lg shadow-sm">
              <p className="text-sm text-muted-foreground">Specialization</p>
              <p className="text-lg font-bold mt-2 truncate" title={userData.specialization}>
                {userData.specialization || 'N/A'}
              </p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border shadow-sm">
            <h3 className="font-semibold mb-4">Additional Information</h3>
            <div className="space-y-4">
              <div className="flex gap-3 text-sm pb-3 border-b">
                <span className="text-muted-foreground min-w-[120px]">Office Address</span>
                <span className="font-medium">{userData.office_address || 'Not specified'}</span>
              </div>
              
              {userData.ai_preferences && (
                <>
                  <div className="flex gap-3 text-sm pb-3 border-b">
                    <span className="text-muted-foreground min-w-[120px]">AI Descriptions</span>
                    <span className={userData.ai_preferences.enable_ai_descriptions ? "text-primary font-medium" : ""}>
                      {userData.ai_preferences.enable_ai_descriptions ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                  <div className="flex gap-3 text-sm">
                    <span className="text-muted-foreground min-w-[120px]">Commute Alerts</span>
                    <span className={userData.ai_preferences.enable_commute_alerts ? "text-primary font-medium" : ""}>
                      {userData.ai_preferences.enable_commute_alerts ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}