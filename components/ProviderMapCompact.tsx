'use client'

import { useEffect, useRef, useState } from 'react'
import { MapPin, Loader2, Compass } from 'lucide-react'

interface MockPin {
  name: string
  skill: string
  rate: string
  latOffset: number
  lngOffset: number
  color: string
}

const MOCK_PINS: MockPin[] = [
  { name: 'Sarah K.',  skill: 'Guitar Lessons',   rate: '$40/hr', latOffset: 0.006,  lngOffset: -0.004, color: '#8b5cf6' },
  { name: 'Marcus T.', skill: 'Home Painting',     rate: '$35/hr', latOffset: -0.008, lngOffset: 0.009,  color: '#3b82f6' },
  { name: 'James R.',  skill: 'Furniture Assembly',rate: '$28/hr', latOffset: 0.004,  lngOffset: 0.007,  color: '#f59e0b' },
  { name: 'Amy L.',    skill: 'Math Tutoring',      rate: '$22/hr', latOffset: -0.005, lngOffset: -0.007, color: '#14b8a6' },
]

export default function ProviderMapCompact() {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstance = useRef<any>(null)
  const markersRef = useRef<any[]>([])
  
  const [loading, setLoading] = useState(true)
  const [coords, setCoords] = useState<{ lat: number; lng: number }>({ lat: 30.2672, lng: -97.7431 }) // Default: Austin, TX
  const [locationType, setLocationType] = useState<'Default' | 'Detected'>('Default')

  // Auto-detect user location
  useEffect(() => {
    if (typeof window !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoords({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
          setLocationType('Detected')
          setLoading(false)
        },
        () => {
          // Fallback to default (Austin) if denied
          setLoading(false)
        },
        { timeout: 5000 }
      )
    } else {
      setLoading(false)
    }
  }, [])

  // Initialize Map
  useEffect(() => {
    if (loading || !mapRef.current) return

    let isMounted = true

    const init = async () => {
      const L = (await import('leaflet')).default
      await import('leaflet/dist/leaflet.css')

      if (!isMounted) return

      // Fix default marker icon paths (broken in webpack builds)
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        iconRetinaUrl:'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })

      if (mapInstance.current) {
        mapInstance.current.remove()
        mapInstance.current = null
      }

      const map = L.map(mapRef.current!, { zoomControl: false, scrollWheelZoom: false })
      mapInstance.current = map

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap',
        maxZoom: 18,
      }).addTo(map)

      // Add center coordinate marker
      const centerIcon = L.divIcon({
        className: '',
        html: `
          <div style="
            width: 14px; height: 14px; border-radius: 50%;
            background-color: #0d9488; border: 2px solid white;
            box-shadow: 0 0 0 6px rgba(13, 148, 136, 0.2);
          "></div>
        `,
        iconSize: [14, 14],
        iconAnchor: [7, 7]
      })
      L.marker([coords.lat, coords.lng], { icon: centerIcon }).addTo(map)
        .bindPopup(`<p style="font-weight:700;font-size:11px;margin:0">You are here</p>`)

      // Add mock provider pins around the center coords
      markersRef.current.forEach(m => m.remove())
      markersRef.current = []

      MOCK_PINS.forEach((pin) => {
        const pinLat = coords.lat + pin.latOffset
        const pinLng = coords.lng + pin.lngOffset

        const initials = pin.name.split(' ').map(n => n[0]).join('').slice(0, 2)
        const icon = L.divIcon({
          className: '',
          html: `
            <div style="
              width: 32px; height: 32px; border-radius: 50%;
              background: linear-gradient(135deg, ${pin.color}, #115e59);
              border: 2px solid white; display: flex; align-items: center;
              justify-content: center; font-weight: 700; font-size: 11px;
              color: white; font-family: sans-serif; cursor: pointer;
            ">${initials}</div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        })

        const marker = L.marker([pinLat, pinLng], { icon })
          .addTo(map)
          .bindPopup(`
            <div style="min-width: 140px; font-family: sans-serif; padding: 2px">
              <p style="font-weight: 700; font-size: 12px; margin: 0 0 2px">${pin.name}</p>
              <p style="font-size: 10px; color: #4b5563; margin: 0 0 6px">${pin.skill} · ${pin.rate}</p>
              <a href="/browse" style="
                display: block; text-align: center; padding: 4px 8px;
                background-color: #0d9488; color: white; border-radius: 6px;
                font-size: 10px; font-weight: 600; text-decoration: none;
              ">View Booking details</a>
            </div>
          `, { maxWidth: 200 })

        markersRef.current.push(marker)
      })

      map.setView([coords.lat, coords.lng], 13)
    }

    init().catch(console.error)

    return () => {
      isMounted = false
      if (mapInstance.current) {
        mapInstance.current.remove()
        mapInstance.current = null
      }
    }
  }, [loading, coords])

  return (
    <div className="relative w-full max-w-4xl mx-auto h-[380px] bg-gray-50 border border-gray-200 rounded-2xl overflow-hidden select-none">
      
      {/* Geolocation Loading overlay */}
      {loading && (
        <div className="absolute inset-0 z-20 bg-gray-50 flex flex-col items-center justify-center gap-3">
          <Loader2 size={24} className="animate-spin text-brand-600" />
          <p className="text-xs text-gray-500 font-semibold">Finding local skills in your neighborhood...</p>
        </div>
      )}

      {/* Map instance container */}
      <div ref={mapRef} className="w-full h-full z-0" />

      {/* Geolocation status pill */}
      <div className="absolute top-4 left-4 z-10 bg-white border border-gray-200 rounded-lg px-3 py-1.5 flex items-center gap-2 text-[10px] font-bold text-gray-700">
        <Compass size={12} className={locationType === 'Detected' ? 'text-brand-600 animate-pulse' : 'text-gray-400'} />
        <span>
          {locationType === 'Detected' ? 'Showing providers near you' : 'Location: Default (Austin, TX)'}
        </span>
      </div>
    </div>
  )
}
