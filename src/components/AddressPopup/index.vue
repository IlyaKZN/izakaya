<template>
  <BasePopup
    :model-value="modelValue"
    :show-close-button="false"
    :close-on-overlay="true"
    content-class="address-popup__modal"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <div class="address-popup">
      <button
        type="button"
        class="address-popup__close"
        aria-label="Закрыть"
        @click="emit('update:modelValue', false)"
      >
        <span class="material-symbols">close</span>
      </button>

      <AddressPopupFormPane
        ref="formPaneRef"
        :active-tab="activeTab"
        :form="form"
        :suggest-results="suggestResults"
        :is-suggest-open="isSuggestOpen"
        :can-search-address="canSearchAddress"
        :is-geocoding="isGeocoding"
        :delivery-status-message="deliveryStatusMessage"
        :delivery-status-kind="deliveryStatusKind"
        :address-lookup-error="addressLookupError"
        :is-confirm-disabled="isConfirmDisabled"
        :get-suggest-title="getSuggestTitle"
        :get-suggest-address="getSuggestAddress"
        @update:active-tab="activeTab = $event"
        @street-input="handleStreetInput"
        @street-focus="handleStreetFocus"
        @search="searchAddress"
        @select-suggest="selectSuggest"
        @confirm="confirmAddress"
      />

      <AddressPopupMapPane
        ref="mapPaneRef"
        :selected-address-label="selectedAddressLabel"
        :is-map-loading="isMapLoading"
        :map-error="mapError"
      />
    </div>
  </BasePopup>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, reactive, ref, watch } from 'vue'
import * as geoApi from '@/api/geo'
import BasePopup from '@/components/BasePopup'
import AddressPopupFormPane from './AddressPopupFormPane.vue'
import AddressPopupMapPane from './AddressPopupMapPane.vue'
import type { SuggestItem } from '@/types/api'
import type { CheckoutAddress } from './types'
import {
  createOpenStreetMapStyle,
  DELIVERY_ZONES_SOURCE_ID,
  KAZAN_CENTER,
  KAZAN_ZOOM,
  loadMapLibre,
  normalizeAddressLabel,
  DEFAULT_MAP_MAX_ZOOM,
  DEFAULT_MAP_PITCH,
  type MapLibreApi,
  type MapLibreMap,
  type MapLibreMarker,
} from '@/utils/mapLibre'

defineOptions({
  name: 'AddressPopup',
})

const props = defineProps<{
  modelValue: boolean
  initialAddress?: CheckoutAddress | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'confirm', value: CheckoutAddress): void
}>()

const activeTab = ref<'delivery' | 'pickup'>('delivery')
const mapPaneRef = ref<{ mapElement: HTMLElement | null } | null>(null)
const formPaneRef = ref<{ suggestContainer: HTMLElement | null } | null>(null)
const isMapLoading = ref(false)
const isGeocoding = ref(false)
const isSuggestLoading = ref(false)
const mapError = ref('')
const addressLookupError = ref('')
const selectedAddressLabel = ref('')
const deliveryStatusMessage = ref('')
const deliveryStatusKind = ref<'neutral' | 'success' | 'error'>('neutral')
const suggestResults = ref<SuggestItem[]>([])
const isSuggestOpen = ref(false)
const isInDeliveryZone = ref<boolean | null>(null)

const form = reactive({
  street: '',
  block: '',
  entrance: '',
  intercom: '',
  floor: '',
  apartment: '',
  privateHouse: false,
  note: '',
  saveAddress: false,
})

const addressCoordinates = ref<[number, number] | null>(null)

let maplibre: MapLibreApi | null = null
let map: MapLibreMap | null = null
let userMarker: MapLibreMarker | null = null
let suggestTimer: ReturnType<typeof setTimeout> | null = null
let suggestRequestId = 0

const canSearchAddress = computed(
  () => !!form.street.trim() && !isGeocoding.value && !isMapLoading.value && !mapError.value,
)

