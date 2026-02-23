'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { propertySchema, PropertyFormValues } from '@/lib/schemas'
import { Input } from '@/ui/Input'
import { InputNumber } from '@/ui/InputNumber'
import { Button } from '@/ui/Button'
import { Select } from '@/ui/Select'
import { useState, useEffect, useCallback } from 'react'
import { uploadFile } from '@/lib/storage'
import { addProperty, getPropertyById, updateProperty } from '@/lib/api'
import { getCurrentUser } from '@/lib/auth'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/Card'
import { useToast } from '@/ui/Toast'
import dynamic from 'next/dynamic'
import { AIDescriptionGenerator } from '@/components/AIDescriptionGenerator'
import { LocationSearch } from '@/ui/LocationSearch'

const MapPicker = dynamic(() => import('@/ui/MapPicker'), {
  loading: () => <div className="h-[300px] w-full bg-slate-100 animate-pulse rounded-xl" />,
  ssr: false
})

// File size limits (in bytes)
const MAX_IMAGE_SIZE = 5 * 1024 * 1024 // 5MB
const MAX_VIDEO_SIZE = 100 * 1024 * 1024 // 100MB
const MAX_DOC_SIZE = 10 * 1024 * 1024 // 10MB
const MAX_IMAGE_COUNT = 10

// Allowed file types
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/mpeg', 'video/quicktime', 'video/x-msvideo', 'video/webm']
const ALLOWED_DOC_TYPES = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']

