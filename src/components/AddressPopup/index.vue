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
              <input
                v-model.trim="form.street"
                class="address-popup__input"
                type="text"
                placeholder="Например, Кремлевская улица, 27"
                @keydown.enter.prevent="searchAddress"
              />
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
            Кликните по карте Казани, перетащите метку или введите адрес и нажмите «Найти».
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
            :disabled="!form.street"
            @click="confirmAddress"
          >
            Подтвердить адрес
          </button>
        </template>

        <template v-else>
          <h2 class="address-popup__title">Самовывоз</h2>
          <p class="address-popup__pickup-text">
            Выберите ближайший ресторан на карте справа и оформите заказ без доставки.
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
          <span class="address-popup__map-badge">Яндекс.Карты</span>
        </div>

        <div class="address-popup__map-shell">
          <div ref="mapElement" class="address-popup__map" :class="{ 'address-popup__map--error': !!mapError }"></div>
          <div v-if="isMapLoading" class="address-popup__map-overlay">
            Загружаем карту Казани...
          </div>
          <div v-else-if="mapError" class="address-popup__map-overlay address-popup__map-overlay--error">
            <p>{{ mapError }}</p>
            <p>Добавьте `VITE_YANDEX_MAPS_API_KEY` в `.env`, чтобы выбор адреса на карте заработал.</p>
          </div>
        </div>
      </div>
    </div>
  </BasePopup>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, reactive, ref, watch } from 'vue'
import BasePopup from '@/components/BasePopup'
import type { OrderAddressInput } from '@/types/api'
import type { CheckoutAddress } from './types'
import {
  KAZAN_BOUNDS,
  KAZAN_CENTER,
  loadYandexMapsApi,
  normalizeAddressLabel,
  type YandexMapInstance,
  type YandexMapsApi,
  type YandexPlacemarkInstance,
} from '@/utils/yandexMaps'

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

const YANDEX_MAPS_API_KEY = import.meta.env.VITE_YANDEX_MAPS_API_KEY?.trim() ?? ''

const activeTab = ref<'delivery' | 'pickup'>('delivery')
const mapElement = ref<HTMLElement | null>(null)
const isMapLoading = ref(false)
const isGeocoding = ref(false)
const mapError = ref('')
const addressLookupError = ref('')
const selectedAddressLabel = ref('')

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

let ymaps: YandexMapsApi | null = null
let map: YandexMapInstance | null = null
let placemark: YandexPlacemarkInstance | null = null

const canSearchAddress = computed(
  () => !!form.street.trim() && !isGeocoding.value && !isMapLoading.value && !mapError.value,
)

const updatePlacemark = (coordinates: [number, number], caption: string) => {
  if (!placemark) return

  placemark.geometry.setCoordinates(coordinates)
  placemark.properties.set('iconCaption', caption)
}

const applySelectedAddress = (address: string, coordinates?: [number, number]) => {
  const normalizedAddress = normalizeAddressLabel(address)
  form.street = normalizedAddress
  selectedAddressLabel.value = normalizedAddress

  if (coordinates) {
    addressCoordinates.value = coordinates
    updatePlacemark(coordinates, normalizedAddress)
    map?.setCenter(coordinates, 16, { duration: 250 })
  }
}