const isConfirmDisabled = computed(() => {
  if (activeTab.value !== 'delivery') return true

  return !form.street.trim() || isGeocoding.value || isInDeliveryZone.value !== true
})

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function updateDeliveryStatus(message: string, kind: 'neutral' | 'success' | 'error') {
  deliveryStatusMessage.value = message
  deliveryStatusKind.value = kind
}

function hideSuggests() {
  isSuggestOpen.value = false
}

function showSuggests() {
  isSuggestOpen.value = suggestResults.value.length > 0
}

function splitStreetAndHouse(value: string) {
  const normalized = normalizeAddressLabel(value)
  const match = normalized.match(/^(.*?),(?:\s*)дом\s+(.+)$/i)

  if (match) {
    return {
      street: match[1]?.trim() ?? normalized,
      house: match[2]?.trim() ?? '',
    }
  }

  const fallbackMatch = normalized.match(/^(.*?)[,\s]+(\d+[A-Za-zА-Яа-я0-9/-]*)$/)

  if (fallbackMatch) {
    return {
      street: fallbackMatch[1]?.trim() ?? normalized,
      house: fallbackMatch[2]?.trim() ?? '',
    }
  }

  return {
    street: normalized,
    house: '',
  }
}

function buildAddressLabel(street?: string | null, house?: string | null) {
  return [street?.trim(), house?.trim()].filter(Boolean).join(', ').trim()
}

function getSuggestTitle(item: SuggestItem) {
  return item.name?.trim() || item.street.trim() || 'Адрес'
}

function getSuggestAddress(item: SuggestItem) {
  return buildAddressLabel(item.street, item.house)
}

function toOrderAddress(): CheckoutAddress {
  const { street, house } = splitStreetAndHouse(form.street)

  return {
    city: 'Казань',
    street,
    house: [house, form.block.trim()].filter(Boolean).join(', корп. '),
    is_private_house: form.privateHouse,
    apartment: form.privateHouse ? null : form.apartment.trim() || null,
    entrance: form.entrance.trim() || null,
    floor: form.floor.trim() || null,
    coords: addressCoordinates.value ? [...addressCoordinates.value] : null,
    label: form.street.trim(),
    intercom: form.intercom.trim() || null,
    privateHouse: form.privateHouse,
    saveAddress: form.saveAddress,
  }
}

function fillFormFromAddress(address?: CheckoutAddress | null) {
  form.street = address?.label || [address?.street, address?.house].filter(Boolean).join(', ')
  form.block = ''
  form.entrance = address?.entrance || ''
  form.intercom = address?.intercom || ''
  form.floor = address?.floor || ''
  form.apartment = address?.apartment || ''
  form.privateHouse = Boolean(address?.privateHouse ?? address?.is_private_house)
  form.note = address?.comment || ''
  form.saveAddress = Boolean(address?.saveAddress)

  addressCoordinates.value =
    address?.coords?.[0] != null && address.coords[1] != null
      ? [address.coords[0], address.coords[1]]
      : null
  selectedAddressLabel.value = form.street
  suggestResults.value = []
  hideSuggests()
  addressLookupError.value = ''
  updateDeliveryStatus('', 'neutral')
  isInDeliveryZone.value = null
}

function setMarker(latLon: [number, number], text: string, inZone: boolean) {
  if (!map || !maplibre) return

  const lngLat: [number, number] = [latLon[1], latLon[0]]

  userMarker?.remove()
  userMarker = new maplibre.Marker({
    color: inZone ? '#8f1d3f' : '#b14b68',
    draggable: true,
  })
    .setLngLat(lngLat)
    .setPopup(new maplibre.Popup().setHTML(`<b>${escapeHtml(text)}</b>`))
    .addTo(map)

  userMarker.on('dragend', (event) => {
    const nextPosition = event.target.getLngLat()
    void handleMapPick([nextPosition.lat, nextPosition.lng])
  })
}

function destroyMap() {
  userMarker?.remove()
  userMarker = null
  map?.remove()
  map = null
}

