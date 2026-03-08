'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { agentOnboardingSchema, AgentOnboardingFormValues } from '@/lib/schemas'
import { Input } from '@/ui/Input'
import { Button } from '@/ui/Button'
import { useState } from 'react'
import { uploadPropertyImage } from '@/lib/storage' // Reusing image upload for now, ideally rename to uploadFile
import { updateProfile, getCurrentUser } from '@/lib/api'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/ui/Card'
import { ShieldCheck, Upload, FileText } from 'lucide-react'
import { useToast } from '@/ui/Toast'

const MAX_DOC_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_DOC_TYPES = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']
const MAX_LICENSE_LENGTH = 30

export default function AgentOnboardingPage() {
  const [loading, setLoading] = useState(false)
  const [licenseFile, setLicenseFile] = useState<File | null>(null)
  const [idFile, setIdFile] = useState<File | null>(null)
  const [licenseFileError, setLicenseFileError] = useState<string | null>(null)
  const [idFileError, setIdFileError] = useState<string | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AgentOnboardingFormValues>({
    resolver: zodResolver(agentOnboardingSchema),
  })

  const validateDocumentFile = (file: File, label: 'License copy' | 'Government ID'): string | null => {
    if (!ALLOWED_DOC_TYPES.includes(file.type)) {
      return `${label}: Only PDF, JPG, and PNG files are allowed.`
    }

    if (file.size > MAX_DOC_SIZE) {
      return `${label}: File size must be less than 10MB.`
    }

    return null
  }

  const handleLicenseFileChange = (file: File | null) => {
    if (!file) {
      setLicenseFile(null)
      setLicenseFileError('Please upload your license copy.')
      return
    }

    const validationError = validateDocumentFile(file, 'License copy')
    if (validationError) {
      setLicenseFile(null)
      setLicenseFileError(validationError)
      return
    }

    setLicenseFile(file)
    setLicenseFileError(null)
  }

  const handleIdFileChange = (file: File | null) => {
    if (!file) {
      setIdFile(null)
      setIdFileError('Please upload your government ID.')
      return
    }

    const validationError = validateDocumentFile(file, 'Government ID')
    if (validationError) {
      setIdFile(null)
      setIdFileError(validationError)
      return
    }

    setIdFile(file)
    setIdFileError(null)
  }

  const onSubmit = async (data: AgentOnboardingFormValues) => {
    if (!licenseFile || !idFile) {
      if (!licenseFile) setLicenseFileError('Please upload your license copy.')
      if (!idFile) setIdFileError('Please upload your government ID.')
      toast({ type: 'error', message: 'Please upload both License and Government ID documents.' })
      return
    }

    setLoading(true)
    try {
      const user = await getCurrentUser()
      if (!user) throw new Error('Not authenticated')

      const normalizedLicenseNumber = data.license_number.trim().toUpperCase()

      // Upload documents
      // In a real app, these should go to a private bucket
      const licenseUrl = await uploadPropertyImage(licenseFile)
      const idUrl = await uploadPropertyImage(idFile)

      // Use columns that exist in profiles table to avoid server 500 errors.
      await updateProfile(user.id, {
        rera_number: normalizedLicenseNumber,
        document_urls: [licenseUrl, idUrl],
      })

      toast({ type: 'success', message: 'Verification submitted successfully.' })
      router.push('/agent/dashboard')
    } catch (error) {
      console.error(error)
      const message = error instanceof Error ? error.message : 'Failed to submit onboarding details.'
      toast({ type: 'error', message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-600/20">
                <ShieldCheck className="w-8 h-8" />
            </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900">
          Agent Verification
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          To maintain trust on our platform, we require all agents to verify their identity and license.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
        <Card className="border-0 shadow-xl ring-1 ring-slate-900/5 bg-white">
          <CardHeader className="space-y-1 pb-6 border-b border-slate-100">
            <CardTitle className="text-xl">Submit Documents</CardTitle>
            <CardDescription>
                Please upload clear copies of your documents.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              
              <Input
                label="Real Estate License Number"
                name="license_number"
                register={register}
                error={errors.license_number}
                placeholder="e.g. RE-12345678"
                className="h-12"
                maxLength={MAX_LICENSE_LENGTH}
                inputMode="text"
                autoCapitalize="characters"
              />
              <p className="-mt-4 text-xs text-slate-500">Max {MAX_LICENSE_LENGTH} characters. Use letters, numbers, and hyphen.</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-900 block">License Copy</label>
                    <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center text-center hover:border-blue-500 hover:bg-blue-50/50 transition-all cursor-pointer group relative">
                        <input 
                            type="file" 
                            accept="application/pdf,image/jpeg,image/jpg,image/png"
                            onChange={(e) => handleLicenseFileChange(e.target.files?.[0] || null)}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                            <Upload className="w-5 h-5" />
                        </div>
                        <p className="text-sm font-medium text-slate-900">
                            {licenseFile ? licenseFile.name : 'Click to upload'}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">PDF, JPG, PNG (max 10MB)</p>
                    </div>
                    {licenseFileError && <p className="text-xs font-medium text-red-500">{licenseFileError}</p>}
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-900 block">Government ID</label>
                    <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center text-center hover:border-blue-500 hover:bg-blue-50/50 transition-all cursor-pointer group relative">
                        <input 
                            type="file" 
                            accept="application/pdf,image/jpeg,image/jpg,image/png"
                            onChange={(e) => handleIdFileChange(e.target.files?.[0] || null)}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                         <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                            <FileText className="w-5 h-5" />
                        </div>
                         <p className="text-sm font-medium text-slate-900">
                            {idFile ? idFile.name : 'Click to upload'}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">PDF, JPG, PNG (max 10MB)</p>
                    </div>
                    {idFileError && <p className="text-xs font-medium text-red-500">{idFileError}</p>}
                </div>
              </div>

              <div className="pt-4">
                <Button type="submit" className="w-full h-12 text-base shadow-lg shadow-blue-600/20" disabled={loading}>
                  {loading ? 'Submitting Verification...' : 'Submit & Continue to Dashboard'}
                </Button>
                <p className="text-xs text-center text-slate-500 mt-4">
                    By submitting, you agree to our <a href="#" className="underline">Terms of Service</a> regarding agent verification.
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
