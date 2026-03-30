import type { ProductRead, ProductVariantRead } from '@/types/api'

const FALLBACK_IMAGE =
  'https://www.gastronom.ru/recipe/26529/fo-bo-govjazhij-sup-s-lapshoj'

function parsePrice(price: string | null) {
  if (!price) return null

  const numericPrice = Number(price)
  return Number.isNaN(numericPrice) ? null : numericPrice
}

function getBasePrice(product: ProductRead) {
  const productPrice = parsePrice(product.price)

  if (productPrice !== null) return productPrice

  const variantPrices = product.variants
    .map((variant) => parsePrice(variant.price))
    .filter((price): price is number => price !== null)

  if (variantPrices.length === 0) return 0

  return Math.min(...variantPrices)
}

function formatVariant(variant: ProductVariantRead) {
  return `${variant.name} ${variant.quantity_value} г`
}

export function getProductImage(product: ProductRead) {
  return product.image_url || FALLBACK_IMAGE
}

export function getProductPrice(product: ProductRead) {
  return getBasePrice(product)
}

export function formatProductPrice(product: ProductRead) {
  return `${getProductPrice(product)} ₽`
}

export function getProductIngredients(product: ProductRead) {
  return product.removable_ingredients.map((ingredient) => ingredient.ingredient_name)
}

export function getProductWeight(product: ProductRead) {
  const firstVariant = product.variants[0]

  if (!firstVariant) return null

  return `${firstVariant.quantity_value} г`
}

export function getProductVariantsLabel(product: ProductRead) {
  if (product.variants.length === 0) return null
  if (product.variants.length === 1) return formatVariant(product.variants[0]!)

  return `${product.variants.length} варианта`
}
