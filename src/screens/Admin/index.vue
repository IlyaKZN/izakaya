<template>
  <div class="admin-screen">
    <div v-if="!isAdmin" class="admin-screen__state">
      <span class="material-symbols">shield_lock</span>
      <span>Доступ к админке есть только у администратора.</span>
    </div>

    <div v-else-if="isInitialLoading" class="admin-screen__state">
      <span class="material-symbols">progress_activity</span>
      <span>Загружаем данные админки</span>
    </div>

    <div v-else class="admin-screen__content">
      <AdminToolbar
        v-model:active-tab="activeTab"
        :orders-count="sortedOrders.length"
      />

      <AdminOrdersTab
        v-if="activeTab === 'orders'"
        :sorted-orders="sortedOrders"
        :orders-error="ordersError"
        :orders-filter="ordersFilter"
        :order-filter-options="orderFilterOptions"
        :order-status-options="orderStatusOptions"
        :updating-order-id="updatingOrderId"
        @filter-change="applyOrdersFilter"
        @order-status-change="applyOrderStatus"
        @open-order="openOrder"
      />

      <AdminProductsTab
        v-else-if="activeTab === 'products'"
        v-model:variants="variants"
        v-model:ingredients-text="ingredientsText"
        :grouped-products="groupedProducts"
        :category-options="categoryOptions"
        :product-mode="productMode"
        :selected-product-id="selectedProductId"
        :product-error="productError"
        :product-success="productSuccess"
        :product-form="productForm"
        :product-image-hint="productImageHint"
        :product-image-preview="productImagePreview"
        :product-image-input-key="productImageInputKey"
        :is-submitting-product="isSubmittingProduct"
        @select-product="selectProduct"
        @start-create-product="startCreateProduct"
        @show-product-list="showProductList"
        @image-change="handleProductImageChange"
        @reset="resetProductForm"
        @submit="submitProduct"
      />

      <AdminSiteTab
        v-else
        :site-status-label="siteStatusLabel"
        :site-status-badge-class="siteStatusBadgeClass"
        :health-label="healthLabel"
        :health-badge-class="healthBadgeClass"
        :site-action-message="siteActionMessage"
        :is-toggling-site="isTogglingSite"
        @toggle="handleToggleSite"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useAdminStore } from '@/stores/admin'
import { useAuthStore } from '@/stores/auth'
import { useCategoriesStore } from '@/stores/categories'
import { useProductsStore } from '@/stores/products'
import { useSiteStore } from '@/stores/site'
import { getProductImage } from '@/utils/products'
import type { OrderRead, OrderStatusEnum, ProductRead, ProductVariantCreate } from '@/types/api'
import AdminOrdersTab from './components/AdminOrdersTab.vue'
import AdminProductsTab from './components/AdminProductsTab.vue'
import AdminSiteTab from './components/AdminSiteTab.vue'
import AdminToolbar from './components/AdminToolbar.vue'
import type {
  AdminTab,
  CategoryOption,
  GroupedProduct,
  OrderFilterOption,
  OrderStatusOption,
  ProductFormState,
  ProductMode,
  ProductVariantDraft,
} from './types'

defineOptions({
  name: 'AdminScreen',
})

const authStore = useAuthStore()
const router = useRouter()
const adminStore = useAdminStore()
const categoriesStore = useCategoriesStore()
const productsStore = useProductsStore()
const siteStore = useSiteStore()

const { role } = storeToRefs(authStore)
const { adminOrders } = storeToRefs(adminStore)
const { categories } = storeToRefs(categoriesStore)
const { products } = storeToRefs(productsStore)
const { siteStatus, health } = storeToRefs(siteStore)

const activeTab = ref<AdminTab>('orders')
const isAdmin = computed(() => role.value === 'admin')
const isLoading = ref(false)
const hasLoadedOnce = ref(false)
const isTogglingSite = ref(false)
const isSubmittingProduct = ref(false)
const updatingOrderId = ref<string | null>(null)
const ordersFilter = ref('')
const ordersError = ref('')
const productError = ref('')
const productSuccess = ref('')
const siteActionMessage = ref('')
const productMode = ref<ProductMode>('edit')
const selectedProductId = ref('')
const productImageInputKey = ref(0)
let adminPollingId: ReturnType<typeof setInterval> | null = null

