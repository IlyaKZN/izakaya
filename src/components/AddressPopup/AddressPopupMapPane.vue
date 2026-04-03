<template>
  <div class="address-popup__right">
    <div class="address-popup__map-header">
      <div>
        <span class="address-popup__map-title">Карта Казани</span>
        <p class="address-popup__map-subtitle">
          {{ selectedAddressLabel || 'Выберите адрес на карте' }}
        </p>
      </div>
      <span class="address-popup__map-badge">Зона доставки</span>
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
      <div v-else-if="mapError" class="address-popup__map-overlay address-popup__map-overlay--error">
        <p>{{ mapError }}</p>
      </div>
    </div>
    <p class="address-popup__map-hint">Зажмите Ctrl + ЛКМ для поворота карты</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

defineOptions({
  name: 'AddressPopupMapPane',
})

defineProps<{
  selectedAddressLabel: string
  isMapLoading: boolean
  mapError: string
}>()

const mapElement = ref<HTMLElement | null>(null)

defineExpose({
  mapElement,
})
</script>

<style lang="scss">
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
  background: rgba(143, 29, 63, 0.18);
  border: 1px solid rgba(143, 29, 63, 0.3);
  color: #f6d8e1;
  font-size: 12px;
}

.address-popup__map-shell {
  position: relative;
  flex: 1;
  min-height: 420px;
}

.address-popup__map-hint {
  margin: 10px 2px 0;
  color: #b9adb2;
  font-size: 12px;
  text-align: center;
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
  .address-popup__right {
    min-height: 420px;
  }
}

@media (max-width: 640px) {
  .address-popup__right {
    padding: 14px;
  }

  .address-popup__map-header {
    flex-direction: column;
    gap: 8px;
    margin-right: 0;
  }
}
</style>
