'use client'

import React, { useState, useEffect } from 'react'
import Map, { Marker, NavigationControl } from 'react-map-gl/maplibre'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { MapPin } from 'lucide-react'

// Free Carto Style
const MAP_STYLE = "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"

export default function PropertyMap({ location, lat, lng }: { location: string, lat?: number, lng?: number }) {
  const hasCoordinates = lat && lng && lat !== 0 && lng !== 0
  
  const [viewState, setViewState] = useState({
      latitude: hasCoordinates ? lat : 20.5937,
      longitude: hasCoordinates ? lng : 78.9629,
      zoom: hasCoordinates ? 14 : 4
  })

  useEffect(() => {
     if (hasCoordinates) {
         setViewState({
             latitude: lat,
             longitude: lng,
             zoom: 14
         })
     } else {
         // Fallback logic for user location
         if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    setViewState(prev => ({
                        ...prev,
                        latitude: pos.coords.latitude,
                        longitude: pos.coords.longitude,
                        zoom: 10
                    }))
                },
                () => fetchIpLocation()
            )
        } else {
            fetchIpLocation()
        }
     }

     async function fetchIpLocation() {
        try {
            const res = await fetch('https://ipapi.co/json/')
            const data = await res.json()
            if (data.latitude && data.longitude) {
                setViewState(prev => ({
                    ...prev,
                    latitude: data.latitude,
                    longitude: data.longitude,
                    zoom: 10
                }))
            }
        } catch (e) {
            console.error(e)
        }
    }
  }, [lat, lng, hasCoordinates])

  return (
    <div className="w-full h-[400px] rounded-3xl overflow-hidden shadow-lg border-4 border-white relative">
      <Map
        {...viewState}
        onMove={evt => setViewState(evt.viewState)}
        mapLib={maplibregl}
        style={{ width: '100%', height: '100%' }}
        mapStyle={MAP_STYLE}
      >
        <NavigationControl position="bottom-right" />
        
        {hasCoordinates && (
            <Marker latitude={lat} longitude={lng} anchor="bottom">
                <div className="flex flex-col items-center">
                    <div className="bg-white px-2 py-1 rounded shadow text-xs font-bold mb-1 whitespace-nowrap">
                        {location}
                    </div>
                    <MapPin className="text-blue-600 w-8 h-8 fill-blue-50 drop-shadow-md" />
                </div>
            </Marker>
        )}
      </Map>
    </div>
  )
}
