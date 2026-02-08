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

export default function AgentOnboardingPage() {
  const [loading, setLoading] = useState(false)
  const [licenseFile, setLicenseFile] = useState<File | null>(null)
  const [idFile, setIdFile] = useState<File | null>(null)
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AgentOnboardingFormValues>({
    resolver: zodResolver(agentOnboardingSchema),
  })

  const onSubmit = async (data: AgentOnboardingFormValues) => {
    if (!licenseFile || !idFile) {
        alert("Please upload both License and ID documents.")
        return
    }

    setLoading(true)
    try {
      const user = await getCurrentUser()
      if (!user) throw new Error('Not authenticated')

      // Upload documents
      // In a real app, these should go to a private bucket
      const licenseUrl = await uploadPropertyImage(licenseFile)
      const idUrl = await uploadPropertyImage(idFile)

      // Update profile
      await updateProfile(user.id, {
        license_number: data.license_number,
        documents: {
            license_url: licenseUrl,
            id_url: idUrl,
            params: {
                license_verified: false,
                id_verified: false
            }
        },
        is_onboarded: true // Mark as onboarded
      })

      // We might need to add 'is_onboarded' to profile schema in DB if not present,
      // or just rely on presence of license_number
      
      alert('Onboarding submitted! You can now access your dashboard.')
      router.push('/agent/dashboard')
    } catch (error) {
      console.error(error)
      alert('Failed to submit onboarding details.')
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
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-900 block">License Copy</label>
                    <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center text-center hover:border-blue-500 hover:bg-blue-50/50 transition-all cursor-pointer group relative">
                        <input 
                            type="file" 
                            accept="image/*,.pdf" 
                            onChange={(e) => setLicenseFile(e.target.files?.[0] || null)}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                            <Upload className="w-5 h-5" />
                        </div>
                        <p className="text-sm font-medium text-slate-900">
                            {licenseFile ? licenseFile.name : "Click to upload"}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">PDF or Image</p>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-900 block">Government ID</label>
                    <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center text-center hover:border-blue-500 hover:bg-blue-50/50 transition-all cursor-pointer group relative">
                        <input 
                            type="file" 
                            accept="image/*,.pdf" 
                            onChange={(e) => setIdFile(e.target.files?.[0] || null)}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                         <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                            <FileText className="w-5 h-5" />
                        </div>
                         <p className="text-sm font-medium text-slate-900">
                            {idFile ? idFile.name : "Click to upload"}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">PDF or Image</p>
                    </div>
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
