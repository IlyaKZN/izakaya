import type { ProductRead, ProductVariantRead } from '@/types/api'

const PRODUCT_IMAGE_BASE_PATH = '/static/img/products'
const PRODUCT_IMAGE_THUMBNAIL_BASE_PATH = '/static/img/products thumbnail'

type ProductImageOptions = {
  thumbnail?: boolean
}

function parsePrice(price: string | null | undefined) {
  if (!price) return null

  const numericPrice = Number(price)
  return Number.isNaN(numericPrice) ? null : numericPrice
}

export function getDefaultProductVariant(product: ProductRead) {
  return product.variants[0] ?? null
}

export function getProductCategoryLabel(product: ProductRead) {
  return product.category?.name ?? product.category_id
}

export function getProductVariantById(product: ProductRead, variantId?: string | null) {
  if (!variantId) return null

  return product.variants.find((variant) => variant.id === variantId) ?? null
}

function resolveProductImagePath(imageUrl?: string | null, options: ProductImageOptions = {}) {
  if (!imageUrl) return ''

  if (/^(https?:)?\/\//i.test(imageUrl)) {
    return imageUrl
  }

  if (imageUrl.startsWith('/')) {
    return imageUrl
  }

  const prefix = options.thumbnail
    ? PRODUCT_IMAGE_THUMBNAIL_BASE_PATH
    : PRODUCT_IMAGE_BASE_PATH

  return `${prefix}/${imageUrl}`
}

export function getProductImage(product: ProductRead, options?: ProductImageOptions) {
  return resolveProductImagePath(product.image_url, options)
}

export function getProductPrice(product: ProductRead, variant?: ProductVariantRead | null) {
  const variantPrice = variant ? parsePrice(variant.price) : null

  if (variantPrice !== null) return variantPrice

  const productPrice = parsePrice(product.price)

  if (productPrice !== null) return productPrice

  const variantPrices = product.variants
    .map((item) => parsePrice(item.price))
    .filter((price): price is number => price !== null)

  if (variantPrices.length === 0) return 0

  return Math.min(...variantPrices)
}

export function formatProductPrice(product: ProductRead, variant?: ProductVariantRead | null) {
  return `${getProductPrice(product, variant)} ₽`
}

export function getProductIngredients(product: ProductRead) {
  return product.removable_ingredients.map((ingredient) => ingredient.ingredient_name)
}

export function getProductVariantsLabel(product: ProductRead) {
  if (product.variants.length <= 1) return null

  return `${product.variants.length} варианта`
}

export function formatVariant(variant: ProductVariantRead) {
  return variant.name
}
