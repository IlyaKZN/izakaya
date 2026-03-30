type Coordinates = [number, number]

type GeocodeResult = {
  geoObjects: {
    get: (index: number) => {
      geometry: {
        getCoordinates: () => Coordinates
      }
      getAddressLine?: () => string
      getPremiseNumber?: () => string
      getLocalities?: () => string[]
      getThoroughfare?: () => string
    } | null
  }
}

type GeocodeOptions = {
  boundedBy?: [Coordinates, Coordinates]
  kind?: string
  results?: number
  strictBounds?: boolean
}

export type YandexMapsApi = {
  Map: new (
    element: HTMLElement,
    state: {
      center: Coordinates
      zoom: number
      controls?: string[]
    },
    options?: Record<string, unknown>,
  ) => YandexMapInstance
  Placemark: new (
    geometry: Coordinates,
    properties?: Record<string, unknown>,
    options?: Record<string, unknown>,
  ) => YandexPlacemarkInstance
  geocode: (request: string | Coordinates, options?: GeocodeOptions) => Promise<GeocodeResult>
  ready: (callback: () => void) => void
}

export type YandexMapInstance = {
  container?: {
    fitToViewport?: () => void
  }
  destroy: () => void
  events: {
    add: (eventName: string, handler: (event: { get: (name: string) => Coordinates }) => void) => void
  }
  geoObjects: {
    add: (object: unknown) => void
  }
  setCenter: (center: Coordinates, zoom?: number, options?: Record<string, unknown>) => void
}

export type YandexPlacemarkInstance = {
  events: {
    add: (eventName: string, handler: () => void) => void
  }
  geometry: {
    getCoordinates: () => Coordinates
    setCoordinates: (coordinates: Coordinates) => void
  }
  properties: {
    set: (key: string, value: string) => void
  }
}

declare global {
  interface Window {
    ymaps?: YandexMapsApi
  }
}

let loaderPromise: Promise<YandexMapsApi> | null = null

export const KAZAN_CENTER: Coordinates = [49.1064, 55.7961]
export const KAZAN_BOUNDS: [Coordinates, Coordinates] = [
  [48.8, 55.65],
  [49.35, 55.95],
]

export const normalizeAddressLabel = (value: string) =>
  value
    .replace(/^Россия,\s*/i, '')
    .replace(/^Республика Татарстан(?:\s*\([^)]*\))?,\s*/i, '')
    .replace(/^Казань,\s*/i, '')
    .trim()

export const loadYandexMapsApi = async (apiKey: string) => {
  if (!apiKey) {
    throw new Error('Не задан API-ключ Яндекс.Карт.')
  }

  if (window.ymaps) {
    return window.ymaps
  }

  if (!loaderPromise) {
    loaderPromise = new Promise<YandexMapsApi>((resolve, reject) => {
      const existingScript = document.querySelector<HTMLScriptElement>(
        'script[data-yandex-maps="v2"]',
      )

      const handleReady = () => {
        if (!window.ymaps) {
          reject(new Error('API Яндекс.Карт не загрузился.'))
          return
        }

        window.ymaps.ready(() => resolve(window.ymaps as YandexMapsApi))
      }

      if (existingScript) {
        existingScript.addEventListener('load', handleReady, { once: true })
        existingScript.addEventListener(
          'error',
          () => reject(new Error('Не удалось загрузить API Яндекс.Карт.')),
          { once: true },
        )

        if (window.ymaps) {
          handleReady()
        }

        return
      }

      const script = document.createElement('script')
      script.src = `https://api-maps.yandex.ru/2.1/?apikey=${apiKey}&lang=ru_RU`
      script.async = true
      script.dataset.yandexMaps = 'v2'
      script.addEventListener('load', handleReady, { once: true })
      script.addEventListener(
        'error',
        () => reject(new Error('Не удалось загрузить API Яндекс.Карт.')),
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
