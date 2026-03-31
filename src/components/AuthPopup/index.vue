<template>
  <BasePopup
    :model-value="modelValue"
    content-class="auth-popup__modal"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <div class="auth-popup">
      <div class="auth-popup__eyebrow">Авторизация</div>
      <h2 class="auth-popup__title">{{ isCodeStep ? 'Введите код из SMS' : 'Войдите по номеру телефона' }}</h2>
      <p class="auth-popup__text">
        {{ isCodeStep ? `Мы отправили код на ${formattedPhone || phone}.` : 'Подтвердим номер и сохраним ваши заказы и адреса.' }}
      </p>

      <label class="auth-popup__field">
        <span class="auth-popup__label">Телефон</span>
        <div class="auth-popup__phone-field">
          <span class="auth-popup__phone-prefix">+7</span>
          <input
            :value="phone"
            class="auth-popup__input auth-popup__input--phone"
            type="tel"
            inputmode="numeric"
            placeholder="9991234567"
            :disabled="isSubmitting"
            @input="handlePhoneInput"
          />
        </div>
      </label>

      <label v-if="isCodeStep" class="auth-popup__field">
        <span class="auth-popup__label">Код из SMS</span>
        <input
          v-model="code"
          class="auth-popup__input"
          type="text"
          inputmode="numeric"
          maxlength="6"
          placeholder="123456"
          :disabled="isSubmitting"
          @keydown.enter.prevent="submitCode"
        />
      </label>

      <p v-if="errorMessage" class="auth-popup__error">{{ errorMessage }}</p>
      <p v-if="successMessage" class="auth-popup__success">{{ successMessage }}</p>

      <button
        type="button"
        class="auth-popup__submit"
        :disabled="isSubmitDisabled"
        @click="handleSubmit"
      >
        {{ submitLabel }}
      </button>

      <button
        v-if="isCodeStep"
        type="button"
        class="auth-popup__secondary"
        :disabled="isSubmitting"
        @click="resetToPhoneStep"
      >
        Изменить номер
      </button>
    </div>
  </BasePopup>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import BasePopup from '@/components/BasePopup'
import { ApiError } from '@/api/http'
import { useAuthStore } from '@/stores/auth'
import { useUsersStore } from '@/stores/users'

defineOptions({
  name: 'AuthPopup',
})

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

const authStore = useAuthStore()
const usersStore = useUsersStore()
const { profile } = storeToRefs(usersStore)

const phone = ref('')
const code = ref('')
const isSubmitting = ref(false)
const isCodeStep = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const normalizedPhone = computed(() => {
  const digits = phone.value.replace(/\D/g, '')

  if (!digits) return ''
  return `7${digits.slice(0, 10)}`
})

const formattedPhone = computed(() => {
  const digits = normalizedPhone.value

  if (digits.length < 11) return phone.value

  return `+${digits[0]} (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7, 9)}-${digits.slice(9, 11)}`
})

const isPhoneValid = computed(() => normalizedPhone.value.length === 11)
const isCodeValid = computed(() => code.value.trim().length >= 4)
const isSubmitDisabled = computed(
  () =>
    isSubmitting.value || !isPhoneValid.value || (isCodeStep.value && !isCodeValid.value),
)

const submitLabel = computed(() => {
  if (isSubmitting.value) {
    return isCodeStep.value ? 'Проверяем...' : 'Отправляем...'
  }

  return isCodeStep.value ? 'Подтвердить вход' : 'Получить код'
})

const extractApiErrorMessage = (error: unknown) => {
  if (error instanceof ApiError) {
    const detail = (error.data as { detail?: Array<{ msg?: string }> } | null)?.detail

    if (Array.isArray(detail) && detail.length > 0) {
      return detail.map((item) => item.msg).filter(Boolean).join(', ')
    }

    return error.message || 'Ошибка авторизации'
  }

  if (error instanceof Error) {
    return error.message
  }

  return 'Не удалось выполнить авторизацию'
}

const resetMessages = () => {
  errorMessage.value = ''
  successMessage.value = ''
}

const resetToPhoneStep = () => {
  isCodeStep.value = false
  code.value = ''
  resetMessages()
}

const handlePhoneInput = (event: Event) => {
  const target = event.target

  if (!(target instanceof HTMLInputElement)) return

  let digits = target.value.replace(/\D/g, '')

  if ((digits.startsWith('7') || digits.startsWith('8')) && digits.length > 10) {
    digits = digits.slice(1)
  }

  phone.value = digits.slice(0, 10)
}