async function processResolvedAddress(
  latLon: [number, number],
  address: string,
  options: { flyTo?: boolean } = {},
) {
  const { flyTo = true } = options

  isGeocoding.value = true
  addressLookupError.value = ''

  try {
    const zone = await geoApi.checkDeliveryZone(latLon[0], latLon[1])
    const normalizedAddress = normalizeAddressLabel(address)

    addressCoordinates.value = latLon
    form.street = normalizedAddress
    selectedAddressLabel.value = normalizedAddress
    isInDeliveryZone.value = zone.in_zone

    if (flyTo && map) {
      map.flyTo({ center: [latLon[1], latLon[0]], zoom: 17, pitch: 24 })
    }

    if (zone.in_zone) {
      updateDeliveryStatus('✅ Доставка возможна!', 'success')
      setMarker(latLon, normalizedAddress, true)
      return
    }

    updateDeliveryStatus('❌ Вне зоны доставки', 'error')
    setMarker(latLon, 'Вне зоны доставки', false)
  } catch (error) {
    isInDeliveryZone.value = null
    addressLookupError.value =
      error instanceof Error ? error.message : 'Не удалось проверить зону доставки.'
  } finally {
    isGeocoding.value = false
  }
}

async function handleMapPick(latLon: [number, number]) {
  hideSuggests()

  try {
    const response = await geoApi.reverseGeocode(latLon[0], latLon[1])
    const resolvedAddress =
      buildAddressLabel(response.street, response.house) || normalizeAddressLabel(form.street)

    await processResolvedAddress(latLon, resolvedAddress || 'Точка на карте', { flyTo: false })
  } catch {
    await processResolvedAddress(latLon, 'Точка на карте', { flyTo: false })
  }
}

async function searchAddress() {
  const query = form.street.trim()

  if (!query || isGeocoding.value) return

  hideSuggests()
  isGeocoding.value = true
  addressLookupError.value = ''

  try {
    const response = await geoApi.searchAddress(query)

    if (!response.success || !response.coords?.length) {
      throw new Error(response.message || 'Не нашли такой адрес в Казани.')
    }

    const [lat, lon] = response.coords

    if (lat == null || lon == null) {
      throw new Error(response.message || 'Не удалось определить координаты адреса.')
    }

    const resolvedAddress = buildAddressLabel(response.street, response.house) || query
    await processResolvedAddress([lat, lon], resolvedAddress)
  } catch (error) {
    isGeocoding.value = false
    addressLookupError.value = error instanceof Error ? error.message : 'Не удалось найти адрес.'
  }
}

async function fetchSuggests(query: string) {
  if (query.length < 3) {
    suggestResults.value = []
    hideSuggests()
    return
  }

  const currentRequestId = ++suggestRequestId
  isSuggestLoading.value = true

  try {
    const response = await geoApi.suggestAddresses(query)

    if (currentRequestId !== suggestRequestId) return

    suggestResults.value = response.success ? response.results ?? [] : []

    if (suggestResults.value.length) {
      showSuggests()
    } else {
      hideSuggests()
    }
  } catch {
    if (currentRequestId !== suggestRequestId) return

    suggestResults.value = []
    hideSuggests()
  } finally {
    if (currentRequestId === suggestRequestId) {
      isSuggestLoading.value = false
    }
  }
}

function scheduleSuggest(query: string) {
  if (suggestTimer) {
    clearTimeout(suggestTimer)
  }

  suggestTimer = setTimeout(() => {
    void fetchSuggests(query)
  }, 400)
}

function handleStreetInput() {
  updateDeliveryStatus('', 'neutral')
  isInDeliveryZone.value = null
  scheduleSuggest(form.street.trim())
}

function handleStreetFocus() {
  if (suggestResults.value.length) {
    showSuggests()
  }
}

async function selectSuggest(item: SuggestItem) {
  const resolvedAddress = buildAddressLabel(item.street, item.house)
  form.street = item.name?.trim() ? `${item.name.trim()} (${resolvedAddress})` : resolvedAddress
  hideSuggests()

  const [lat, lon] = item.coords

  if (lat == null || lon == null) return

  await processResolvedAddress([lat, lon], resolvedAddress)
}

