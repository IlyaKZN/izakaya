import type { OrderAddressInput } from '@/types/api'

export type CheckoutAddress = OrderAddressInput & {
  label: string
  intercom?: string | null
  privateHouse?: boolean
  saveAddress?: boolean
}