const requestCode = async () => {
  if (!isPhoneValid.value) {
    errorMessage.value = 'Введите корректный номер телефона.'
    return
  }

  isSubmitting.value = true
  resetMessages()

  try {
    await authStore.loginSms({
      phone: `+${normalizedPhone.value}`,
    })
    isCodeStep.value = true
    successMessage.value = 'Код отправлен. Введите его, чтобы продолжить.'
  } catch (error) {
    errorMessage.value = extractApiErrorMessage(error)
  } finally {
    isSubmitting.value = false
  }
}

const submitCode = async () => {
  if (!isPhoneValid.value || !isCodeValid.value) {
    errorMessage.value = 'Введите телефон и код из SMS.'
    return
  }

  isSubmitting.value = true
  resetMessages()

  try {
    await authStore.verifySms({
      phone: `+${normalizedPhone.value}`,
      code: code.value.trim(),
    })
    await usersStore.fetchProfile()
    successMessage.value = profile.value?.name
      ? `Вы вошли как ${profile.value.name}.`
      : 'Вход выполнен.'
    emit('update:modelValue', false)
  } catch (error) {
    errorMessage.value = extractApiErrorMessage(error)
  } finally {
    isSubmitting.value = false
  }
}

const handleSubmit = async () => {
  if (isCodeStep.value) {
    await submitCode()
    return
  }

  await requestCode()
}

watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen) {
      resetMessages()
      if (!authStore.isAuthenticated) {
        code.value = ''
      }
      return
    }

    if (!authStore.isAuthenticated) {
      phone.value = ''
      code.value = ''
      isCodeStep.value = false
      resetMessages()
    }
  },
)
</script>

<style lang="scss">
.auth-popup__modal {
  width: min(460px, calc(100vw - 24px));
  padding: 28px;
  border-radius: 24px;
  background: #111013;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.auth-popup {
  color: #f5f1f2;
}

.auth-popup__eyebrow {
  margin-bottom: 8px;
  color: #b9adb2;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.12em;
}

.auth-popup__title {
  margin: 0 0 10px;
  font-size: 28px;
  line-height: 1.1;
}

.auth-popup__text {
  margin: 0 0 18px;
  color: #b9adb2;
  line-height: 1.45;
}

.auth-popup__field {
  display: block;
  margin-bottom: 14px;
}

.auth-popup__label {
  display: block;
  margin-bottom: 6px;
  color: #b9adb2;
  font-size: 13px;
}

.auth-popup__input {
  width: 100%;
  height: 50px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: #17161b;
  color: #fff;
  padding: 0 14px;
  font: inherit;
}

.auth-popup__phone-field {
  display: flex;
  align-items: center;
  height: 50px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: #17161b;
  overflow: hidden;
}

.auth-popup__phone-prefix {
  flex-shrink: 0;
  height: 100%;
  display: inline-flex;
  align-items: center;
  padding: 0 14px;
  color: #fff;
  background: rgba(255, 255, 255, 0.04);
  border-right: 1px solid rgba(255, 255, 255, 0.08);
}

.auth-popup__input--phone {
  border: 0;
  background: transparent;
  border-radius: 0;
  outline: none;
  box-shadow: none;
}

.auth-popup__phone-field:focus-within {
  border-color: rgba(255, 255, 255, 0.18);
}

.auth-popup__phone-field:focus-within .auth-popup__phone-prefix {
  border-right-color: rgba(255, 255, 255, 0.06);
}

.auth-popup__error,
.auth-popup__success {
  margin: 0 0 14px;
  padding: 10px 12px;
  border-radius: 12px;
  font-size: 14px;
  line-height: 1.4;
}

.auth-popup__error {
  background: rgba(176, 63, 63, 0.18);
  border: 1px solid rgba(176, 63, 63, 0.35);
  color: #ffd0d0;
}

.auth-popup__success {
  background: rgba(63, 176, 108, 0.18);
  border: 1px solid rgba(63, 176, 108, 0.35);
  color: #d4ffde;
}

.auth-popup__submit,
.auth-popup__secondary {
  width: 100%;
  height: 50px;
  border-radius: 12px;
  color: #fff;
}

.auth-popup__submit {
  background: var(--accent-button-bg);
  font-weight: 600;
}

.auth-popup__secondary {
  margin-top: 10px;
  background: var(--accent-button-bg);
}

.auth-popup__submit:disabled,
.auth-popup__secondary:disabled {
  opacity: 0.55;
}
</style>
