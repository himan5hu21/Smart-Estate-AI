'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { propertySchema, PropertyFormValues } from '@/lib/schemas'
import { Input } from '@/ui/Input'
import { Button } from '@/ui/Button'
import { Select } from '@/ui/Select'
import { useState, useEffect, useCallback } from 'react'
import { uploadPropertyImage, uploadFile } from '@/lib/storage'
import { addProperty, getPropertyById, updateProperty } from '@/lib/api'
import { getCurrentUser } from '@/lib/auth'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/Card'
import { useToast } from '@/ui/Toast'
import dynamic from 'next/dynamic'
import { AIDescriptionGenerator } from '@/components/AIDescriptionGenerator'

// Dynamically import MapPicker
const MapPicker = dynamic(() => import('@/ui/MapPicker'), {
  loading: () => <div className="h-[300px] w-full bg-slate-100 animate-pulse rounded-xl" />,
  ssr: false
})

export default function AddPropertyPage() {
  const [loading, setLoading] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [existingImage, setExistingImage] = useState<string | null>(null)
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [existingVideo, setExistingVideo] = useState<string | null>(null)
  const [docsFile, setDocsFile] = useState<File | null>(null)
  const [existingDocs, setExistingDocs] = useState<string[]>([])
  const router = useRouter()
  const searchParams = useSearchParams()
  const editId = searchParams.get('edit')
  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<PropertyFormValues>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      type: 'sell',
      bedrooms: 0,
      bathrooms: 0,
      area_sqft: 0,
      amenities: [],
      furnishing_status: 'unfurnished',
      property_age: 'new',
      floor_number: 0,
      total_floors: 0,
      latitude: 0,
      longitude: 0,
    }
  })

  useEffect(() => {
    async function fetchProperty() {
      if (!editId) return
      
      try {
        setLoading(true)
        const property = await getPropertyById(editId)
        if (property) {
          reset({
            title: property.title,
            description: property.description,
            price: property.price,
            type: property.type,
            bedrooms: property.bedrooms,
            bathrooms: property.bathrooms,
            area_sqft: property.area_sqft,
            year_built: property.year_built,
            location: property.location,
            furnishing_status: property.furnishing_status,
            property_age: property.property_age,
            floor_number: property.floor_number,
            total_floors: property.total_floors,
            amenities: property.amenities || [],
            latitude: property.latitude || 0,
            longitude: property.longitude || 0,
            video_url: property.video_url,
          })
          if (property.images && property.images.length > 0) {
            setExistingImage(property.images[0])
          }
          if (property.video_url) {
            setExistingVideo(property.video_url)
          }
          if (property.ownership_docs && property.ownership_docs.length > 0) {
            setExistingDocs(property.ownership_docs)
          }
        }
      } catch (error) {
        console.error('Error fetching property:', error)
        toast({ type: 'error', message: 'Failed to load property details' })
      } finally {
        setLoading(false)
      }
    }

    fetchProperty()
  }, [editId, reset])

  // Memoize the location handler to prevent infinite loops in MapPicker
  const handleLocationSelect = useCallback((lat: number, lng: number) => {
      setValue('latitude', lat, { shouldDirty: true, shouldTouch: true })
      setValue('longitude', lng, { shouldDirty: true, shouldTouch: true })
  }, [setValue])

  const onSubmit = async (data: PropertyFormValues) => {
    setLoading(true)
    try {
      const user = await getCurrentUser()
      if (!user) throw new Error('Not authenticated')

      let imageUrl = existingImage || ''
      if (imageFile) {
        imageUrl = await uploadPropertyImage(imageFile)
      }

      let videoUrl = existingVideo || ''
      if (videoFile) {
        // Using property-images bucket for video as well for simplicity, assuming it allows video mime types
        // If strict bucket rules exist, this might fail, but checking storage.ts suggests generic upload
        videoUrl = await uploadFile(videoFile, 'property-images') 
      }

      let docUrl = existingDocs.length > 0 ? existingDocs[0] : ''
      if (docsFile) {
        docUrl = await uploadFile(docsFile, 'property-images')
      }

      const submissionData = {
          ...data,
          images: imageUrl ? [imageUrl] : [],
          video_url: videoUrl,
          ownership_docs: docUrl ? [docUrl] : [],
          posted_by: user.id,
          // If editing, keep status unless logic changes. For new, default is pending. 
          // DB default is pending, API handles it.
          status: 'pending', 
      }
      
      // Ensure lat/lng are non-null
      if (!submissionData.latitude) submissionData.latitude = 0
      if (!submissionData.longitude) submissionData.longitude = 0

      if (editId) {
        await updateProperty(editId, submissionData)
        toast({ type: 'success', message: 'Property updated successfully!' })
        router.push('/agent/my-listings')
      } else {
        const result = await addProperty(submissionData)
        if (result) {
            router.push('/agent/my-listings')
        } else {
            router.push('/agent/my-listings') // Fallback redirect
        }
      }
    } catch (error: any) {
      console.error('Error saving property:', error)
      toast({ type: 'error', message: error.message || 'Failed to save property' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">{editId ? 'Edit Property' : 'List a New Property'}</h1>
          <p className="text-muted-foreground">
            {editId ? 'Update your property details below.' : 'Fill in the details below to list your property on SmartEstate.'}
          </p>
        </div>

      <Card>
        <CardHeader>
          <CardTitle>Property Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-4">
              <Input
                label="Title"
                name="title"
                register={register}
                error={errors.title}
                role="agent"
                placeholder="e.g. Luxury Apartment in Downtown"
              />

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700/90">Description</label>
                <textarea 
                  {...register('description')}
                  className="flex min-h-[100px] w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-agent-primary/20 focus-visible:border-agent-primary disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Describe the property features..."
                />
                {errors.description && <p className="text-xs font-medium text-red-500">{errors.description.message}</p>}
                
                {/* AI Description Generator */}
                <AIDescriptionGenerator
                  propertyData={{
                    title: watch('title'),
                    location: watch('location'),
                    price: watch('price'),
                    bedrooms: watch('bedrooms'),
                    bathrooms: watch('bathrooms'),
                    area_sqft: watch('area_sqft'),
                    type: watch('type'),
                    furnishing_status: watch('furnishing_status'),
                    amenities: watch('amenities'),
                  }}
                  onGenerated={(description) => setValue('description', description)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Price ($)"
                  name="price"
                  type="number"
                  register={register}
                  error={errors.price}
                  role="agent"
                  placeholder="150000"
                />

                <Select
                  label="Type"
                  name="type"
                  setValue={setValue}
                  watch={watch}
                  error={errors.type}
                  searchable={false}
                  clearable={false}
                  role="agent"
                  options={[
                    { label: 'For Sale', value: 'sell' },
                    { label: 'For Rent', value: 'rent' }
                  ]}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Bedrooms"
                  name="bedrooms"
                  type="number"
                  register={register}
                  error={errors.bedrooms}
                  role="agent"
                  placeholder="3"
                />
                <Input
                  label="Bathrooms"
                  name="bathrooms"
                  type="number"
                  register={register}
                  error={errors.bathrooms}
                  role="agent"
                  placeholder="2"
                />
                <Input
                  label="Area (sqft)"
                  name="area_sqft"
                  type="number"
                  register={register}
                  error={errors.area_sqft}
                  role="agent"
                  placeholder="1200"
                />
                <Input
                  label="Year Built"
                  name="year_built"
                  type="number"
                  register={register}
                  error={errors.year_built}
                  role="agent"
                  placeholder="2024"
                />
              </div>

              <Input
                label="Location Name"
                name="location"
                register={register}
                error={errors.location}
                role="agent"
                placeholder="e.g. Mumbai, India"
              />

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700/90">Exact Location (Click on Map) *Mandatory</label>
                <MapPicker 
                    initialLat={watch('latitude')} 
                    initialLng={watch('longitude')} 
                    onLocationSelect={handleLocationSelect} 
                />
                <p className="text-xs text-gray-500">Selected: {watch('latitude') ? `${Number(watch('latitude')).toFixed(4)}, ${Number(watch('longitude')).toFixed(4)}` : 'None'}</p>
                 {errors.latitude && <p className="text-xs font-medium text-red-500">{errors.latitude.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <Select
                  label="Furnishing Status"
                  name="furnishing_status"
                  setValue={setValue}
                  watch={watch}
                  error={errors.furnishing_status}
                  searchable={false}
                  clearable={false}
                  role="agent"
                  options={[
                    { label: 'Unfurnished', value: 'unfurnished' },
                    { label: 'Semi-Furnished', value: 'semi-furnished' },
                    { label: 'Furnished', value: 'furnished' }
                  ]}
                />
                 <Select
                  label="Property Age"
                  name="property_age"
                  setValue={setValue}
                  watch={watch}
                  error={errors.property_age}
                  searchable={false}
                  clearable={false}
                  role="agent"
                  options={[
                    { label: 'New', value: 'new' },
                    { label: 'Resale', value: 'resale' }
                  ]}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Floor Number"
                  name="floor_number"
                  type="number"
                  register={register}
                  error={errors.floor_number}
                  role="agent"
                  placeholder="5"
                />
                <Input
                  label="Total Floors"
                  name="total_floors"
                  type="number"
                  register={register}
                  error={errors.total_floors}
                  role="agent"
                  placeholder="10"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700/90">Amenities</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {['Lift', 'Garden', 'Parking', 'Gym', 'Swimming Pool', 'Security', 'Club House', 'Power Backup'].map((amenity) => (
                    <label key={amenity} className="flex items-center space-x-2 text-sm">
                      <input
                        type="checkbox"
                        value={amenity}
                        {...register('amenities')}
                        className="rounded border-gray-300 text-agent-primary focus:ring-agent-primary"
                      />
                      <span>{amenity}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                 <label className="text-sm font-semibold text-gray-700/90">Property Video (Mandatory)</label>
                 {existingVideo && !videoFile && (
                   <div className="mb-2 text-sm text-green-600">
                     Video already uploaded. 
                     <a href={existingVideo} target="_blank" className='ml-2 underline'>View</a>
                   </div>
                 )}
                 <input 
                   type="file" 
                   accept="video/*"
                   onChange={(e) => {
                       setVideoFile(e.target.files?.[0] || null)
                       // Set dummy value to pass validation if file is selected state will handle upload
                       if(e.target.files?.[0]) setValue('video_url', 'pending_upload')
                   }}
                   required={!existingVideo}
                   className="flex w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-agent-primary/20 focus-visible:border-agent-primary shadow-sm"
                 />
                 {errors.video_url && <p className="text-xs font-medium text-red-500">{errors.video_url.message}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700/90">Property Image (Mandatory)</label>
                {existingImage && !imageFile && (
                  <div className="mb-2 relative w-32 h-24 rounded-lg overflow-hidden border">
                    <img src={existingImage} alt="Current" className="w-full h-full object-cover" />
                  </div>
                )}
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                  required={!existingImage}
                  className="flex w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-agent-primary/20 focus-visible:border-agent-primary disabled:cursor-not-allowed disabled:opacity-50 shadow-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700/90">Ownership Documents (Optional)</label>
                 {existingDocs.length > 0 && !docsFile && (
                  <div className="mb-2 text-sm text-blue-600">
                    <a href={existingDocs[0]} target="_blank" rel="noopener noreferrer">View Current Document</a>
                  </div>
                )}
                <input 
                  type="file" 
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => setDocsFile(e.target.files?.[0] || null)}
                  className="flex w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-agent-primary/20 focus-visible:border-agent-primary shadow-sm"
                />
                <p className="text-xs text-gray-500">Upload Seller Dastavej or Lightbill (PDF/Image)</p>
              </div>

            </div>

            <div className="pt-4 flex gap-4">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Saving...' : (editId ? 'Update Property' : 'List Property')}
              </Button>
              <Button type="button" variant="outline" className="w-full" onClick={() => toast({ type: 'info', message: "AI Price Check is coming soon!" })}>
                Check AI Price
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      </div>
    </div>
  )
}
