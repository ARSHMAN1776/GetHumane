'use client'

import { useEffect, useRef, useState } from 'react'
import { MapPin, Loader2 } from 'lucide-react'
import type { ProviderCardData } from '@/types'

interface Props {
  providers: ProviderCardData[]
}

interface GeoProvider extends ProviderCardData {
  lat: number
  lng: number
}

// Geocode a city name → lat/lng using Nominatim (free, no API key)
const geocodeCache = new Map<string, { lat: number; lng: number } | null>()

async function geocodeCity(city: string): Promise<{ lat: number; lng: number } | null> {
  if (geocodeCache.has(city)) return geocodeCache.get(city)!
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(city)}&format=json&limit=1`,
      { headers: { 'Accept-Language': 'en' } }
    )
    const data = await res.json()
    const result = data[0] ? { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) } : null
    geocodeCache.set(city, result)
    return result
  } catch {
    geocodeCache.set(city, null)
    return null
  }
}

export default function ProviderMap({ providers }: Props) {
  const mapRef      = useRef<HTMLDivElement>(null)
  const leafletRef  = useRef<any>(null)
  const mapInstance = useRef<any>(null)
  const markersRef  = useRef<any[]>([])
  const [geocoding, setGeocoding] = useState(true)
  const [geoProviders, setGeoProviders] = useState<GeoProvider[]>([])

  // Step 1 — geocode all cities
  useEffect(() => {
    if (providers.length === 0) { setGeocoding(false); return }
    setGeocoding(true)

    const uniqueCities = [...new Set(providers.map(p => p.city).filter(Boolean))]

    Promise.all(uniqueCities.map(city => geocodeCity(city!))).then(() => {
      const located = providers.flatMap(p => {
        if (!p.city) return []
        const coords = geocodeCache.get(p.city)
        if (!coords) return []
        // Jitter so stacked providers don't overlap exactly
        return [{ ...p, lat: coords.lat + (Math.random() - 0.5) * 0.008, lng: coords.lng + (Math.random() - 0.5) * 0.008 }]
      })
      setGeoProviders(located)
      setGeocoding(false)
    })
  }, [providers])

  // Step 2 — initialise Leaflet map once geocoding done
  useEffect(() => {
    if (geocoding || !mapRef.current) return

    const init = async () => {
      const L = (await import('leaflet')).default
      await import('leaflet/dist/leaflet.css')
      leafletRef.current = L

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

      const map = L.map(mapRef.current!, { zoomControl: true })
      mapInstance.current = map

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 18,
      }).addTo(map)

      // Place markers
      markersRef.current.forEach(m => m.remove())
      markersRef.current = []

      if (geoProviders.length === 0) {
        map.setView([20, 0], 2)
      } else {
        const bounds: [number, number][] = []

        geoProviders.forEach(p => {
          const skillText = p.skills[0]?.skill_name ?? 'Provider'
          const rateText  = p.skills[0]?.hourly_rate ? `$${p.skills[0].hourly_rate}/hr` : ''
          const initials  = p.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() ?? '?'

          const icon = L.divIcon({
            className: '',
            html: `
              <div style="
                width:36px;height:36px;border-radius:50%;
                background:linear-gradient(135deg,#14b8a6,#0f766e);
                border:2px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.25);
                display:flex;align-items:center;justify-content:center;
                font-weight:700;font-size:13px;color:white;font-family:sans-serif;
                cursor:pointer;
              ">${initials}</div>
            `,
            iconSize: [36, 36],
            iconAnchor: [18, 18],
          })

          const marker = L.marker([p.lat, p.lng], { icon })
            .addTo(map)
            .bindPopup(`
              <div style="min-width:160px;font-family:sans-serif">
                <p style="font-weight:700;font-size:14px;margin:0 0 2px">${p.full_name}</p>
                <p style="font-size:12px;color:#6b7280;margin:0 0 4px">${skillText}${rateText ? ' · ' + rateText : ''}</p>
                ${p.city ? `<p style="font-size:11px;color:#9ca3af;margin:0">📍 ${p.city}</p>` : ''}
                <a href="/provider/${p.id}" style="
                  display:inline-block;margin-top:8px;padding:5px 12px;
                  background:linear-gradient(135deg,#14b8a6,#0f766e);
                  color:white;border-radius:8px;font-size:12px;font-weight:600;
                  text-decoration:none;
                ">View Profile</a>
              </div>
            `, { maxWidth: 220 })

          markersRef.current.push(marker)
          bounds.push([p.lat, p.lng])
        })

        if (bounds.length === 1) {
          map.setView(bounds[0], 12)
        } else {
          map.fitBounds(bounds as any, { padding: [40, 40], maxZoom: 13 })
        }
      }
    }

    init().catch(console.error)

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove()
        mapInstance.current = null
      }
    }
  }, [geocoding, geoProviders])

  return (
    <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-sm relative" style={{ height: 560 }}>
      {geocoding && (
        <div className="absolute inset-0 z-10 bg-gray-50 flex flex-col items-center justify-center gap-3">
          <Loader2 size={28} className="animate-spin text-brand-500" />
          <p className="text-sm text-gray-500">Locating providers on map…</p>
        </div>
      )}

      {!geocoding && geoProviders.length === 0 && (
        <div className="absolute inset-0 z-10 bg-gray-50 flex flex-col items-center justify-center gap-2 text-center px-8">
          <MapPin size={36} className="text-gray-300" />
          <p className="font-semibold text-gray-500">No providers with a city set</p>
          <p className="text-sm text-gray-400">Providers need to add their city in profile settings to appear on the map.</p>
        </div>
      )}

      <div ref={mapRef} className="w-full h-full" />
    </div>
  )
}
