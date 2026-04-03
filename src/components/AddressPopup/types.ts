import type { OrderAddressInput } from '@/types/api'

export type CheckoutAddress = OrderAddressInput & {
  city?: string
  label: string
  comment?: string | null
  intercom?: string | null
  privateHouse?: boolean
  saveAddress?: boolean
}