export default function SellerAddProperty() {
  const [loading, setLoading] = useState(false)
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [existingImages, setExistingImages] = useState<string[]>([])
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
    formState: { errors, touchedFields, isSubmitted },
  } = useForm<PropertyFormValues>({
    resolver: zodResolver(propertySchema),
    mode: 'onTouched',
    defaultValues: {
      type: 'sell',
      bedrooms: 0,
      bathrooms: 0,
      area_sqft: 0,
      price: 0,
      amenities: [],
      furnishing_status: 'unfurnished',
      property_age: 'new',
      floor_number: 0,
      total_floors: 0,
      year_built: 0,
      latitude: 0,
      longitude: 0,
      unit_number: '',
      pincode: '',
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
            unit_number: property.unit_number || '',
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
            setExistingImages(property.images)
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

  const handleLocationSelect = useCallback((lat: number, lng: number) => {
      setValue('latitude', lat, { shouldDirty: true, shouldTouch: true })
      setValue('longitude', lng, { shouldDirty: true, shouldTouch: true })
  }, [setValue])

  // Handle location changes
  const handleAddressChange = useCallback((address: string) => {
    setValue('location', address, { shouldDirty: true, shouldTouch: true })
  }, [setValue])

  const handlePincodeChange = useCallback((pincode: string) => {
    setValue('pincode', pincode, { shouldDirty: true, shouldTouch: true })
  }, [setValue])

  // File validation helpers
  const validateImages = (files: FileList | null): File[] | null => {
    if (!files || files.length === 0) return null

    const fileArray = Array.from(files)
    
    // Check count limit
    if (fileArray.length > MAX_IMAGE_COUNT) {
      toast({ type: 'error', message: `Maximum ${MAX_IMAGE_COUNT} images allowed` })
      return null
    }

    // Validate each file
    for (const file of fileArray) {
      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        toast({ type: 'error', message: `${file.name}: Only JPG, PNG, and WebP images are allowed` })
        return null
      }
      if (file.size > MAX_IMAGE_SIZE) {
        toast({ type: 'error', message: `${file.name}: Image size must be less than 5MB` })
        return null
      }
    }

    return fileArray
  }

  const validateVideo = (file: File | null): boolean => {
    if (!file) return true

    if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
      toast({ type: 'error', message: 'Only MP4, MOV, AVI, and WebM videos are allowed' })
      return false
    }
    if (file.size > MAX_VIDEO_SIZE) {
      toast({ type: 'error', message: 'Video size must be less than 100MB' })
      return false
    }

    return true
  }

  const validateDocument = (file: File | null): boolean => {
    if (!file) return true

    if (!ALLOWED_DOC_TYPES.includes(file.type)) {
      toast({ type: 'error', message: 'Only PDF, JPG, and PNG documents are allowed' })
      return false
    }
    if (file.size > MAX_DOC_SIZE) {
      toast({ type: 'error', message: 'Document size must be less than 10MB' })
      return false
    }

    return true
  }

  const onSubmit = async (data: PropertyFormValues) => {
    setLoading(true)
    try {
      const user = await getCurrentUser()
      if (!user) throw new Error('Not authenticated')

      // Validate required files
      if (!editId && imageFiles.length === 0 && existingImages.length === 0) {
        toast({ type: 'error', message: 'Please upload at least one property image' })
        setLoading(false)
        return
      }

      if (!editId && !videoFile && !existingVideo) {
        toast({ type: 'error', message: 'Please upload a property video' })
        setLoading(false)
        return
      }

      let imageUrls = [...existingImages]
      if (imageFiles.length > 0) {
        const { uploadMultipleFiles } = await import('@/lib/storage')
        const newImageUrls = await uploadMultipleFiles(imageFiles)
        imageUrls = [...imageUrls, ...newImageUrls]
      }

      let videoUrl = existingVideo || ''
      if (videoFile) {
        videoUrl = await uploadFile(videoFile, 'property-images') 
      }

      let docUrl = existingDocs.length > 0 ? existingDocs[0] : ''
      if (docsFile) {
        docUrl = await uploadFile(docsFile, 'property-images')
      }

      // Clean up the data - remove undefined/empty values
      const submissionData: any = {
          title: data.title,
          description: data.description,
          price: data.price,
          location: data.location,
          unit_number: data.unit_number || null,
          type: data.type,
          bedrooms: data.bedrooms,
          bathrooms: data.bathrooms,
          area_sqft: data.area_sqft,
          amenities: data.amenities || [],
          furnishing_status: data.furnishing_status,
          property_age: data.property_age,
          images: imageUrls,
          video_url: videoUrl || null,
          ownership_docs: docUrl ? [docUrl] : [],
          posted_by: user.id,
          status: 'pending',
          latitude: data.latitude || 0,
          longitude: data.longitude || 0,
      }

      // Only add optional fields if they have values
      if (data.pincode && data.pincode.length === 6) {
        submissionData.pincode = data.pincode
      }
      if (data.year_built !== undefined && data.year_built !== null) {
        submissionData.year_built = data.year_built
      }
      if (data.floor_number !== undefined && data.floor_number !== null) {
        submissionData.floor_number = data.floor_number
      }
      if (data.total_floors !== undefined && data.total_floors !== null) {
        submissionData.total_floors = data.total_floors
      }

      if (editId) {
        await updateProperty(editId, submissionData)
        toast({ type: 'success', message: 'Property updated successfully!' })
        router.push('/seller/my-listings')
      } else {
        const result = await addProperty(submissionData)
        if (result) {
            router.push('/seller/my-listings')
        } else {
            router.push('/seller/my-listings')
        }
      }
    } catch (error: unknown) {
      console.error('Error saving property:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to save property'
      toast({ type: 'error', message: errorMessage })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">{editId ? 'Edit Property' : 'List Your Property'}</h1>
          <p className="text-muted-foreground">
            {editId ? 'Update your property details below.' : 'Fill in the details below to list your property on SmartEstate.'}
          </p>
        </div>

      <Card>
        <CardHeader>
          <CardTitle>Property Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
            <div className="space-y-4">
              <Input
                label="Title"
                name="title"
                register={register}
                error={(touchedFields.title || isSubmitted) ? errors.title : undefined}
                role="seller"
                placeholder="e.g. Luxury Apartment in Downtown"
                showRequired
              />

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700/90">
                  Description<span className="text-red-500 ml-1">*</span>
                </label>
                <textarea 
                  {...register('description')}
                  className="flex min-h-[100px] w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-seller-primary/20 focus-visible:border-seller-primary disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Describe the property features..."
                />
                {(touchedFields.description || isSubmitted) && errors.description && <p className="text-xs font-medium text-red-500">{errors.description.message}</p>}
                
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
                <InputNumber
                  label="Price ($)"
                  name="price"
                  register={register}
                  error={(touchedFields.price || isSubmitted) ? errors.price : undefined}
                  role="seller"
                  placeholder="150000"
                  min={0}
                  defaultValue={0}
                  allowDecimals={false}
                  strictMax={false}
                  showRequired
                />

                <Select
                  label="Type"
                  name="type"
                  setValue={setValue}
                  watch={watch}
                  error={(touchedFields.type || isSubmitted) ? errors.type : undefined}
                  searchable={false}
                  clearable={false}
                  role="seller"
                  showRequired
                  options={[
                    { label: 'For Sale', value: 'sell' },
                    { label: 'For Rent', value: 'rent' }
                  ]}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <InputNumber
                  label="Bedrooms"
                  name="bedrooms"
                  register={register}
                  error={(touchedFields.bedrooms || isSubmitted) ? errors.bedrooms : undefined}
                  role="seller"
                  placeholder="3"
                  min={0}
                  max={20}
                  defaultValue={0}
                  allowDecimals={false}
                  showRequired
                />
                <InputNumber
                  label="Bathrooms"
                  name="bathrooms"
                  register={register}
                  error={(touchedFields.bathrooms || isSubmitted) ? errors.bathrooms : undefined}
                  role="seller"
                  placeholder="2"
                  min={0}
                  max={20}
                  defaultValue={0}
                  allowDecimals={false}
                  showRequired
                />
                <InputNumber
                  label="Area (sqft)"
                  name="area_sqft"
                  register={register}
                  error={(touchedFields.area_sqft || isSubmitted) ? errors.area_sqft : undefined}
                  role="seller"
                  placeholder="1200"
                  min={0}
                  defaultValue={0}
                  allowDecimals={false}
                  showRequired
                />
                <InputNumber
                  label="Year Built"
                  name="year_built"
                  register={register}
                  error={(touchedFields.year_built || isSubmitted) ? errors.year_built : undefined}
                  role="seller"
                  placeholder="2024"
                  min={1800}
                  max={2100}
                  defaultValue={0}
                  allowDecimals={false}
                />
              </div>

              <LocationSearch
                onAddressChange={handleAddressChange}
                onPincodeChange={handlePincodeChange}
                address={watch('location')}
                pincode={watch('pincode') || ''}
                role="seller"
              />

              <Input
                label="Unit / Flat Number"
                name="unit_number"
                register={register}
                error={(touchedFields.unit_number || isSubmitted) ? errors.unit_number : undefined}
                role="seller"
                placeholder="e.g., 4B, 201, A-301"
              />

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700/90">
                  Pinpoint Exact Location<span className="text-red-500 ml-1">*</span>
                </label>
                <p className="text-xs text-gray-500 -mt-1">
                  Click or drag the marker to set the precise location. This helps buyers find the property easily.
                </p>
                <MapPicker 
                    initialLat={watch('latitude')} 
                    initialLng={watch('longitude')} 
                    onLocationSelect={handleLocationSelect} 
                />
                <p className="text-xs text-gray-500">
                  Coordinates: {watch('latitude') && watch('longitude') ? `${Number(watch('latitude')).toFixed(6)}, ${Number(watch('longitude')).toFixed(6)}` : 'Not set'}
                </p>
                 {(touchedFields.latitude || isSubmitted) && errors.latitude && <p className="text-xs font-medium text-red-500">{errors.latitude.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <Select
                  label="Furnishing Status"
                  name="furnishing_status"
                  setValue={setValue}
                  watch={watch}
                  error={(touchedFields.furnishing_status || isSubmitted) ? errors.furnishing_status : undefined}
                  searchable={false}
                  clearable={false}
                  role="seller"
                  showRequired
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
                  error={(touchedFields.property_age || isSubmitted) ? errors.property_age : undefined}
                  searchable={false}
                  clearable={false}
                  role="seller"
                  showRequired
                  options={[
                    { label: 'New', value: 'new' },
                    { label: 'Resale', value: 'resale' }
                  ]}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <InputNumber
                  label="Floor Number"
                  name="floor_number"
                  register={register}
                  error={(touchedFields.floor_number || isSubmitted) ? errors.floor_number : undefined}
                  role="seller"
                  placeholder="5"
                  min={0}
                  max={200}
                  defaultValue={0}
                  allowDecimals={false}
                />
                <InputNumber
                  label="Total Floors"
                  name="total_floors"
                  register={register}
                  error={(touchedFields.total_floors || isSubmitted) ? errors.total_floors : undefined}
                  role="seller"
                  placeholder="10"
                  min={0}
                  max={200}
                  defaultValue={0}
                  allowDecimals={false}
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
                        className="rounded border-gray-300 text-seller-primary focus:ring-seller-primary"
                      />
                      <span>{amenity}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                 <label className="text-sm font-semibold text-gray-700/90">
                   Property Video<span className="text-red-500 ml-1">*</span>
                 </label>
                 {existingVideo && !videoFile && (
                   <div className="mb-2 text-sm text-green-600">
                     Video already uploaded. 
                     <a href={existingVideo} target="_blank" className='ml-2 underline'>View</a>
                   </div>
                 )}
                 <input 
                   type="file" 
                   accept="video/mp4,video/mpeg,video/quicktime,video/x-msvideo,video/webm"
                   onChange={(e) => {
                       const file = e.target.files?.[0] || null
                       if (file && validateVideo(file)) {
                         setVideoFile(file)
                         setValue('video_url', 'pending_upload')
                       } else {
                         e.target.value = ''
                       }
                   }}
                   required={!existingVideo}
                   className="flex w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-seller-primary/20 focus-visible:border-seller-primary shadow-sm"
                 />
                 <p className="text-xs text-gray-500">Max size: 100MB. Formats: MP4, MOV, AVI, WebM</p>
                 {(touchedFields.video_url || isSubmitted) && errors.video_url && <p className="text-xs font-medium text-red-500">{errors.video_url.message}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700/90">
                  Property Images (Multiple)<span className="text-red-500 ml-1">*</span>
                </label>
                {existingImages.length > 0 && imageFiles.length === 0 && (
                  <div className="mb-2 flex flex-wrap gap-2">
                    {existingImages.map((img, idx) => (
                      <div key={idx} className="relative w-24 h-24 rounded-lg overflow-hidden border group">
                        <img src={img} alt={`Property ${idx + 1}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setExistingImages(existingImages.filter((_, i) => i !== idx))}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {imageFiles.length > 0 && (
                  <div className="mb-2 flex flex-wrap gap-2">
                    {Array.from(imageFiles).map((file, idx) => (
                      <div key={idx} className="relative w-24 h-24 rounded-lg overflow-hidden border group">
                        <img 
                          src={URL.createObjectURL(file)} 
                          alt={`New ${idx + 1}`} 
                          className="w-full h-full object-cover" 
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const newFiles = Array.from(imageFiles).filter((_, i) => i !== idx)
                            setImageFiles(newFiles)
                          }}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <input 
                  type="file" 
                  accept="image/jpeg,image/jpg,image/png,image/webp" 
                  multiple
                  onChange={(e) => {
                    const validFiles = validateImages(e.target.files)
                    if (validFiles) {
                      setImageFiles(validFiles)
                    } else {
                      e.target.value = ''
                    }
                  }}
                  required={existingImages.length === 0 && imageFiles.length === 0}
                  className="flex w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-seller-primary/20 focus-visible:border-seller-primary disabled:cursor-not-allowed disabled:opacity-50 shadow-sm"
                />
                <p className="text-xs text-gray-500">Max {MAX_IMAGE_COUNT} images, 5MB each. Formats: JPG, PNG, WebP</p>
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
                  accept="application/pdf,image/jpeg,image/jpg,image/png"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null
                    if (file && validateDocument(file)) {
                      setDocsFile(file)
                    } else {
                      e.target.value = ''
                    }
                  }}
                  className="flex w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-seller-primary/20 focus-visible:border-seller-primary shadow-sm"
                />
                <p className="text-xs text-gray-500">Max size: 10MB. Formats: PDF, JPG, PNG</p>
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