const splitStreetAndHouse = (value: string) => {
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

const toOrderAddress = (): CheckoutAddress => {
  const { street, house } = splitStreetAndHouse(form.street)

  return {
    city: 'Казань',
    street,
    house: [house, form.block.trim()].filter(Boolean).join(', корп. '),
    apartment: form.privateHouse ? null : form.apartment.trim() || null,
    entrance: form.entrance.trim() || null,
    floor: form.floor.trim() || null,
    comment: form.note.trim() || null,
    lat: addressCoordinates.value?.[1] ?? null,
    lng: addressCoordinates.value?.[0] ?? null,
    label: form.street.trim(),
    intercom: form.intercom.trim() || null,
    privateHouse: form.privateHouse,
    saveAddress: form.saveAddress,
  }
}

const fillFormFromAddress = (address?: CheckoutAddress | null) => {
  form.street = address?.label || [address?.street, address?.house].filter(Boolean).join(', ')
  form.block = ''
  form.entrance = address?.entrance || ''
  form.intercom = address?.intercom || ''
  form.floor = address?.floor || ''
  form.apartment = address?.apartment || ''
  form.privateHouse = Boolean(address?.privateHouse)
  form.note = address?.comment || ''
  form.saveAddress = Boolean(address?.saveAddress)
  addressCoordinates.value =
    address?.lng != null && address.lat != null ? [address.lng, address.lat] : null
  selectedAddressLabel.value = form.street

  if (addressCoordinates.value && placemark) {
    updatePlacemark(addressCoordinates.value, form.street)
    map?.setCenter(addressCoordinates.value, 16, { duration: 0 })
  }
}

const reverseGeocode = async (coordinates: [number, number]) => {
  if (!ymaps) return

  isGeocoding.value = true
  addressLookupError.value = ''

  try {
    const result = await ymaps.geocode(coordinates, {
      boundedBy: KAZAN_BOUNDS,
      kind: 'house',
      results: 1,
      strictBounds: true,
    })
    const firstGeoObject = result.geoObjects.get(0)

    if (!firstGeoObject) {
      throw new Error('Адрес не найден в пределах Казани.')
    }

    const address =
      firstGeoObject.getAddressLine?.() ??
      [
        firstGeoObject.getLocalities?.()?.[0],
        firstGeoObject.getThoroughfare?.(),
        firstGeoObject.getPremiseNumber?.(),
      ]
        .filter(Boolean)
        .join(', ')

    if (!address) {
      throw new Error('Не удалось определить адрес.')
    }

    applySelectedAddress(address, coordinates)
  } catch (error) {
    addressLookupError.value =
      error instanceof Error ? error.message : 'Не удалось определить адрес по точке на карте.'
  } finally {
    isGeocoding.value = false
  }
}

const searchAddress = async () => {
  if (!ymaps || !form.street.trim() || isGeocoding.value) return

  isGeocoding.value = true
  addressLookupError.value = ''

  try {
    const query = form.street.toLowerCase().includes('казань')
      ? form.street
      : `Казань, ${form.street}`

    const result = await ymaps.geocode(query, {
      boundedBy: KAZAN_BOUNDS,
      results: 1,
      strictBounds: true,
    })
    const firstGeoObject = result.geoObjects.get(0)

    if (!firstGeoObject) {
      throw new Error('Не нашли такой адрес в Казани.')
    }

    const coordinates = firstGeoObject.geometry.getCoordinates()
    const address = firstGeoObject.getAddressLine?.() ?? query

    applySelectedAddress(address, coordinates)
  } catch (error) {
    addressLookupError.value = error instanceof Error ? error.message : 'Не удалось найти адрес.'
  } finally {
    isGeocoding.value = false
  }
}

const initMap = async () => {
  if (map || !mapElement.value) return
  if (!YANDEX_MAPS_API_KEY) {
    mapError.value = 'Карта недоступна без API-ключа Яндекс.Карт.'
    return
  }

  isMapLoading.value = true
  mapError.value = ''

  try {
    ymaps = await loadYandexMapsApi(YANDEX_MAPS_API_KEY)

    map = new ymaps.Map(
      mapElement.value,
      {
        center: KAZAN_CENTER,
        zoom: 12,
        controls: ['zoomControl', 'fullscreenControl'],
      },
      {
        suppressMapOpenBlock: true,
      },
    )

    placemark = new ymaps.Placemark(
      KAZAN_CENTER,
      {
        iconCaption: normalizeAddressLabel(form.street),
        hintContent: 'Выбранный адрес',
      },
      {
        draggable: true,
        preset: 'islands#redDotIconWithCaption',
      },
    )

    map.geoObjects.add(placemark)

    map.events.add('click', (event) => {
      void reverseGeocode(event.get('coords'))
    })

    placemark.events.add('dragend', () => {
      const coordinates = placemark?.geometry.getCoordinates()

      if (coordinates) {
        void reverseGeocode(coordinates)
      }
    })

    await reverseGeocode(KAZAN_CENTER)
  } catch (error) {
    mapError.value =
      error instanceof Error ? error.message : 'Не удалось инициализировать Яндекс.Карты.'
  } finally {
    isMapLoading.value = false
  }
}

const confirmAddress = () => {
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
    map?.container?.fitToViewport?.()
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  map?.destroy()
})
</script>

<style lang="scss">
.address-popup__modal {
  width: min(1050px, calc(100vw - 40px));
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
  grid-template-columns: 460px minmax(0, 1fr);
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
  background: #8a6170;
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

.address-popup__search {
  min-width: 112px;
  height: 50px;
  padding: 0 16px;
  border-radius: 12px;
  background: rgba(138, 97, 112, 0.2);
  border: 1px solid rgba(138, 97, 112, 0.45);
  color: #fff;
}

.address-popup__search:disabled {
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
  height: 34px;
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
  accent-color: #8a6170;
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
  background: linear-gradient(180deg, #8a6170, #724c59);
  font-size: 22px;
  font-weight: 600;
}

.address-popup__submit:disabled {
  opacity: 0.55;
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

  .address-popup__grid {
    grid-template-columns: 1fr;
  }

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
