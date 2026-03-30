export type Uuid = string

export type ApiEmptyResponse = Record<string, never>
export type SiteStatusResponse = Record<string, unknown>
export type HealthResponse = Record<string, unknown>

export type ValidationError = {
  loc: Array<string | number>
  msg: string
  type: string
  input?: unknown
  ctx?: Record<string, unknown>
}

export type HttpValidationError = {
  detail?: ValidationError[]
}

export type AuthRequestSMS = {
  phone: string
}

export type VerifySMSRequest = {
  phone: string
  code: string
}

export type Token = {
  access_token: string
  refresh_token: string
  token_type?: string
}

export type TokenRefreshRequest = {
  refresh_token: string
}

export type TokenRefreshResponse = {
  access_token: string
  token_type?: string
}

export type AddressRead = {
  city: string
  street: string
  house: string
  apartment?: string | null
  entrance?: string | null
  floor?: string | null
  comment?: string | null
  lat?: number | null
  lng?: number | null
  id: Uuid
  user_id: Uuid
  created_at: string
}

export type CategoryRead = {
  name: string
  is_active?: boolean
  sort_order?: number | null
  id: Uuid
}

export type ProductVariantCreate = {
  name: string
  quantity_value: number
  price: number | string
}

export type ProductVariantRead = {
  id: Uuid
  name: string
  quantity_value: number
  price: string
  created_at: string
}

export type ProductRemovableIngredientCreate = {
  ingredient_name: string
}

export type ProductRemovableIngredientRead = {
  id: Uuid
  ingredient_name: string
}

export type ProductCreate = {
  name: string
  description?: string | null
  price?: number | string | null
  category_id: Uuid
  image_url?: string | null
  is_active?: boolean
  variants?: ProductVariantCreate[]
  removable_ingredients?: ProductRemovableIngredientCreate[]
}

export type ProductUpdate = {
  name?: string | null
  description?: string | null
  price?: number | string | null
  category_id?: Uuid | null
  image_url?: string | null
  is_active?: boolean | null
}

export type ProductRead = {
  id: Uuid
  name: string
  description?: string | null
  price?: string | null
  category_id: Uuid
  image_url?: string | null
  is_active: boolean
  created_at: string
  variants: ProductVariantRead[]
  removable_ingredients: ProductRemovableIngredientRead[]
  category?: CategoryRead | null
}

export type OrderAddressInput = {
  city: string
  street: string
  house: string
  apartment?: string | null
  entrance?: string | null
  floor?: string | null
  comment?: string | null
  lat?: number | null
  lng?: number | null
}

export type OrderItemCreateInput = {
  product_id: Uuid
  variant_id?: Uuid | null
  quantity?: number
  removed_ingredient_ids?: Uuid[]
}

export type OrderCreateInput = {
  address?: OrderAddressInput | null
  recipient_phone: string
  persons?: number
  payment_method?: string
  comment?: string | null
  items: OrderItemCreateInput[]
  promocode?: string | null
}

export type OrderItemRemovedIngredientRead = {
  id: Uuid
  ingredient_name: string
}

export type OrderItemRead = {
  id: Uuid
  product_id: Uuid
  variant_id: Uuid | null
  price: string
  created_at: string
  removed_ingredients: OrderItemRemovedIngredientRead[]
}

export type OrderStatusEnum = 'new' | 'cooking' | 'delivering' | 'completed' | 'cancelled'

export type OrderRead = {
  id: Uuid
  user_id: Uuid
  address_id?: Uuid | null
  recipient_phone: string
  persons: number
  price: string
  total_price: string
  delivery_price: string
  payment_method: string
  payment_status: string
  comment?: string | null
  status: OrderStatusEnum
  created_at: string
  updated_at?: string | null
  items: OrderItemRead[]
}

export type OrderStatusUpdate = {
  status: OrderStatusEnum
}

export type UserRead = {
  phone: string
  name: string
  telegram_id?: number | null
  id: Uuid
  is_active: boolean
  created_at: string
  last_address?: AddressRead | null
}
