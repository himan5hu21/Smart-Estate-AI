'use server'

import { createClient } from '@/utils/supabase/server'
import { getCurrentUser as getCurrentUserAuth } from './auth'

export async function getProfile(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function getCurrentUser() {
  return getCurrentUserAuth()
}



export async function getProperties(filters: { status?: string; minPrice?: number; maxPrice?: number; location?: string; type?: string } = {}) {
  const supabase = await createClient()
  let query = supabase.from('properties').select('*').order('created_at', { ascending: false })

  if (filters.status) {
    query = query.eq('status', filters.status)
  }
  if (filters.type) {
    query = query.eq('type', filters.type)
  }
  if (filters.minPrice !== undefined) {
    query = query.gte('price', filters.minPrice)
  }
  if (filters.maxPrice !== undefined) {
    query = query.lte('price', filters.maxPrice)
  }
  if (filters.location) {
    query = query.ilike('location', `%${filters.location}%`)
  }

  const { data, error } = await query
  if (error) throw error
  return data
}

export async function getPropertyById(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('properties')
    .select('*, profiles:posted_by(*)')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function addProperty(propertyData: any) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User not authenticated')

  try {
    const { data, error } = await supabase
      .from('properties')
      .insert([{ ...propertyData, posted_by: user.id }])
      .select()

    if (error) {
      console.error('Supabase Error (addProperty):', error)
      throw new Error(error.message || 'Database error')
    }
    return data
  } catch (error: any) {
    console.error('Server Action Error (addProperty):', error)
    throw new Error(error.message || 'Failed to add property')
  }
}

export async function getMyProperties(userId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .eq('posted_by', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function updatePropertyStatus(id: string, status: string) {
  const supabase = await createClient()
  try {
    const { data, error } = await supabase
      .from('properties')
      .update({ status })
      .eq('id', id)
      .select()

    if (error) {
      console.error('Supabase Error (updatePropertyStatus):', error)
      throw new Error(error.message || 'Database error')
    }
    return data
  } catch (error: any) {
    console.error('Server Action Error (updatePropertyStatus):', error)
    throw new Error(error.message || 'Failed to update property status')
  }
}

export async function getUnverifiedAgents() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'agent')
    .eq('is_verified', false)

  if (error) throw error
  return data
}

export async function verifyAgent(agentId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('profiles')
    .update({ is_verified: true })
    .eq('id', agentId)
    .select()

  if (error) throw error
  return data
}
export async function getAgents() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'agent')

  if (error) throw error
  return data
}

export async function getAgentById(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('*, properties(*)')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function getDashboardStats() {
  const supabase = await createClient()

  const { count: totalProperties, error: propError } = await supabase
    .from('properties')
    .select('*', { count: 'exact', head: true })

  if (propError) throw propError

  const { count: totalUsers, error: userError } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })

  if (userError) throw userError

  return {
    totalProperties: totalProperties || 0,
    totalUsers: totalUsers || 0
  }
}

export async function updateProfile(id: string, updates: any) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', id)
    .select()

  if (error) throw error
  return data
}


export async function getUsers() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    // .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function deleteUser(id: string) {
  const supabase = await createClient()
  // Note: This only deletes the profile. For full account deletion, you'd need the service role key to delete from auth.users
  const { error } = await supabase
    .from('profiles')
    .delete()
    .eq('id', id)

  if (error) throw error
  return true
}

export async function updateProperty(id: string, updates: any) {
  const supabase = await createClient()
  try {
    const { data, error } = await supabase
      .from('properties')
      .update(updates)
      .eq('id', id)
      .select()

    if (error) {
      console.error('Supabase Error (updateProperty):', error)
      throw new Error(error.message || 'Database error')
    }
    return data
  } catch (error: any) {
    console.error('Server Action Error (updateProperty):', error)
    throw new Error(error.message || 'Failed to update property')
  }
}


export async function deleteProperty(id: string) {
  const supabase = await createClient()
  try {
    const { error } = await supabase
      .from('properties')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Supabase Error (deleteProperty):', error)
      throw new Error(error.message || 'Database error')
    }
    return true
  } catch (error: any) {
    console.error('Server Action Error (deleteProperty):', error)
    throw new Error(error.message || 'Failed to delete property')
  }
}

// Property view tracking removed as per user request

export async function getInquiries(propertyId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('inquiries')
    .select('*')
    .eq('property_id', propertyId)
    .order('created_at', { ascending: false })

  if (error) {
      console.error('Error fetching inquiries:', error)
      return [] // Return empty array on error to prevent crash
  }
  return data
}

export async function submitInquiry(data: any) {
  const supabase = await createClient()
  
  // Get current user if authenticated
  const { data: { user } } = await supabase.auth.getUser()
  
  const inquiryData = {
    ...data,
    user_id: user?.id || null,
    status: 'new'
  }
  
  const { error } = await supabase.from('inquiries').insert([inquiryData])
  if (error) throw error
  return true
}

export async function getMyInquiries() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User not authenticated')

  // First get property IDs owned by the user
  const { data: properties, error: propError } = await supabase
    .from('properties')
    .select('id, title, location')
    .eq('posted_by', user.id)

  if (propError) {
    console.error('Error fetching properties:', propError)
    throw propError
  }

  if (!properties || properties.length === 0) {
    return []
  }

  const propertyIds = properties.map(p => p.id)

  // Get all inquiries for those properties
  const { data: inquiries, error } = await supabase
    .from('inquiries')
    .select('*')
    .in('property_id', propertyIds)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching inquiries:', error)
    throw error
  }

  // Manually join property data
  const inquiriesWithProperty = inquiries?.map(inquiry => {
    const property = properties.find(p => p.id === inquiry.property_id)
    return {
      ...inquiry,
      property: property ? {
        title: property.title,
        location: property.location
      } : null
    }
  })
  
  return inquiriesWithProperty || []
}

