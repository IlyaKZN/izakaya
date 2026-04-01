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

      <div class="address-popup__left">
        <div class="address-popup__tabs">
          <button
            type="button"
            class="address-popup__tab"
            :class="{ 'address-popup__tab--active': activeTab === 'delivery' }"
            @click="activeTab = 'delivery'"
          >
            Доставка
          </button>

          <button
            type="button"
            class="address-popup__tab"
            :class="{ 'address-popup__tab--active': activeTab === 'pickup' }"
            @click="activeTab = 'pickup'"
          >
            Самовывоз
          </button>
        </div>

        <template v-if="activeTab === 'delivery'">
          <h2 class="address-popup__title">Адрес доставки</h2>

          <label class="address-popup__field">
            <span class="address-popup__label">Улица и дом</span>

            <div class="address-popup__address-row">
              <div ref="suggestContainerRef" class="address-popup__suggest-container">
                <input
                  v-model.trim="form.street"
                  class="address-popup__input"
                  type="text"
                  placeholder="Например, Баумана, 1"
                  autocomplete="off"
                  @input="handleStreetInput"
                  @focus="handleStreetFocus"
                  @keydown.enter.prevent="searchAddress"
                />

                <div v-if="isSuggestOpen" class="address-popup__suggest-list">
                  <button
                    v-for="item in suggestResults"
                    :key="`${item.address}-${item.coords.join(',')}`"
                    type="button"
                    class="address-popup__suggest-item"
                    @click="selectSuggest(item)"
                  >
                    {{ item.address }}
                  </button>
                </div>
              </div>

              <button
                type="button"
                class="address-popup__search"
                :disabled="!canSearchAddress"
                @click="searchAddress"
              >
                {{ isGeocoding ? 'Поиск...' : 'Найти' }}
              </button>
            </div>
          </label>

          <p class="address-popup__hint">
            Начните вводить адрес, выберите подсказку или кликните по карте.
          </p>
          <p
            v-if="deliveryStatusMessage"
            class="address-popup__hint"
            :class="{
              'address-popup__hint--error': deliveryStatusKind === 'error',
              'address-popup__hint--success': deliveryStatusKind === 'success',
            }"
          >
            {{ deliveryStatusMessage }}
          </p>
          <p v-if="addressLookupError" class="address-popup__hint address-popup__hint--error">
            {{ addressLookupError }}
          </p>

          <div class="address-popup__grid">
            <input
              v-model="form.block"
              class="address-popup__input"
              type="text"
              placeholder="Корпус"
            />
            <input
              v-model="form.entrance"
              class="address-popup__input"
              type="text"
              placeholder="Подъезд"
            />
            <input
              v-model="form.intercom"
              class="address-popup__input"
              type="text"
              placeholder="Домофон"
            />
            <input
              v-model="form.floor"
              class="address-popup__input"
              type="text"
              placeholder="Этаж"
            />
          </div>

          <label class="address-popup__field">
            <span class="address-popup__label">Квартира</span>
            <input v-model="form.apartment" class="address-popup__input" type="text" />
          </label>

          <label class="address-popup__checkbox-row">
            <input v-model="form.privateHouse" type="checkbox" class="address-popup__checkbox" />
            <span>Частный дом</span>
          </label>

          <textarea
            v-model="form.note"
            class="address-popup__textarea"
            placeholder="Примечание к адресу"
          />

          <label class="address-popup__checkbox-row">
            <input v-model="form.saveAddress" type="checkbox" class="address-popup__checkbox" />
            <span>Сохранить адрес для будущих заказов</span>
          </label>

          <button
            type="button"
            class="address-popup__submit"
            :disabled="isConfirmDisabled"
            @click="confirmAddress"
          >
            Подтвердить адрес
          </button>
        </template>

        <template v-else>
          <h2 class="address-popup__title">Самовывоз</h2>
          <p class="address-popup__pickup-text">
            Выберите точку на карте справа, чтобы сориентироваться по зоне доставки.
          </p>
        </template>
      </div>

      <div class="address-popup__right">
        <div class="address-popup__map-header">
          <div>
            <span class="address-popup__map-title">Карта Казани</span>
            <p class="address-popup__map-subtitle">
              {{ selectedAddressLabel || 'Выберите адрес на карте' }}
            </p>
          </div>
          <span class="address-popup__map-badge">OpenStreetMap</span>
        </div>

        <div class="address-popup__map-shell">
          <div
            ref="mapElement"
            class="address-popup__map"
            :class="{ 'address-popup__map--error': !!mapError }"
          />
          <div v-if="isMapLoading" class="address-popup__map-overlay">
            Загружаем карту Казани...
          </div>
          <div
            v-else-if="mapError"
            class="address-popup__map-overlay address-popup__map-overlay--error"
          >
            <p>{{ mapError }}</p>
          </div>
        </div>
      </div>
    </div>
  </BasePopup>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, reactive, ref, watch } from 'vue'