async function initMap() {
  const mapElement = mapPaneRef.value?.mapElement

  if (map || !mapElement) return

  isMapLoading.value = true
  mapError.value = ''

  try {
    maplibre = await loadMapLibre()

    map = new maplibre.Map({
      container: mapElement,
      style: createOpenStreetMapStyle(),
      center: KAZAN_CENTER,
      zoom: KAZAN_ZOOM,
      pitch: DEFAULT_MAP_PITCH,
      maxZoom: DEFAULT_MAP_MAX_ZOOM,
      antialias: true,
    })

    map.addControl(new maplibre.NavigationControl())

    map.on('load', () => {
      if (!map) return

      if (map.getLayer('building')) {
        map.setPaintProperty('building', 'fill-extrusion-opacity', 0.8)
      }

      if (!map.getSource(DELIVERY_ZONES_SOURCE_ID)) {
        map.addSource(DELIVERY_ZONES_SOURCE_ID, {
          type: 'geojson',
          data: '/static/data.geojson',
        })

        map.addLayer({
          id: 'zones-layer',
          type: 'fill',
          source: DELIVERY_ZONES_SOURCE_ID,
          paint: {
            'fill-color': '#8f1d3f',
            'fill-opacity': 0.18,
          },
        })

        map.addLayer({
          id: 'zones-outline',
          type: 'line',
          source: DELIVERY_ZONES_SOURCE_ID,
          paint: {
            'line-color': '#d37a98',
            'line-width': 2,
            'line-opacity': 0.78,
          },
        })
      }
    })

    map.on('click', (event) => {
      void handleMapPick([event.lngLat.lat, event.lngLat.lng])
    })
  } catch (error) {
    mapError.value =
      error instanceof Error ? error.message : 'Не удалось инициализировать карту.'
  } finally {
    isMapLoading.value = false
  }
}

async function syncInitialSelection() {
  if (!props.initialAddress) return

  if (addressCoordinates.value) {
    const [lat, lon] = addressCoordinates.value
    await processResolvedAddress([lat, lon], form.street || selectedAddressLabel.value, {
      flyTo: true,
    })
  } else if (form.street.trim()) {
    await searchAddress()
  }
}

function confirmAddress() {
  if (isConfirmDisabled.value) return

  emit('confirm', toOrderAddress())
  emit('update:modelValue', false)
}

watch(
  () => props.modelValue,
  async (isOpen) => {
    if (!isOpen) {
      destroyMap()
      return
    }

    await nextTick()
    fillFormFromAddress(props.initialAddress)
    await initMap()
    map?.resize()
    await syncInitialSelection()
  },
  { immediate: true },
)

watch(
  () => props.initialAddress,
  (nextAddress) => {
    if (!props.modelValue) return

    fillFormFromAddress(nextAddress)
  },
)

function handleDocumentClick(event: MouseEvent) {
  const target = event.target

  if (!(target instanceof Node)) return
  if (formPaneRef.value?.suggestContainer?.contains(target)) return

  hideSuggests()
}

document.addEventListener('click', handleDocumentClick)

onBeforeUnmount(() => {
  if (suggestTimer) {
    clearTimeout(suggestTimer)
    suggestTimer = null
  }

  document.removeEventListener('click', handleDocumentClick)
  destroyMap()
})
</script>

<style lang="scss">
.address-popup__modal {
  width: min(1120px, calc(100vw - 40px));
  max-height: min(760px, calc(100vh - 40px));
  padding: 0;
  border-radius: 18px;
  overflow: hidden;
  background: #111013;
  border: 1px solid rgba(255, 255, 255, 0.12);
}

.address-popup {
  position: relative;
  display: grid;
  grid-template-columns: 440px minmax(0, 1fr);
  color: #f1eced;
  min-height: 620px;
}

.address-popup__close {
  position: absolute;
  top: 14px;
  right: 14px;
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.14);
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;

  span {
    font-size: 22px;
  }
}

@media (max-width: 1060px) {
  .address-popup {
    grid-template-columns: 1fr;
    min-height: 0;
  }
}

@media (max-width: 640px) {
  .address-popup__modal {
    width: calc(100vw - 16px);
    max-height: calc(100vh - 16px);
  }
}
</style>