export async function respondToInquiry(inquiryId: string, response: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User not authenticated')

  const { data, error } = await supabase
    .from('inquiries')
    .update({
      response,
      status: 'replied',
      responded_at: new Date().toISOString(),
      responded_by: user.id
    })
    .eq('id', inquiryId)
    .select()

  if (error) {
    console.error('Error responding to inquiry:', error)
    throw error
  }
  
  return data
}

export async function getAllInquiries() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User not authenticated')

  // Get all inquiries
  const { data: inquiries, error: inqError } = await supabase
    .from('inquiries')
    .select('*')
    .order('created_at', { ascending: false })

  if (inqError) {
    console.error('Error fetching inquiries:', inqError)
    throw inqError
  }

  if (!inquiries || inquiries.length === 0) {
    return []
  }

  // Get unique property IDs
  const propertyIds = [...new Set(inquiries.map(inq => inq.property_id))]

  // Get properties with owner details
  const { data: properties, error: propError } = await supabase
    .from('properties')
    .select('id, title, location, posted_by')
    .in('id', propertyIds)

  if (propError) {
    console.error('Error fetching properties:', propError)
  }

  // Get unique owner IDs
  const ownerIds = properties ? [...new Set(properties.map(p => p.posted_by))] : []

  // Get owner profiles
  const { data: profiles, error: profileError } = await supabase
    .from('profiles')
    .select('id, full_name, email')
    .in('id', ownerIds)

  if (profileError) {
    console.error('Error fetching profiles:', profileError)
  }

  // Manually join all data
  const inquiriesWithDetails = inquiries.map(inquiry => {
    const property = properties?.find(p => p.id === inquiry.property_id)
    const owner = property ? profiles?.find(prof => prof.id === property.posted_by) : null
    
    return {
      ...inquiry,
      property: property ? {
        title: property.title,
        location: property.location,
        posted_by: property.posted_by
      } : null,
      profiles: owner ? {
        full_name: owner.full_name,
        email: owner.email
      } : null
    }
  })
  
  return inquiriesWithDetails
}

export async function getMySubmittedInquiries() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User not authenticated')

  // Get inquiries submitted by the current user
  const { data: inquiries, error: inqError } = await supabase
    .from('inquiries')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (inqError) {
    console.error('Error fetching user inquiries:', inqError)
    throw inqError
  }

  if (!inquiries || inquiries.length === 0) {
    return []
  }

  // Get unique property IDs
  const propertyIds = [...new Set(inquiries.map(inq => inq.property_id))]

  // Get properties
  const { data: properties, error: propError } = await supabase
    .from('properties')
    .select('id, title, location, images')
    .in('id', propertyIds)

  if (propError) {
    console.error('Error fetching properties:', propError)
  }

  // Manually join property data
  const inquiriesWithProperty = inquiries.map(inquiry => {
    const property = properties?.find(p => p.id === inquiry.property_id)
    return {
      ...inquiry,
      property: property ? {
        title: property.title,
        location: property.location,
        images: property.images
      } : null
    }
  })
  
  return inquiriesWithProperty
}

// ============ SAVED PROPERTIES ============

export async function saveProperty(propertyId: number) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User not authenticated')

  const { data, error } = await supabase
    .from('saved_properties')
    .insert([{ user_id: user.id, property_id: propertyId }])
    .select()

  if (error) {
    // If it's a duplicate error, ignore it
    if (error.code === '23505') {
      return { alreadySaved: true }
    }
    console.error('Error saving property:', error)
    throw error
  }
  
  return data
}

export async function unsaveProperty(propertyId: number) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User not authenticated')

  const { error } = await supabase
    .from('saved_properties')
    .delete()
    .eq('user_id', user.id)
    .eq('property_id', propertyId)

  if (error) {
    console.error('Error unsaving property:', error)
    throw error
  }
  
  return true
}

export async function getSavedProperties() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User not authenticated')

  // Get saved property IDs
  const { data: savedProps, error: savedError } = await supabase
    .from('saved_properties')
    .select('property_id, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (savedError) {
    console.error('Error fetching saved properties:', savedError)
    throw savedError
  }

  if (!savedProps || savedProps.length === 0) {
    return []
  }

  // Get property details
  const propertyIds = savedProps.map(sp => sp.property_id)
  const { data: properties, error: propError } = await supabase
    .from('properties')
    .select('*')
    .in('id', propertyIds)

  if (propError) {
    console.error('Error fetching property details:', propError)
    throw propError
  }

  return properties || []
}

export async function isPropertySaved(propertyId: number) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  const { data, error } = await supabase
    .from('saved_properties')
    .select('id')
    .eq('user_id', user.id)
    .eq('property_id', propertyId)
    .single()

  if (error && error.code !== 'PGRST116') { // PGRST116 is "not found" error
    console.error('Error checking saved status:', error)
    return false
  }
  
  return !!data
}

export async function getSavedPropertyIds() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('saved_properties')
    .select('property_id')
    .eq('user_id', user.id)

  if (error) {
    console.error('Error fetching saved property IDs:', error)
    return []
  }
  
  return data?.map(item => item.property_id) || []
}