import * as geoApi from '@/api/geo'
import BasePopup from '@/components/BasePopup'
import type { SuggestItem } from '@/types/api'
import type { CheckoutAddress } from './types'
import {
  createOpenStreetMapStyle,
  DELIVERY_ZONES_SOURCE_ID,
  KAZAN_CENTER,
  KAZAN_ZOOM,
  loadMapLibre,
  normalizeAddressLabel,
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
const mapElement = ref<HTMLElement | null>(null)
const suggestContainerRef = ref<HTMLElement | null>(null)
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
    comment: form.note.trim() || null,
    lat: addressCoordinates.value?.[0] ?? null,
    lng: addressCoordinates.value?.[1] ?? null,
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
    address?.lat != null && address.lng != null ? [address.lat, address.lng] : null
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
    color: inZone ? '#2fb267' : '#d45b5b',
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
      map.flyTo({ center: [latLon[1], latLon[0]], zoom: 17 })
    }

    if (zone.in_zone) {
      updateDeliveryStatus('Доставка возможна', 'success')
      setMarker(latLon, normalizedAddress, true)
      return
    }

    updateDeliveryStatus('Адрес вне зоны доставки', 'error')
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
    await processResolvedAddress(latLon, response.address || 'Точка на карте', { flyTo: false })
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

    await processResolvedAddress([lat, lon], response.address || query)
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
  form.street = item.address
  hideSuggests()

  const [lat, lon] = item.coords

  if (lat == null || lon == null) return

  await processResolvedAddress([lat, lon], item.address)
}