const productForm = reactive<ProductFormState>({
  name: '',
  category_id: '',
  description: '',
  price: '',
  is_active: true,
})

const variants = ref<ProductVariantDraft[]>([])
const ingredientsText = ref('')
const productImageFile = ref<File | null>(null)
const productImagePreview = ref('')
let productVariantDraftId = 0

const orderFilterOptions = [
  { value: '', label: 'Все' },
  { value: 'new', label: 'Новые' },
  { value: 'cooking', label: 'Готовятся' },
  { value: 'delivering', label: 'В пути' },
  { value: 'completed', label: 'Завершённые' },
  { value: 'cancelled', label: 'Отменённые' },
] as const satisfies readonly OrderFilterOption[]

const orderStatusOptions = [
  { value: 'new', label: 'Новый' },
  { value: 'cooking', label: 'Готовится' },
  { value: 'delivering', label: 'В пути' },
  { value: 'completed', label: 'Завершён' },
  { value: 'cancelled', label: 'Отменён' },
] as const satisfies readonly OrderStatusOption[]

const categoryOptions = computed<CategoryOption[]>(() =>
  categories.value.map((category) => ({
    value: category.id,
    label: category.name,
  })),
)

const sortedOrders = computed(() =>
  [...adminOrders.value].sort(
    (left, right) => new Date(right.created_at).getTime() - new Date(left.created_at).getTime(),
  ),
)

const groupedProducts = computed<GroupedProduct[]>(() => {
  const categoryOrder = new Map(categories.value.map((category, index) => [category.id, index]))
  const groups = new Map<string, GroupedProduct>()

  products.value.forEach((product) => {
    const category = categories.value.find((item) => item.id === product.category_id)
    const groupId = product.category_id
    const existingGroup = groups.get(groupId)

    if (existingGroup) {
      existingGroup.products.push(product)
      return
    }

    groups.set(groupId, {
      id: groupId,
      name: category?.name ?? 'Без категории',
      sortOrder: categoryOrder.get(groupId) ?? Number.MAX_SAFE_INTEGER,
      products: [product],
    })
  })

  return [...groups.values()]
    .sort((left, right) => {
      if (left.sortOrder !== right.sortOrder) {
        return left.sortOrder - right.sortOrder
      }

      return left.name.localeCompare(right.name, 'ru')
    })
    .map((group) => ({
      ...group,
      products: [...group.products].sort((left, right) => left.name.localeCompare(right.name, 'ru')),
    }))
})

const productImageHint = computed(() => {
  if (productImageFile.value) {
    return `Будет загружен файл: ${productImageFile.value.name}`
  }

  if (productMode.value === 'edit' && productImagePreview.value) {
    return 'Оставьте поле пустым, чтобы не менять текущую картинку.'
  }

  return ''
})

const isInitialLoading = computed(() => isLoading.value && !hasLoadedOnce.value)

const siteStatusLabel = computed(() => {
  const status = siteStatus.value as { is_active?: boolean } | null

  if (status?.is_active === true) return 'Активен'
  if (status?.is_active === false) return 'Пауза'

  return 'Неизвестно'
})

const siteStatusBadgeClass = computed(() =>
  siteStatus.value && (siteStatus.value as { is_active?: boolean }).is_active === false
    ? 'admin-site__status-badge--warn'
    : 'admin-site__status-badge--ok',
)

const healthLabel = computed(() => {
  const status = health.value as { status?: string } | null
  return status?.status === 'ok' ? 'OK' : 'Неизвестно'
})

const healthBadgeClass = computed(() =>
  (health.value as { status?: string } | null)?.status === 'ok'
    ? 'admin-site__status-badge--ok'
    : 'admin-site__status-badge--neutral',
)

