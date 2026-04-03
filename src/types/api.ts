export type Uuid = string
export type AuthRole = 'user' | 'admin'

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
  role?: AuthRole | string
}

export type TokenRefreshRequest = {
  refresh_token: string
}

export type TokenRefreshResponse = {
  access_token: string
  refresh_token: string
  token_type?: string
}

export type AddressCreate = {
  street: string
  house: string
  is_private_house?: boolean
  apartment?: string | null
  entrance?: string | null
  floor?: string | null
  coords?: number[] | null
}

export type AddressRead = {
  city: string
  street: string
  house: string
  is_private_house?: boolean
  apartment?: string | null
  entrance?: string | null
  floor?: string | null
  comment?: string | null
  coords?: number[] | null
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

export type DiscountTypeEnum = 'percent' | 'fixed' | 'product'
export type PaymentMethodEnum = 'cash' | 'card' | 'online'
export type OrderStatusEnum = 'new' | 'cooking' | 'delivering' | 'completed' | 'cancelled'
export type ProductCommentEnum = 'new' | 'bestseller' | 'spicy' | 'free'

export type ProductVariantCreate = {
  name: string
  price: number | string
  weight?: string | null
  is_active?: boolean
}

export type ProductVariantRead = {
  id: Uuid
  name: string
  price: string
  weight?: string | null
  is_active: boolean
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
  weight?: string | null
  comment?: ProductCommentEnum | null
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
  weight?: string | null
  comment?: ProductCommentEnum | null
  category_id?: Uuid | null
  is_active?: boolean | null
  variants?: ProductVariantCreate[] | null
  removable_ingredients?: ProductRemovableIngredientCreate[] | null
}

export type ProductRead = {
  id: Uuid
  name: string
  description?: string | null
  price?: string | null
  weight?: string | null
  comment?: ProductCommentEnum | null
  category_id: Uuid
  image_url?: string | null
  is_active: boolean
  created_at: string
  variants: ProductVariantRead[]
  removable_ingredients: ProductRemovableIngredientRead[]
  category?: CategoryRead | null
}

export type OrderAddressInput = {
  street: string
  house: string
  is_private_house?: boolean
  apartment?: string | null
  entrance?: string | null
  floor?: string | null
  coords?: number[] | null
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
  payment_method?: PaymentMethodEnum
  comment?: string | null
  items: OrderItemCreateInput[]
  promocode?: string | null
  promotion_product_id?: Uuid | null
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

export type OrderRead = {
  id: Uuid
  user_id: Uuid
  address_id?: Uuid | null
  recipient_phone: string
  persons: number
  price: string
  total_price: string
  delivery_price: string
  payment_method: PaymentMethodEnum
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

export type PromocodeCreate = {
  code: string
  discount_type: DiscountTypeEnum
  discount_value?: number | string | null
  product_id?: Uuid | null
  active?: boolean
  expires_at?: string | null
}

export type PromocodeRead = {
  code: string
  discount_type: DiscountTypeEnum
  discount_value?: string | null
  product_id?: Uuid | null
  active?: boolean
  expires_at?: string | null
  id: Uuid
}

export type PromotionCreate = {
  name: string
  min_order_price: number | string
  is_active?: boolean
  product_ids?: Uuid[]
}

export type PromotionProductRead = {
  id: Uuid
  product_id: Uuid
}

export type PromotionRead = {
  id: Uuid
  name: string
  min_order_price: string
  is_active: boolean
  products: PromotionProductRead[]
}

export type PromotionResponse = {
  product_ids: Uuid[]
}

export type PromotionUpdate = {
  name?: string | null
  min_order_price?: number | string | null
  is_active?: boolean | null
  product_ids?: Uuid[] | null
}

export type CarouselImageRead = {
  id: Uuid
  image_url: string
  sort_order: number
  is_active: boolean
}

export type SuggestItem = {
  name?: string | null
  street: string
  house: string
  coords: number[]
}

export type SuggestResponse = {
  success: boolean
  results?: SuggestItem[] | null
  message?: string | null
}

export type SearchResponse = {
  success: boolean
  coords?: number[] | null
  street?: string | null
  house?: string | null
  message?: string | null
}

export type ReverseResponse = {
  success: boolean
  coords?: number[] | null
  city?: string | null
  street?: string | null
  house?: string | null
  message?: string | null
}

export type CheckZoneResponse = {
  success: boolean
  in_zone: boolean
}

export type UserRead = {
  phone: string
  name: string
  telegram_id?: number | null
  id: Uuid
  is_active: boolean
  created_at: string
  last_address?: AddressRead | null
  role?: AuthRole | string
}

export type UserUpdate = {
  name?: string | null
  phone?: string | null
  address?: AddressCreate | null
}