async function initMap() {
  if (map || !mapElement.value) return

  isMapLoading.value = true
  mapError.value = ''

  try {
    maplibre = await loadMapLibre()

    map = new maplibre.Map({
      container: mapElement.value,
      style: createOpenStreetMapStyle(),
      center: KAZAN_CENTER,
      zoom: KAZAN_ZOOM,
    })

    map.addControl(new maplibre.NavigationControl())

    map.on('load', () => {
      if (!map) return

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
            'fill-color': '#32cd32',
            'fill-opacity': 0.18,
          },
        })

        map.addLayer({
          id: 'zones-outline',
          type: 'line',
          source: DELIVERY_ZONES_SOURCE_ID,
          paint: {
            'line-color': '#32cd32',
            'line-width': 2,
            'line-opacity': 0.65,
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
    if (!isOpen) return

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
  if (suggestContainerRef.value?.contains(target)) return

  hideSuggests()
}

document.addEventListener('click', handleDocumentClick)

onBeforeUnmount(() => {
  if (suggestTimer) {
    clearTimeout(suggestTimer)
    suggestTimer = null
  }

  document.removeEventListener('click', handleDocumentClick)
  userMarker?.remove()
  map?.remove()
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

.address-popup__left {
  padding: 20px;
  border-right: 1px solid rgba(255, 255, 255, 0.08);
  background: #0e0d10;
  overflow-y: auto;
}

.address-popup__tabs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  padding: 4px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.04);
  margin-bottom: 16px;
}

.address-popup__tab {
  height: 46px;
  border-radius: 10px;
  color: #bcb2b6;
  font-weight: 500;
}

.address-popup__tab--active {
  background: var(--accent-button-bg);
  color: #fff;
}

.address-popup__title {
  margin: 0 0 12px;
  font-size: 32px;
  line-height: 1.1;
}

.address-popup__input,
.address-popup__textarea {
  width: 100%;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: #121115;
  color: #f1eced;
  border-radius: 12px;
}

.address-popup__address-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 10px;
}

.address-popup__suggest-container {
  position: relative;
}

.address-popup__suggest-list {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  right: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: #19171c;
  box-shadow: 0 14px 32px rgba(0, 0, 0, 0.35);
  z-index: 3;
}

.address-popup__suggest-item {
  padding: 12px 14px;
  text-align: left;
  color: #f1eced;
  transition: background-color 0.2s ease;
}

.address-popup__suggest-item:hover {
  background: rgba(255, 255, 255, 0.06);
}

.address-popup__search {
  min-width: 112px;
  height: 50px;
  padding: 0 16px;
  border-radius: 12px;
  background: var(--accent-button-bg);
  border: 1px solid var(--accent-soft-border);
  color: #fff;
}

.address-popup__search:disabled,
.address-popup__submit:disabled {
  opacity: 0.55;
}

.address-popup__hint {
  margin: 0 0 12px;
  color: #b9adb2;
  font-size: 13px;
  line-height: 1.4;
}

.address-popup__hint--error {
  color: #f2a6a6;
}

.address-popup__hint--success {
  color: #9ee0ad;
}

.address-popup__grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 10px;
}

.address-popup__input {
  height: 50px;
  padding: 0 12px;
}

.address-popup__field {
  display: block;
  margin-bottom: 10px;
}

.address-popup__label {
  display: block;
  margin-bottom: 6px;
  color: #b9adb2;
  font-size: 13px;
}

.address-popup__checkbox-row {
  min-height: 34px;
  display: flex;
  align-items: center;
  gap: 10px;
  color: #d8d0d3;
  margin: 2px 0;
}

.address-popup__checkbox {
  width: 22px;
  height: 22px;
  margin: 0;
  accent-color: var(--accent);
}

.address-popup__textarea {
  min-height: 82px;
  resize: vertical;
  padding: 10px 12px;
  margin: 10px 0;
  font: inherit;
}

.address-popup__submit {
  margin-top: 12px;
  width: 100%;
  height: 52px;
  border-radius: 12px;
  color: #f5f1f2;
  background: var(--accent-button-bg);
  font-size: 22px;
  font-weight: 600;
}

.address-popup__pickup-text {
  margin: 0;
  color: #b9adb2;
  font-size: 16px;
  line-height: 1.4;
}

.address-popup__right {
  padding: 20px;
  background: #131216;
  display: flex;
  flex-direction: column;
}

.address-popup__map-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-right: 56px;
  margin-bottom: 12px;
}

.address-popup__map-title {
  display: block;
  font-size: 18px;
  font-weight: 600;
  color: #fff;
}

.address-popup__map-subtitle {
  margin: 6px 0 0;
  color: #b9adb2;
  font-size: 13px;
  line-height: 1.4;
}

.address-popup__map-badge {
  display: inline-flex;
  align-items: center;
  min-height: 28px;
  padding: 0 12px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
  color: #f1eced;
  font-size: 12px;
}

.address-popup__map-shell {
  position: relative;
  flex: 1;
  min-height: 420px;
}

.address-popup__map {
  width: 100%;
  height: 100%;
  min-height: 420px;
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  overflow: hidden;
  background: #18161b;
}

.address-popup__map--error {
  background:
    linear-gradient(135deg, rgba(138, 97, 112, 0.16), transparent),
    linear-gradient(180deg, rgba(255, 255, 255, 0.04), rgba(255, 255, 255, 0.01)),
    #18161b;
}

.address-popup__map-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  text-align: center;
  color: #f1eced;
  background: rgba(17, 16, 19, 0.74);
  backdrop-filter: blur(4px);
}

.address-popup__map-overlay--error {
  flex-direction: column;
  gap: 8px;

  p {
    margin: 0;
    max-width: 320px;
    line-height: 1.45;
  }
}

@media (max-width: 1060px) {
  .address-popup {
    grid-template-columns: 1fr;
    min-height: 0;
  }

  .address-popup__left {
    border-right: none;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  }

  .address-popup__right {
    min-height: 420px;
  }
}

@media (max-width: 640px) {
  .address-popup__modal {
    width: calc(100vw - 16px);
    max-height: calc(100vh - 16px);
  }

  .address-popup__left,
  .address-popup__right {
    padding: 14px;
  }

  .address-popup__title {
    font-size: 24px;
  }

  .address-popup__grid,
  .address-popup__address-row {
    grid-template-columns: 1fr;
  }

  .address-popup__map-header {
    flex-direction: column;
    gap: 8px;
    margin-right: 0;
  }
}
</style>