function bumpProductImageInputKey() {
  productImageInputKey.value += 1
}

function createEmptyVariantDraft(): ProductVariantDraft {
  productVariantDraftId += 1

  return {
    id: `variant-${productVariantDraftId}`,
    name: '',
    quantity_value: '',
    price: '',
  }
}

function resetProductForm() {
  productForm.name = ''
  productForm.category_id = ''
  productForm.description = ''
  productForm.price = ''
  productForm.is_active = true
  variants.value = [createEmptyVariantDraft()]
  ingredientsText.value = ''
  productImageFile.value = null
  productImagePreview.value = ''
  bumpProductImageInputKey()
  productError.value = ''
  productSuccess.value = ''
}

function handleProductModeChange() {
  productError.value = ''
  productSuccess.value = ''

  if (productMode.value === 'create') {
    selectedProductId.value = ''
    resetProductForm()
    return
  }

  if (!selectedProductId.value) {
    resetProductForm()
    return
  }

  fillProductFormFromSelection()
}

function fillProductForm(product: ProductRead) {
  productForm.name = product.name
  productForm.category_id = product.category_id
  productForm.description = product.description ?? ''
  productForm.price = product.price ?? ''
  productForm.is_active = product.is_active
  productImageFile.value = null
  productImagePreview.value = getProductImage(product)
  bumpProductImageInputKey()
  variants.value = product.variants.length
    ? product.variants.map((variant) => ({
        id: `variant-${variant.id}`,
        name: variant.name,
        quantity_value: String(variant.quantity_value),
        price: String(variant.price),
      }))
    : [createEmptyVariantDraft()]
  ingredientsText.value = product.removable_ingredients
    .map((ingredient) => ingredient.ingredient_name)
    .join('\n')
}

function fillProductFormFromSelection() {
  productError.value = ''
  productSuccess.value = ''

  const product = products.value.find((item) => item.id === selectedProductId.value)

  if (!product) {
    resetProductForm()
    return
  }

  fillProductForm(product)
}

function selectProduct(productId: string) {
  productMode.value = 'edit'
  selectedProductId.value = productId
  fillProductFormFromSelection()
}

function startCreateProduct() {
  productMode.value = 'create'
  selectedProductId.value = ''
  resetProductForm()
}

function showProductList() {
  productMode.value = 'edit'
  selectedProductId.value = ''
  resetProductForm()
}

function parseVariants(): ProductVariantCreate[] | undefined {
  const filledVariants = variants.value.filter((variant) =>
    [variant.name, variant.quantity_value, variant.price].some((value) => value.trim()),
  )

  if (!filledVariants.length) return undefined

  return filledVariants.map((variant) => {
    const name = variant.name.trim()
    const quantityValue = variant.quantity_value.trim()
    const price = variant.price.trim()

    if (!name || !quantityValue || !price) {
      throw new Error('Заполните вариант целиком: название, вес или объём и цену')
    }

    const parsedQuantity = Number(quantityValue)

    if (!Number.isFinite(parsedQuantity)) {
      throw new Error('Вес или объём варианта должен быть числом')
    }

    return {
      name,
      quantity_value: parsedQuantity,
      price,
    }
  })
}

function parseIngredients() {
  if (!ingredientsText.value.trim()) return undefined

  return ingredientsText.value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((ingredient_name) => ({ ingredient_name }))
}

function buildProductPayload() {
  return {
    name: productForm.name,
    category_id: productForm.category_id,
    description: productForm.description || null,
    price: productForm.price || null,
    is_active: productForm.is_active,
    variants: parseVariants(),
    removable_ingredients: parseIngredients(),
  }
}

function updateProductInList(product: ProductRead) {
  const productIndex = products.value.findIndex((item) => item.id === product.id)

  if (productIndex >= 0) {
    products.value[productIndex] = product
    return
  }

  products.value.unshift(product)
}

