'use client'

import React, { Suspense } from 'react'
import { Loader2 } from 'lucide-react'
import SearchContent from '@/components/SearchContent'

export default function UserSearchPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
      </div>
    }>
      <SearchContent userRole="buyer" />
    </Suspense>
  )
}
