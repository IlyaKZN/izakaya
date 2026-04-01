import type { OrderAddressInput } from '@/types/api'

export type CheckoutAddress = OrderAddressInput & {
  city?: string
  label: string
  intercom?: string | null
  privateHouse?: boolean
  saveAddress?: boolean
}
