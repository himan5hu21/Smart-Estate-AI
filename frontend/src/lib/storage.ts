import { createClient } from '@/utils/supabase/client'

export async function uploadFile(file: File, bucket: string = 'property-images') {
  const supabase = createClient()
  
  const fileName = `${Date.now()}-${file.name}`
  const filePath = `${fileName}`

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file)

  if (error) throw error

  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath)

  return publicUrl
}

export async function uploadPropertyImage(file: File) {
  return uploadFile(file, 'property-images')
}

export async function uploadMultipleFiles(files: File[], bucket: string = 'property-images'): Promise<string[]> {
  const uploadPromises = files.map(file => uploadFile(file, bucket))
  return Promise.all(uploadPromises)
}
