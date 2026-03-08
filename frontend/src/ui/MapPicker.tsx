'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import Map, { Marker, NavigationControl, GeolocateControl, MapLayerMouseEvent, MarkerDragEvent } from 'react-map-gl/maplibre'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { MapPin } from 'lucide-react'

interface MapPickerProps {
  onLocationSelect: (lat: number, lng: number) => void
  initialLat?: number
  initialLng?: number
}

const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json'

export default function MapPicker({ onLocationSelect, initialLat, initialLng }: MapPickerProps) {
  const [viewState, setViewState] = useState({
    latitude: initialLat || 20.5937,
    longitude: initialLng || 78.9629,
    zoom: initialLat && initialLng ? 15 : 4
  })

  const [marker, setMarker] = useState<{ lat: number; lng: number } | null>(
    initialLat && initialLng ? { lat: initialLat, lng: initialLng } : null
  )

  const mapRef = useRef<maplibregl.Map | null>(null)
  const prevCoordsRef = useRef({ lat: initialLat, lng: initialLng })

  useEffect(() => {
    if (!initialLat || !initialLng) return
    if (prevCoordsRef.current.lat === initialLat && prevCoordsRef.current.lng === initialLng) return

    setMarker({ lat: initialLat, lng: initialLng })
    setViewState({ latitude: initialLat, longitude: initialLng, zoom: 16 })
    prevCoordsRef.current = { lat: initialLat, lng: initialLng }
  }, [initialLat, initialLng])

  useEffect(() => {
    if (initialLat && initialLng) return

    const fetchIpLocation = async () => {
      try {
        const res = await fetch('https://ipapi.co/json/')
        if (!res.ok) throw new Error('Failed to fetch IP location')
        const data = await res.json()
        if (data.latitude && data.longitude) {
          setViewState((prev) => ({ ...prev, latitude: data.latitude, longitude: data.longitude, zoom: 10 }))
        }
      } catch (error) {
        console.warn('IP Location failed, using default location (India)', error)
      }
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setViewState((prev) => ({ ...prev, latitude: pos.coords.latitude, longitude: pos.coords.longitude, zoom: 13 }))
        },
        () => fetchIpLocation()
      )
    } else {
      fetchIpLocation()
    }
  }, [initialLat, initialLng])

  const handleClick = useCallback((event: MapLayerMouseEvent) => {
    const { lat, lng } = event.lngLat
    setMarker({ lat, lng })
    onLocationSelect(lat, lng)
  }, [onLocationSelect])

  const handleMarkerDrag = useCallback((e: MarkerDragEvent) => {
    setMarker({ lat: e.lngLat.lat, lng: e.lngLat.lng })
    onLocationSelect(e.lngLat.lat, e.lngLat.lng)
  }, [onLocationSelect])

  return (
    <div className="w-full h-[400px] rounded-xl overflow-hidden border relative">
      <Map
        // react-map-gl types are broader than maplibre's instance; ref is not used for logic.
        ref={mapRef as never}
        {...viewState}
        onMove={(evt) => setViewState(evt.viewState)}
        mapLib={maplibregl}
        style={{ width: '100%', height: '100%' }}
        mapStyle={MAP_STYLE}
        styleDiffing={false}
        onClick={handleClick}
        cursor="crosshair"
      >
        <NavigationControl position="top-right" />
        <GeolocateControl position="top-right" />

        {marker && (
          <Marker
            latitude={marker.lat}
            longitude={marker.lng}
            anchor="bottom"
            draggable
            onDragEnd={handleMarkerDrag}
          >
            <MapPin className="text-red-600 w-8 h-8 -mb-1 fill-white" />
          </Marker>
        )}
      </Map>
      <div className="absolute bottom-3 left-3 bg-white/95 px-3 py-2 rounded-lg text-xs z-10 font-medium shadow-lg backdrop-blur-sm border border-gray-200">
        <div className="flex items-center gap-2">
          <MapPin className="w-3 h-3 text-gray-500" />
          <span className="text-gray-700">
            {marker ? 'Click or drag marker to adjust' : 'Click anywhere to set location'}
          </span>
        </div>
      </div>
    </div>
  )
}
