'use client'

import React, { Suspense } from 'react'
import { Loader2 } from 'lucide-react'
import SearchContent from '@/components/SearchContent'

const SearchPage = () => {
  return (
    <div className="bg-slate-50 min-h-screen">
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
        </div>
      }>
        <SearchContent />
      </Suspense>
    </div>
  )
}

export default SearchPage
