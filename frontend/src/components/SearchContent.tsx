'use client'

import React, { useEffect, useState, useCallback, useRef } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { Search, MapPin, X, DollarSign, Building2, SlidersHorizontal, Grid3x3, List, Sparkles } from 'lucide-react'
import { getProperties, getSavedPropertyIds } from '@/lib/api'
import PropertyCard from '@/components/PropertyCard'
import { Button } from '@/ui/Button'
import { Input } from '@/ui/Input'
import { Select } from '@/ui/Select'
import { CommuteSearch } from '@/components/CommuteSearch'

export default function SearchContent({ userRole }: { userRole?: 'buyer' | 'agent' | 'seller' | 'admin' | null }) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  
  const [properties, setProperties] = useState<any[]>([])
  const [filteredProperties, setFilteredProperties] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [sortBy, setSortBy] = useState('newest')
  const [showCommuteSearch, setShowCommuteSearch] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = useState(searchParams.get('location') || '')
  const [savedPropertyIds, setSavedPropertyIds] = useState<number[]>([])
  
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Local state for filters
  const [filters, setFilters] = useState({
    location: searchParams.get('location') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    type: searchParams.get('type') || 'all',
    status: 'active'
  })

  // Update local state when URL params change
  useEffect(() => {
    const newLocation = searchParams.get('location') || ''
    const newMinPrice = searchParams.get('minPrice') || ''
    const newMaxPrice = searchParams.get('maxPrice') || ''
    const newType = searchParams.get('type') || 'all'
    
    setFilters(prev => ({
      ...prev,
      location: newLocation,
      minPrice: newMinPrice,
      maxPrice: newMaxPrice,
      type: newType,
    }))
    setSearchQuery(newLocation)
  }, [searchParams])

  const fetchProperties = useCallback(async (searchLocation?: string) => {
    setIsLoading(true)
    try {
      const locationToSearch = searchLocation !== undefined ? searchLocation : filters.location
      const data = await getProperties({
        status: filters.status,
        location: locationToSearch,
        minPrice: filters.minPrice ? parseInt(filters.minPrice as string) : undefined,
        maxPrice: filters.maxPrice ? parseInt(filters.maxPrice as string) : undefined,
      })
      
      // Client-side filtering for type
      let result = data
      if (filters.type !== 'all') {
        result = data.filter((p: any) => p.type?.toLowerCase() === filters.type.toLowerCase())
      }

      setProperties(result)
      setFilteredProperties(result)
      
      // Fetch saved property IDs
      const savedIds = await getSavedPropertyIds()
      setSavedPropertyIds(savedIds)
    } catch (error) {
      console.error('Search failed:', error)
    } finally {
      setIsLoading(false)
    }
  }, [filters.status, filters.location, filters.minPrice, filters.maxPrice, filters.type])

  // Debounced search handler
  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value)
    
    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }
    
    // Set new timer
    debounceTimerRef.current = setTimeout(() => {
      const newFilters = { ...filters, location: value }
      setFilters(newFilters)
      updateURL(newFilters) // Update URL when search changes
      fetchProperties(value)
    }, 500) // 500ms debounce delay
  }, [filters, fetchProperties])

  // Cleanup debounce timer
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [])

  // Handle client-side sorting
  useEffect(() => {
    const sorted = [...properties]
    switch (sortBy) {
      case 'price-asc':
        sorted.sort((a, b) => a.price - b.price)
        break
      case 'price-desc':
        sorted.sort((a, b) => b.price - a.price)
        break
      case 'newest':
      default:
        sorted.sort((a, b) => (b.id > a.id ? 1 : -1)) 
        break
    }
    setFilteredProperties(sorted)
  }, [sortBy, properties])

  // Initial fetch - respect URL parameters
  useEffect(() => {
    // Only fetch if we have loaded the URL params
    if (searchParams !== null) {
      fetchProperties()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  // Handle type change
  useEffect(() => {
    if (filters.type !== 'all') {
      const filtered = properties.filter((p: any) => p.type?.toLowerCase() === filters.type.toLowerCase())
      setFilteredProperties(filtered)
    } else {
      setFilteredProperties(properties)
    }
  }, [filters.type, properties])

  const updateURL = (newFilters: any) => {
    const params = new URLSearchParams()
    if (newFilters.location) params.set('location', newFilters.location)
    if (newFilters.minPrice) params.set('minPrice', newFilters.minPrice)
    if (newFilters.maxPrice) params.set('maxPrice', newFilters.maxPrice)
    if (newFilters.type !== 'all') params.set('type', newFilters.type)
    
    router.push(`${pathname}?${params.toString()}`)
  }

  const handleApplyFilters = (e: React.FormEvent) => {
    e.preventDefault()
    updateURL(filters) // Update URL with current filters
    fetchProperties()
    setIsSidebarOpen(false)
  }

  const handleClearFilters = () => {
    const cleared = { location: '', minPrice: '', maxPrice: '', type: 'all', status: 'active' }
    setFilters(cleared)
    setSearchQuery('')
    router.push(pathname) // Clear URL params
    fetchProperties('')
  }

  const handleSaveChange = (propertyId: string, isSaved: boolean) => {
    const numId = parseInt(propertyId)
    if (isSaved) {
      setSavedPropertyIds(prev => [...prev, numId])
    } else {
      setSavedPropertyIds(prev => prev.filter(id => id !== numId))
    }
  }

  const typeOptions = [
    { label: 'All Types', value: 'all' },
    { label: 'For Rent', value: 'rent' },
    { label: 'For Sale', value: 'sell' },
  ]

  const sortOptions = [
    { label: 'Newest First', value: 'newest' },
    { label: 'Price: Low to High', value: 'price-asc' },
    { label: 'Price: High to Low', value: 'price-desc' },
  ]

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sticky Search Bar - Simplified */}
      <div className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-3">
            <div className="flex items-center gap-3">
              {/* Search Input - Takes most space */}
              <div className="flex-1">
                <Input
                  placeholder="Search by location, city, or neighborhood..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  prefix={<Search className="w-5 h-5" />}
                  className="h-11 text-base border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              {/* Type Dropdown */}
              <div className="w-36">
                <Select
                  options={typeOptions}
                  value={filters.type}
                  onValueChange={(val) => {
                    const newFilters = { ...filters, type: val }
                    setFilters(newFilters)
                    updateURL(newFilters)
                  }}
                  clearable={false}
                  searchable={false}
                  placeholder="Type"
                />
              </div>

              {/* Sort Dropdown */}
              <div className="w-44">
                <Select
                  options={sortOptions}
                  value={sortBy}
                  onValueChange={(val) => setSortBy(val)}
                  clearable={false}
                  searchable={false}
                  placeholder="Sort"
                />
              </div>

              {/* Filter Button */}
              <Button
                onClick={() => setIsSidebarOpen(true)}
                variant="outline"
                className="h-11 px-4 border-slate-300 hover:bg-slate-50"
                title="Advanced Filters"
              >
                <SlidersHorizontal className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Filter Sidebar */}
      {isSidebarOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={() => setIsSidebarOpen(false)}
          />
          <div className="fixed inset-y-0 right-0 w-full sm:w-96 bg-white shadow-2xl z-50 overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">Advanced Filters</h2>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleApplyFilters} className="p-6 space-y-6">
              {/* Location */}
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  <MapPin className="w-4 h-4 inline mr-2 text-blue-600" />
                  Location
                </label>
                <Input
                  placeholder="Enter city or area"
                  value={filters.location}
                  onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                />
              </div>

              {/* Price Range */}
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  <DollarSign className="w-4 h-4 inline mr-2 text-green-600" />
                  Price Range (₹)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={filters.minPrice}
                    onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                  />
                  <Input
                    type="number"
                    placeholder="Max"
                    value={filters.maxPrice}
                    onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                  />
                </div>
              </div>

              {/* Property Type */}
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  <Building2 className="w-4 h-4 inline mr-2 text-purple-600" />
                  Property Type
                </label>
                <Select
                  options={typeOptions}
                  value={filters.type}
                  onValueChange={(val) => setFilters({ ...filters, type: val })}
                  clearable={false}
                  searchable={false}
                />
              </div>

              {/* AI Commute Search */}
              <div className="pt-6 border-t border-slate-200">
                <Button
                  type="button"
                  onClick={() => setShowCommuteSearch(!showCommuteSearch)}
                  variant="outline"
                  className="w-full mb-4"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  {showCommuteSearch ? 'Hide' : 'Show'} AI Commute Search
                </Button>
                
                {showCommuteSearch && (
                  <CommuteSearch
                    onResults={(results) => {
                      setProperties(results)
                      setFilteredProperties(results)
                      setIsSidebarOpen(false)
                    }}
                    filters={filters}
                  />
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-6 border-t border-slate-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClearFilters}
                  className="flex-1"
                >
                  Clear
                </Button>
                <Button type="submit" className="flex-1">
                  Apply Filters
                </Button>
              </div>
            </form>
          </div>
        </>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Active Filters */}
        {(filters.location || filters.minPrice || filters.maxPrice || filters.type !== 'all') && (
          <div className="mb-6 flex flex-wrap items-center gap-2 bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
            <span className="text-sm font-semibold text-slate-700">Active Filters:</span>
            {filters.location && (
              <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium border border-blue-200">
                <MapPin className="w-3.5 h-3.5" />
                {filters.location}
                <button 
                  onClick={() => {
                    const newFilters = { ...filters, location: '' }
                    setFilters(newFilters)
                    setSearchQuery('')
                    updateURL(newFilters)
                    fetchProperties('')
                  }} 
                  className="hover:text-blue-900 ml-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            )}
            {filters.minPrice && (
              <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-sm font-medium border border-green-200">
                Min: ₹{parseInt(filters.minPrice).toLocaleString()}
                <button 
                  onClick={() => {
                    const newFilters = { ...filters, minPrice: '' }
                    setFilters(newFilters)
                    updateURL(newFilters)
                    fetchProperties()
                  }} 
                  className="hover:text-green-900 ml-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            )}
            {filters.maxPrice && (
              <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-sm font-medium border border-green-200">
                Max: ₹{parseInt(filters.maxPrice).toLocaleString()}
                <button 
                  onClick={() => {
                    const newFilters = { ...filters, maxPrice: '' }
                    setFilters(newFilters)
                    updateURL(newFilters)
                    fetchProperties()
                  }} 
                  className="hover:text-green-900 ml-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            )}
            {filters.maxPrice && (
              <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-sm font-medium border border-green-200">
                Max: ₹{parseInt(filters.maxPrice).toLocaleString()}
                <button 
                  onClick={() => {
                    setFilters({ ...filters, maxPrice: '' })
                    fetchProperties()
                  }} 
                  className="hover:text-green-900 ml-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            )}
            {filters.type !== 'all' && (
              <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-purple-50 text-purple-700 rounded-lg text-sm font-medium border border-purple-200">
                <Building2 className="w-3.5 h-3.5" />
                {filters.type === 'rent' ? 'For Rent' : 'For Sale'}
                <button 
                  onClick={() => {
                    const newFilters = { ...filters, type: 'all' }
                    setFilters(newFilters)
                    updateURL(newFilters)
                  }} 
                  className="hover:text-purple-900 ml-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            )}
            <button
              onClick={handleClearFilters}
              className="text-sm text-red-600 hover:text-red-700 font-medium px-3 py-1.5 hover:bg-red-50 rounded-lg transition-colors"
            >
              Clear all
            </button>
          </div>
        )}

        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              {isLoading ? (
                'Searching properties...'
              ) : (
                <>
                  {filteredProperties.length} {filteredProperties.length === 1 ? 'Property' : 'Properties'} Found
                </>
              )}
            </h2>
            <p className="text-slate-600 text-sm mt-1">
              {filters.location ? `in ${filters.location}` : 'Showing all available properties'}
            </p>
          </div>

          {/* View Toggle */}
          <div className="hidden sm:flex items-center gap-2 bg-white border border-slate-200 rounded-lg p-1 shadow-sm">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded transition-colors ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
              title="Grid view"
            >
              <Grid3x3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded transition-colors ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
              title="List view"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Properties Grid/List */}
        {isLoading ? (
          <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'} gap-6`}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-80 bg-white rounded-xl animate-pulse shadow-sm" />
            ))}
          </div>
        ) : filteredProperties.length > 0 ? (
          <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'} gap-6`}>
            {filteredProperties.map((property) => (
              <PropertyCard 
                key={property.id} 
                property={property} 
                userRole={userRole}
                initialSaved={savedPropertyIds.includes(property.id)}
                onSaveChange={handleSaveChange}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-slate-300 shadow-sm">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No properties found</h3>
            <p className="text-slate-600 mb-6">Try adjusting your filters or search criteria</p>
            <Button onClick={handleClearFilters} variant="outline">
              Clear all filters
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
