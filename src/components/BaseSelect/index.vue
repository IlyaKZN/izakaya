<template>
  <div ref="rootRef" class="base-select" :class="{ 'base-select--open': isOpen, 'base-select--disabled': disabled }">
    <button
      type="button"
      class="base-select__trigger"
      :disabled="disabled"
      @click="toggleOpen"
    >
      <span class="base-select__value">{{ selectedLabel }}</span>
      <span class="material-symbols base-select__icon">expand_more</span>
    </button>

    <div v-if="isOpen" class="base-select__menu">
      <button
        v-for="option in options"
        :key="String(option.value)"
        type="button"
        class="base-select__option"
        :class="{ 'base-select__option--active': option.value === modelValue }"
        @click="selectOption(option.value)"
      >
        {{ option.label }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

type SelectValue = string | number

type SelectOption = {
  label: string
  value: SelectValue
}

const props = withDefaults(
  defineProps<{
    modelValue: SelectValue
    options: SelectOption[]
    disabled?: boolean
    placeholder?: string
  }>(),
  {
    disabled: false,
    placeholder: 'Выберите значение',
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: SelectValue]
  change: [value: SelectValue]
}>()

const isOpen = ref(false)
const rootRef = ref<HTMLElement | null>(null)

const selectedLabel = computed(() => {
  const selectedOption = props.options.find((option) => option.value === props.modelValue)
  return selectedOption?.label ?? props.placeholder
})

function close() {
  isOpen.value = false
}

function toggleOpen() {
  if (props.disabled) return
  isOpen.value = !isOpen.value
}

function selectOption(value: SelectValue) {
  emit('update:modelValue', value)
  emit('change', value)
  close()
}

function handleDocumentClick(event: MouseEvent) {
  if (!rootRef.value) return

  const target = event.target

  if (target instanceof Node && !rootRef.value.contains(target)) {
    close()
  }
}

function handleEscape(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    close()
  }
}

onMounted(() => {
  document.addEventListener('mousedown', handleDocumentClick)
  document.addEventListener('keydown', handleEscape)
})

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', handleDocumentClick)
  document.removeEventListener('keydown', handleEscape)
})
</script>

<style lang="scss">
.base-select {
  position: relative;
  width: 100%;
}

.base-select__trigger {
  width: 100%;
  min-height: 42px;
  border-radius: 12px;
  border: 1px solid var(--surface-border);
  background: rgba(255, 255, 255, 0.04);
  color: #fff;
  padding: 0 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  text-align: left;
}

.base-select__value {
  min-width: 0;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.base-select__icon {
  font-size: 20px;
  color: var(--text-secondary);
  transition: transform 0.16s ease;
}

.base-select--open .base-select__icon {
  transform: rotate(180deg);
}

.base-select__menu {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  z-index: 20;
  padding: 6px;
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: #171417;
  box-shadow: 0 18px 36px rgba(0, 0, 0, 0.38);
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.base-select__option {
  width: 100%;
  min-height: 38px;
  padding: 0 12px;
  border-radius: 10px;
  color: #fff;
  display: flex;
  align-items: center;
  background: transparent;
  text-align: left;
  transition: background-color 0.15s ease;
}

.base-select__option:hover {
  background: rgba(255, 255, 255, 0.06);
}

.base-select__option--active {
  background: rgba(127, 46, 67, 0.28);
}

.base-select--disabled .base-select__trigger {
  opacity: 0.55;
  cursor: not-allowed;
}
</style>
