'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/ui/Card'
import { Button } from '@/ui/Button'
import { Input } from '@/ui/Input'
import { FileText, Image as ImageIcon, CheckCircle2, Upload } from 'lucide-react'
import { uploadPropertyImage } from '@/lib/storage'
import { updateProperty } from '@/lib/api'

export default function PropertyUploadPage() {
  const { id } = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  
  // Files
  const [deedFile, setDeedFile] = useState<File | null>(null)
  const [taxFile, setTaxFile] = useState<File | null>(null)
  
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!id) return
    
    // Validate if mandatory? Let's say yes for now to be strict as requested.
    if (!deedFile) {
        alert("Property Deed is required.")
        return
    }

    setLoading(true)
    try {
        const deedUrl = deedFile ? await uploadPropertyImage(deedFile) : null
        const taxUrl = taxFile ? await uploadPropertyImage(taxFile) : null

        await updateProperty(id as string, {
            documents: {
                deed_url: deedUrl,
                tax_receipt_url: taxUrl,
                verified: false
            },
            status: 'pending_verification' // Move to meaningful status
        })

        alert("Documents uploaded successfully! Property sent for verification.")
        router.push('/agent/dashboard')
    } catch (error) {
        console.error(error)
        alert("Failed to upload documents.")
    } finally {
        setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
            <div className="w-16 h-16 bg-green-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-green-600/20">
                <CheckCircle2 className="w-8 h-8" />
            </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900">
          Complete Property Listing
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Almost done! Please upload the necessary legal documents to verify this property.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
        <Card className="border-0 shadow-xl ring-1 ring-slate-900/5 bg-white">
          <CardHeader className="space-y-1 pb-6 border-b border-slate-100">
            <CardTitle className="text-xl">Legal Documents</CardTitle>
            <CardDescription>
                These documents are required for property verification. They will not be public.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={onSubmit} className="space-y-6">
              
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-900 block">Property Deed / Title <span className="text-red-500">*</span></label>
                <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center text-center hover:border-blue-500 hover:bg-blue-50/50 transition-all cursor-pointer group relative">
                    <input 
                        type="file" 
                        accept=".pdf,image/*" 
                        onChange={(e) => setDeedFile(e.target.files?.[0] || null)}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        required
                    />
                    <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <FileText className="w-5 h-5" />
                    </div>
                    <p className="text-sm font-medium text-slate-900">
                        {deedFile ? deedFile.name : "Upload Deed"}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">PDF or Image</p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-900 block">Tax Receipt (Optional)</label>
                <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center text-center hover:border-blue-500 hover:bg-blue-50/50 transition-all cursor-pointer group relative">
                    <input 
                        type="file" 
                        accept=".pdf,image/*" 
                        onChange={(e) => setTaxFile(e.target.files?.[0] || null)}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                     <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <FileText className="w-5 h-5" />
                    </div>
                     <p className="text-sm font-medium text-slate-900">
                        {taxFile ? taxFile.name : "Upload Tax Receipt"}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">PDF or Image</p>
                </div>
              </div>

              <div className="pt-4">
                <Button type="submit" className="w-full h-12 text-base bg-green-600 hover:bg-green-700 shadow-lg shadow-green-600/20 text-white" disabled={loading}>
                  {loading ? 'Uploading Documents...' : 'Submit & Finish'}
                </Button>
                <Button 
                    type="button" 
                    variant="ghost" 
                    className="w-full mt-2" 
                    onClick={() => router.push('/agent/dashboard')}
                >
                    Skip for now (Save as Draft)
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
