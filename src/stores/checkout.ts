import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { useCartStore } from '@/stores/cart'
import { useOrdersStore } from '@/stores/orders'
import type { CheckoutAddress } from '@/components/AddressPopup'
import type { UserRead } from '@/types/api'
import { getProductPrice } from '@/utils/products'

export type TOrderMode = 'delivery' | 'pickup'

const PROMO_DISCOUNTS: Record<string, number> = {
  PHO10: 10,
  VIET5: 5,
}

export const useCheckoutStore = defineStore('checkout', () => {
  const cartStore = useCartStore()
  const ordersStore = useOrdersStore()

  const selectedAddress = ref<CheckoutAddress | null>(null)
  const orderMode = ref<TOrderMode>('delivery')
  const recipientPhone = ref('')
  const persons = ref(1)
  const paymentMethod = ref<'cash' | 'card' | 'online'>('cash')
  const orderComment = ref('')
  const promoCode = ref('')
  const appliedPromoPercent = ref(0)
  const useBonuses = ref(false)
  const isSubmittingOrder = ref(false)
  const checkoutError = ref('')
  const checkoutSuccessMessage = ref('')

  const minDeliveryOrder = 800

  const subtotal = computed(() =>
    cartStore.cartItemList.reduce(
      (sum, item) => sum + getProductPrice(item.menuItem, item.selectedVariant) * item.count,
      0,
    ),
  )

  const deliveryFee = computed(() => {
    if (orderMode.value === 'pickup') return 0
    if (subtotal.value >= 1500 || subtotal.value === 0) return 0

    return 199
  })

  const promoDiscount = computed(() =>
    Math.floor((subtotal.value * appliedPromoPercent.value) / 100),
  )
  const maxBonuses = computed(() => Math.min(300, Math.floor(subtotal.value * 0.15)))

  const bonusesUsed = computed(() => {
    if (!useBonuses.value) return 0

    const afterPromo = subtotal.value - promoDiscount.value
    return Math.min(maxBonuses.value, Math.max(afterPromo, 0))
  })

  const totalPrice = computed(() =>
    Math.max(subtotal.value + deliveryFee.value - promoDiscount.value - bonusesUsed.value, 0),
  )

  const deliveryAddressLabel = computed(
    () => selectedAddress.value?.label || 'Адрес доставки',
  )

  const isCheckoutDisabled = computed(
    () =>
      isSubmittingOrder.value ||
      cartStore.cartItemList.length === 0 ||
      !normalizePhone(recipientPhone.value) ||
      persons.value < 1 ||
      (orderMode.value === 'delivery' &&
        (!selectedAddress.value || subtotal.value < minDeliveryOrder)),
  )

  function normalizePhone(phone: string) {
    const digits = phone.replace(/\D/g, '')

    if (!digits) return ''
    if (digits.startsWith('8')) return `7${digits.slice(1)}`
    if (digits.startsWith('7')) return digits
    return `7${digits}`
  }

  function applyPromoCode() {
    const normalized = promoCode.value.toUpperCase()
    appliedPromoPercent.value = PROMO_DISCOUNTS[normalized] ?? 0
  }

  function buildOrderComment() {
    const commentParts = [orderComment.value.trim()]

    if (orderMode.value === 'pickup') {
      commentParts.unshift('Самовывоз')
    }

    if (selectedAddress.value?.intercom) {
      commentParts.push(`Домофон: ${selectedAddress.value.intercom}`)
    }

    if (selectedAddress.value?.privateHouse) {
      commentParts.push('Частный дом')
    }

    return commentParts.filter(Boolean).join('. ') || null
  }

  function prefillFromProfile(profile: UserRead | null) {
    if (!profile) return

    if (!recipientPhone.value) {
      recipientPhone.value = profile.phone
    }

    if (!selectedAddress.value && profile.last_address) {
      selectedAddress.value = {
        ...profile.last_address,
        label: [profile.last_address.street, profile.last_address.house].filter(Boolean).join(', '),
        intercom: null,
        privateHouse: false,
        saveAddress: true,
      }
    }
  }

  function clearFeedback() {
    checkoutError.value = ''
    checkoutSuccessMessage.value = ''
  }

  function resetForm({ keepAddress = true } = {}) {
    orderMode.value = 'delivery'
    persons.value = 1
    paymentMethod.value = 'cash'
    orderComment.value = ''
    promoCode.value = ''
    appliedPromoPercent.value = 0
    useBonuses.value = false
    checkoutError.value = ''

    if (!keepAddress) {
      selectedAddress.value = null
    }
  }

  async function submitOrder() {
    if (isCheckoutDisabled.value) return null

    const normalizedPhone = normalizePhone(recipientPhone.value)

    if (!normalizedPhone) {
      checkoutError.value = 'Введите корректный телефон получателя.'
      return null
    }

    isSubmittingOrder.value = true
    checkoutError.value = ''
    checkoutSuccessMessage.value = ''

    try {
      const order = await ordersStore.createOrder({
        address: orderMode.value === 'delivery' ? selectedAddress.value : null,
        recipient_phone: `+${normalizedPhone}`,
        persons: persons.value,
        payment_method: paymentMethod.value,
        promocode: promoCode.value || null,
        comment: buildOrderComment(),
        items: cartStore.toOrderItems(),
      })

      cartStore.clear()
      resetForm({ keepAddress: orderMode.value !== 'pickup' })
      checkoutSuccessMessage.value = `Заказ ${order.id} успешно создан`

      return order
    } catch (error) {
      checkoutError.value = error instanceof Error ? error.message : 'Не удалось оформить заказ'
      return null
    } finally {
      isSubmittingOrder.value = false
    }
  }

  return {
    selectedAddress,
    orderMode,
    recipientPhone,
    persons,
    paymentMethod,
    orderComment,
    promoCode,
    appliedPromoPercent,
    useBonuses,
    isSubmittingOrder,
    checkoutError,
    checkoutSuccessMessage,
    minDeliveryOrder,
    subtotal,
    deliveryFee,
    promoDiscount,
    maxBonuses,
    bonusesUsed,
    totalPrice,
    deliveryAddressLabel,
    isCheckoutDisabled,
    normalizePhone,
    applyPromoCode,
    prefillFromProfile,
    clearFeedback,
    resetForm,
    submitOrder,
  }
})
