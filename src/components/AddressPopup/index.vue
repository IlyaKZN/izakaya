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

          <button type="button" class="address-popup__address-select">
            <span>{{ form.street || 'Введите улицу и дом' }}</span>
            <span class="material-symbols">expand_more</span>
          </button>

          <div class="address-popup__grid">
            <input v-model="form.block" class="address-popup__input" type="text" placeholder="Корпус" />
            <input v-model="form.entrance" class="address-popup__input" type="text" placeholder="Подъезд" />
            <input v-model="form.intercom" class="address-popup__input" type="text" placeholder="Домофон" />
            <input v-model="form.floor" class="address-popup__input" type="text" placeholder="Этаж" />
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
          <span>Карта зон доставки</span>
          <div class="address-popup__zones">
            <span class="address-popup__zone address-popup__zone--first">Зона 1</span>
            <span class="address-popup__zone address-popup__zone--second">Зона 2</span>
            <span class="address-popup__zone address-popup__zone--third">Зона 3</span>
          </div>
        </div>

        <div class="address-popup__map">
          <div class="address-popup__circle address-popup__circle--one"></div>
          <div class="address-popup__circle address-popup__circle--two"></div>
          <div class="address-popup__circle address-popup__circle--three"></div>
          <div class="address-popup__map-center">Ваш адрес</div>
        </div>
      </div>
    </div>
  </BasePopup>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import BasePopup from '@/components/BasePopup';

defineOptions({
  name: 'AddressPopup',
});

const props = defineProps<{
  modelValue: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
  (e: 'confirm', value: string): void;
}>();

const activeTab = ref<'delivery' | 'pickup'>('delivery');

const form = reactive({
  street: 'Кремлевская улица, 27',
  block: '',
  entrance: '',
  intercom: '',
  floor: '',
  apartment: '1',
  privateHouse: false,
  note: '',
  saveAddress: false,
});

const confirmAddress = () => {
  emit('confirm', form.street);
  emit('update:modelValue', false);
};
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

.address-popup__address-select,
.address-popup__input,
.address-popup__textarea {
  width: 100%;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: #121115;
  color: #f1eced;
  border-radius: 12px;
}

.address-popup__address-select {
  height: 54px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 14px;
  margin-bottom: 12px;

  span:last-child {
    color: #b9adb2;
  }
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
  align-items: center;
  margin-right: 56px;
  margin-bottom: 12px;
}

.address-popup__zones {
  display: flex;
  gap: 8px;
}

.address-popup__zone {
  height: 26px;
  border-radius: 999px;
  padding: 0 10px;
  display: inline-flex;
  align-items: center;
  font-size: 12px;
}

.address-popup__zone--first {
  background: rgba(132, 45, 66, 0.45);
}

.address-popup__zone--second {
  background: rgba(132, 45, 66, 0.28);
}

.address-popup__zone--third {
  background: rgba(132, 45, 66, 0.17);
}

.address-popup__map {
  flex: 1;
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background:
    linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px),
    linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px),
    #18161b;
  background-size: 44px 44px;
  position: relative;
  overflow: hidden;
}

.address-popup__circle {
  position: absolute;
  border-radius: 50%;
  border: 1px solid rgba(132, 45, 66, 0.45);
}

.address-popup__circle--one {
  width: 240px;
  height: 240px;
  top: 46%;
  left: 54%;
  transform: translate(-50%, -50%);
  background: rgba(132, 45, 66, 0.12);
}

.address-popup__circle--two {
  width: 360px;
  height: 360px;
  top: 46%;
  left: 54%;
  transform: translate(-50%, -50%);
  background: rgba(132, 45, 66, 0.08);
}

.address-popup__circle--three {
  width: 490px;
  height: 490px;
  top: 46%;
  left: 54%;
  transform: translate(-50%, -50%);
  background: rgba(132, 45, 66, 0.04);
}

.address-popup__map-center {
  position: absolute;
  top: 46%;
  left: 54%;
  transform: translate(-50%, -50%);
  padding: 8px 12px;
  border-radius: 999px;
  background: #8a6170;
  color: #fff;
  font-size: 13px;
  font-weight: 600;
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
    min-height: 340px;
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

  .address-popup__map-header {
    align-items: flex-start;
    flex-direction: column;
    gap: 8px;
    margin-right: 0;
  }
}
</style>
