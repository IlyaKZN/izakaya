import type { OrderStatusEnum, ProductRead } from '@/types/api'

export type AdminTab = 'orders' | 'products' | 'site'
export type ProductMode = 'create' | 'edit'

export type AdminOption<T extends string = string> = {
  value: T
  label: string
}

export type GroupedProduct = {
  id: string
  name: string
  sortOrder: number
  products: ProductRead[]
}

export type ProductFormState = {
  name: string
  category_id: string
  description: string
  price: string
  is_active: boolean
}

export type ProductVariantDraft = {
  id: string
  name: string
  quantity_value: string
  price: string
}

export type ProductIngredientDraft = {
  id: string
  ingredient_name: string
}

export type OrderFilterOption = AdminOption
export type OrderStatusOption = AdminOption<OrderStatusEnum>
export type ProductModeOption = AdminOption<ProductMode>
export type CategoryOption = AdminOption