function handleProductImageChange(event: Event) {
  const input = event.target as HTMLInputElement | null
  const file = input?.files?.[0] ?? null

  productImageFile.value = file

  if (!file) {
    const selectedProduct = products.value.find((item) => item.id === selectedProductId.value)
    productImagePreview.value = selectedProduct ? getProductImage(selectedProduct) : ''
    return
  }

  productImagePreview.value = URL.createObjectURL(file)
}

async function loadOrders() {
  ordersError.value = ''

  try {
    await adminStore.fetchOrders(ordersFilter.value || null)
  } catch (error) {
    ordersError.value =
      error instanceof Error ? error.message : 'Не удалось загрузить заказы для админки.'
  }
}

async function applyOrdersFilter(nextFilter: string) {
  ordersFilter.value = nextFilter
  await loadOrders()
}

async function loadAdminData() {
  if (!isAdmin.value) return

  if (!hasLoadedOnce.value) {
    isLoading.value = true
  }
  ordersError.value = ''

  try {
    await Promise.all([
      loadOrders(),
      categoriesStore.fetchCategories(),
      productsStore.fetchProducts(),
      siteStore.fetchSiteStatus(),
      siteStore.fetchHealth(),
    ])
  } finally {
    hasLoadedOnce.value = true
    isLoading.value = false
  }
}

async function applyOrderStatus(order: OrderRead, nextStatus: string | number) {
  const resolvedStatus = String(nextStatus) as OrderStatusEnum

  if (resolvedStatus === order.status) return

  updatingOrderId.value = order.id
  ordersError.value = ''

  try {
    await adminStore.updateOrderStatus(order.id, { status: resolvedStatus })
  } catch (error) {
    ordersError.value =
      error instanceof Error ? error.message : 'Не удалось обновить статус заказа.'
  } finally {
    updatingOrderId.value = null
  }
}

async function handleToggleSite(enabled: boolean) {
  isTogglingSite.value = true
  siteActionMessage.value = ''

  try {
    await adminStore.toggleSite(enabled)
    await siteStore.fetchSiteStatus()
    siteActionMessage.value = enabled
      ? 'Сайт переведён в активный режим.'
      : 'Приём заказов приостановлен.'
  } catch (error) {
    siteActionMessage.value =
      error instanceof Error ? error.message : 'Не удалось изменить состояние сайта.'
  } finally {
    isTogglingSite.value = false
  }
}

async function submitProduct() {
  productError.value = ''
  productSuccess.value = ''
  isSubmittingProduct.value = true

  try {
    const payload = buildProductPayload()
    const isCreateMode = productMode.value === 'create'
    let savedProduct: ProductRead

    if (isCreateMode) {
      savedProduct = await adminStore.createProduct(payload)
      selectedProductId.value = savedProduct.id
      productMode.value = 'edit'
    } else {
      if (!selectedProductId.value) {
        throw new Error('Выберите товар для редактирования')
      }

      savedProduct = await adminStore.updateProduct(selectedProductId.value, payload)
    }

    if (productImageFile.value) {
      savedProduct = await adminStore.uploadProductImage(savedProduct.id, productImageFile.value)
    }

    updateProductInList(savedProduct)
    fillProductForm(savedProduct)
    productSuccess.value = isCreateMode
      ? `Товар «${savedProduct.name}» создан`
      : `Товар «${savedProduct.name}» обновлён`
  } catch (error) {
    productError.value = error instanceof Error ? error.message : 'Не удалось сохранить товар.'
  } finally {
    isSubmittingProduct.value = false
  }
}

function openOrder(orderId: string) {
  router.push({
    name: 'admin-order',
    params: { id: orderId },
  })
}

onMounted(() => {
  void loadAdminData()
  adminPollingId = setInterval(() => {
    void loadAdminData()
  }, 5000)
})

watch(activeTab, (nextTab) => {
  if (nextTab !== 'products') return

  showProductList()
})

onBeforeUnmount(() => {
  if (adminPollingId) {
    clearInterval(adminPollingId)
    adminPollingId = null
  }
})
</script>

<style lang="scss" src="./styles.scss"></style>
