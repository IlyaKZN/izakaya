type LngLat = [number, number]

type MapMouseEvent = {
  lngLat: {
    lng: number
    lat: number
  }
}

type MarkerDragEvent = {
  target: MapLibreMarker
}

export type MapLibrePopup = {
  setHTML: (html: string) => MapLibrePopup
}

export type MapLibreMarker = {
  setLngLat: (lngLat: LngLat) => MapLibreMarker
  getLngLat: () => { lng: number; lat: number }
  setPopup: (popup: MapLibrePopup) => MapLibreMarker
  addTo: (map: MapLibreMap) => MapLibreMarker
  remove: () => void
  on: (event: 'dragend', handler: (event: MarkerDragEvent) => void) => void
}

export type MapLibreMap = {
  addControl: (control: unknown) => void
  addLayer: (layer: Record<string, unknown>) => void
  addSource: (id: string, source: Record<string, unknown>) => void
  flyTo: (options: { center: LngLat; zoom?: number; pitch?: number }) => void
  getLayer: (id: string) => unknown
  getSource: (id: string) => unknown
  on: {
    (event: 'load', handler: () => void): void
    (event: 'click', handler: (event: MapMouseEvent) => void): void
  }
  remove: () => void
  resize: () => void
  setPaintProperty: (layerId: string, name: string, value: unknown) => void
}

export type MapLibreApi = {
  Map: new (options: {
    container: HTMLElement
    style: string | Record<string, unknown>
    center: LngLat
    zoom: number
    pitch?: number
    maxZoom?: number
    antialias?: boolean
  }) => MapLibreMap
  Marker: new (options?: { color?: string; draggable?: boolean }) => MapLibreMarker
  Popup: new () => MapLibrePopup
  NavigationControl: new () => unknown
}

declare global {
  interface Window {
    maplibregl?: MapLibreApi
  }
}

let loaderPromise: Promise<MapLibreApi> | null = null

export const KAZAN_CENTER: LngLat = [49.11, 55.794]
export const KAZAN_ZOOM = 14
export const DELIVERY_ZONES_SOURCE_ID = 'delivery-zones'
export const DEFAULT_MAP_PITCH = 0
export const DEFAULT_MAP_MAX_ZOOM = 18
export const MAPTILER_API_KEY = import.meta.env.VITE_MAPTILER_API_KEY || 'JD5XQRl5RxcWZzCUU4Pi'

export const normalizeAddressLabel = (value: string) =>
  value
    .replace(/^Россия,\s*/i, '')
    .replace(/^Республика Татарстан(?:\s*\([^)]*\))?,\s*/i, '')
    .replace(/^г\.\s*Казань,\s*/i, '')
    .replace(/^Казань,\s*/i, '')
    .trim()

export async function loadMapLibre() {
  if (window.maplibregl) {
    return window.maplibregl
  }

  if (!loaderPromise) {
    loaderPromise = new Promise<MapLibreApi>((resolve, reject) => {
      const existingLink = document.querySelector<HTMLLinkElement>('link[data-maplibre-css="true"]')

      if (!existingLink) {
        const link = document.createElement('link')
        link.rel = 'stylesheet'
        link.href = 'https://unpkg.com/maplibre-gl@3.0.0/dist/maplibre-gl.css'
        link.dataset.maplibreCss = 'true'
        document.head.append(link)
      }

      const existingScript = document.querySelector<HTMLScriptElement>(
        'script[data-maplibre-js="true"]',
      )

      const handleLoad = () => {
        if (!window.maplibregl) {
          reject(new Error('MapLibre не загрузился.'))
          return
        }

        resolve(window.maplibregl)
      }

      if (existingScript) {
        existingScript.addEventListener('load', handleLoad, { once: true })
        existingScript.addEventListener(
          'error',
          () => reject(new Error('Не удалось загрузить MapLibre.')),
          { once: true },
        )

        if (window.maplibregl) {
          handleLoad()
        }

        return
      }

      const script = document.createElement('script')
      script.src = 'https://unpkg.com/maplibre-gl@3.0.0/dist/maplibre-gl.js'
      script.async = true
      script.dataset.maplibreJs = 'true'
      script.addEventListener('load', handleLoad, { once: true })
      script.addEventListener(
        'error',
        () => reject(new Error('Не удалось загрузить MapLibre.')),
        { once: true },
      )

      document.head.append(script)
    }).catch((error) => {
      loaderPromise = null
      throw error
    })
  }

  return loaderPromise
}

export function createOpenStreetMapStyle() {
  return `https://api.maptiler.com/maps/streets-v2/style.json?key=${MAPTILER_API_KEY}`
}
