<template>
  <teleport to="body">
    <transition name="popup-fade">
      <div
        v-if="modelValue"
        class="base-popup"
        @click="handleOverlayClick"
      >
        <div
          class="base-popup__content"
          role="dialog"
          aria-modal="true"
          @click.stop
        >
          <button
            v-if="showCloseButton"
            type="button"
            class="base-popup__close"
            aria-label="Close popup"
            @click="close"
          >
            ×
          </button>
          <slot />
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    modelValue: boolean;
    closeOnOverlay?: boolean;
    showCloseButton?: boolean;
  }>(),
  {
    closeOnOverlay: true,
    showCloseButton: true,
  },
);

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
  (e: 'close'): void;
}>();

defineOptions({
  name: 'BasePopup',
});

const close = () => {
  emit('update:modelValue', false);
  emit('close');
};

const handleOverlayClick = () => {
  if (props.closeOnOverlay) {
    close();
  }
};
</script>

<style lang="scss">
.base-popup {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  background: rgba(0, 0, 0, 0.5);
}

.base-popup__content {
  position: relative;
  width: min(600px, 100%);
  max-height: 90vh;
  overflow: auto;
  padding: 24px;
  border-radius: 12px;
  background: #fff;
}

.base-popup__close {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 32px;
  height: 32px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: #333;
  font-size: 22px;
  line-height: 1;
  cursor: pointer;
}

.popup-fade-enter-active,
.popup-fade-leave-active {
  transition: opacity 0.2s ease;
}

.popup-fade-enter-from,
.popup-fade-leave-to {
  opacity: 0;
}
</style>

