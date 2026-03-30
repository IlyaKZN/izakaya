<template>
  <div class="admin-screen">
    <div v-if="!isAdmin" class="admin-screen__state">
      <span class="material-symbols">shield_lock</span>
      <span>Доступ к админке есть только у администратора.</span>
    </div>

    <div v-else-if="isLoading" class="admin-screen__state">
      <span class="material-symbols">progress_activity</span>
      <span>Загружаем данные админки</span>
    </div>

    <div v-else class="admin-screen__content">
      <div class="admin-toolbar-top">
        <div class="admin-tabs">
          <button
            type="button"
            class="admin-tabs__button"
            :class="{ 'admin-tabs__button--active': activeTab === 'orders' }"
            @click="activeTab = 'orders'"
          >
            <span>Заказы</span>
            <span class="admin-tabs__count">{{ sortedOrders.length }}</span>
          </button>

          <button
            type="button"
            class="admin-tabs__button"
            :class="{ 'admin-tabs__button--active': activeTab === 'products' }"
            @click="activeTab = 'products'"
          >
            <span>Товары</span>
          </button>
        </div>

        <button type="button" class="admin-button admin-button--ghost" @click="loadAdminData">
          Обновить данные
        </button>
      </div>

      <template v-if="activeTab === 'orders'">
        <section class="admin-card admin-card--stats">
          <div class="admin-stat">
            <span class="admin-stat__value">{{ sortedOrders.length }}</span>
            <span class="admin-stat__label">Всего в выдаче</span>
          </div>
          <div class="admin-stat">
            <span class="admin-stat__value">{{ countByStatus('new') }}</span>
            <span class="admin-stat__label">Новые</span>
          </div>
          <div class="admin-stat">
            <span class="admin-stat__value">{{ countByStatus('cooking') }}</span>
            <span class="admin-stat__label">Готовятся</span>
          </div>
          <div class="admin-stat">
            <span class="admin-stat__value">{{ countByStatus('delivering') }}</span>
            <span class="admin-stat__label">В пути</span>
          </div>
        </section>

        <div class="admin-orders-layout">
          <section class="admin-card admin-card--wide">
            <div class="admin-card__header admin-card__header--row">
              <div>
                <p class="admin-card__eyebrow">Заказы</p>
                <h2 class="admin-card__title">Лента заказов</h2>
              </div>

              <div class="admin-order-filters">
                <button
                  v-for="option in orderFilterOptions"
                  :key="option.value"
                  type="button"
                  class="admin-filter-chip"
                  :class="{ 'admin-filter-chip--active': ordersFilter === option.value }"
                  @click="applyOrdersFilter(String(option.value))"
                >
                  {{ option.label }}
                </button>
              </div>
            </div>

            <div v-if="ordersError" class="admin-notice admin-notice--error">{{ ordersError }}</div>

            <div v-if="!sortedOrders.length" class="admin-empty">
              Заказов по выбранному фильтру пока нет.
            </div>

            <div v-else class="admin-orders">
              <article v-for="order in sortedOrders" :key="order.id" class="admin-order">
                <div class="admin-order__top">
                  <div>
                    <button
                      type="button"
                      class="admin-order__link"
                      @click="openOrder(order.id)"
                    >
                      Заказ {{ shortOrderId(order.id) }}
                    </button>
                    <p>{{ formatDate(order.created_at) }}</p>
                  </div>

                  <span class="admin-status" :class="`admin-status--${order.status}`">
                    {{ statusLabel(order.status) }}
                  </span>
                </div>

                <dl class="admin-order__meta">
                  <div>
                    <dt>Телефон</dt>
                    <dd>{{ order.recipient_phone }}</dd>
                  </div>
                  <div>
                    <dt>Сумма</dt>
                    <dd>{{ formatPrice(order.total_price) }}</dd>
                  </div>
                  <div>
                    <dt>Оплата</dt>
                    <dd>{{ paymentLabel(order.payment_method) }}</dd>
                  </div>
                  <div>
                    <dt>Позиций</dt>
                    <dd>{{ order.items.length }}</dd>
                  </div>
                </dl>

                <div class="admin-order__status-actions">
                  <button
                    v-for="statusOption in orderStatusOptions"
                    :key="statusOption.value"
                    type="button"
                    class="admin-status-chip"
                    :class="{
                      'admin-status-chip--active': order.status === statusOption.value,
                      'admin-status-chip--pending': updatingOrderId === order.id,
                    }"
                    :disabled="updatingOrderId === order.id"
                    @click="applyOrderStatus(order, statusOption.value)"
                  >
                    {{ statusOption.label }}
                  </button>
                </div>

                <p v-if="order.comment" class="admin-order__comment">{{ order.comment }}</p>
              </article>
            </div>
          </section>

          <aside class="admin-side-column">
            <section class="admin-card">
              <div class="admin-card__header">
                <div>
                  <p class="admin-card__eyebrow">Сайт</p>
                  <h2 class="admin-card__title">Быстрые действия</h2>
                </div>
              </div>

              <div class="admin-site__status-row">
                <span class="admin-site__status-label">Состояние сайта</span>
                <span class="admin-site__status-badge" :class="siteStatusBadgeClass">
                  {{ siteStatusLabel }}
                </span>
              </div>

              <div class="admin-site__status-row">
                <span class="admin-site__status-label">Health</span>
                <span class="admin-site__status-badge" :class="healthBadgeClass">
                  {{ healthLabel }}
                </span>
              </div>

              <div class="admin-site__actions">
                <button
                  type="button"
                  class="admin-button"
                  :disabled="isTogglingSite"
                  @click="handleToggleSite(true)"
                >
                  {{ isTogglingSite ? 'Сохраняем...' : 'Открыть сайт' }}
                </button>

                <button
                  type="button"
                  class="admin-button admin-button--ghost"
                  :disabled="isTogglingSite"
                  @click="handleToggleSite(false)"
                >
                  Приостановить приём заказов
                </button>
              </div>

              <p v-if="siteActionMessage" class="admin-site__message">{{ siteActionMessage }}</p>
            </section>
          </aside>
        </div>
      </template>

      <section v-else class="admin-card">
        <div class="admin-card__header admin-card__header--row">
          <div>
            <p class="admin-card__eyebrow">Товары</p>
            <h2 class="admin-card__title">Создание и редактирование</h2>
          </div>

          <label class="admin-field">
            <span>Режим</span>
            <BaseSelect
              v-model="productMode"
              :options="productModeOptions"
              @change="handleProductModeChange"
            />
          </label>
        </div>

        <div v-if="productMode === 'edit'" class="admin-toolbar">
          <div class="admin-field admin-field--grow">
            <span>Товар</span>

            <div v-if="groupedProducts.length" class="admin-product-groups">
              <section
                v-for="group in groupedProducts"
                :key="group.id"
                class="admin-product-group"
              >
                <div class="admin-product-group__header">
                  <h3 class="admin-product-group__title">{{ group.name }}</h3>
                  <span class="admin-product-group__count">{{ group.products.length }}</span>
                </div>

                <div class="admin-product-picker">
                  <button
                    v-for="product in group.products"
                    :key="product.id"
                    type="button"
                    class="admin-product-card"
                    :class="{ 'admin-product-card--active': selectedProductId === product.id }"
                    @click="selectProduct(product.id)"
                  >
                    <img
                      class="admin-product-card__image"
                      :src="getProductImage(product, { thumbnail: true })"
                      :alt="product.name"
                      loading="lazy"
                    />

                    <div class="admin-product-card__body">
                      <div class="admin-product-card__top">
                        <strong>{{ product.name }}</strong>
                        <span
                          class="admin-product-card__status"
                          :class="{
                            'admin-product-card__status--active': product.is_active,
                            'admin-product-card__status--inactive': !product.is_active,
                          }"
                        >
                          {{ product.is_active ? 'Активен' : 'Скрыт' }}
                        </span>
                      </div>

                      <p class="admin-product-card__meta">
                        {{ formatPrice(product.price ?? '0') }}
                      </p>
                    </div>
                  </button>
                </div>
              </section>
            </div>

            <div v-else class="admin-empty">Список товаров пока пуст.</div>
          </div>
        </div>

        <div v-if="productError" class="admin-notice admin-notice--error">{{ productError }}</div>
        <div v-if="productSuccess" class="admin-notice admin-notice--success">{{ productSuccess }}</div>

        <form class="admin-product-form" @submit.prevent="submitProduct">
          <div class="admin-product-form__grid">
            <label class="admin-field admin-field--grow">
              <span>Название</span>
              <input v-model.trim="productForm.name" class="admin-input" required />
            </label>

            <label class="admin-field admin-field--grow">
              <span>ID категории</span>
              <input v-model.trim="productForm.category_id" class="admin-input" required />
            </label>

            <label class="admin-field admin-field--grow">
              <span>Цена</span>
              <input
                v-model.trim="productForm.price"
                class="admin-input"
                placeholder="Например, 500"
              />
            </label>

            <label class="admin-field admin-field--grow">
              <span>Файл изображения</span>
              <input
                ref="productImageInput"
                class="admin-input admin-input--file"
                type="file"
                accept="image/*"
                @change="handleProductImageChange"
              />
            </label>
          </div>

          <p v-if="productImageHint" class="admin-field__hint">{{ productImageHint }}</p>

          <div v-if="productImagePreview" class="admin-product-image-preview">
            <img :src="productImagePreview" alt="Предпросмотр изображения товара" />
          </div>

          <label class="admin-field admin-field--grow">
            <span>Описание</span>
            <textarea v-model.trim="productForm.description" class="admin-textarea" rows="3" />
          </label>

          <label class="admin-checkbox">
            <input v-model="productForm.is_active" type="checkbox" />
            <span>Товар активен</span>
          </label>

          <label class="admin-field admin-field--grow">
            <span>Варианты</span>
            <textarea
              v-model.trim="variantsText"
              class="admin-textarea"
              rows="4"
              placeholder="Формат строки: Название|Вес в граммах|Цена"
            />
          </label>

          <label class="admin-field admin-field--grow">
            <span>Удаляемые ингредиенты</span>
            <textarea
              v-model.trim="ingredientsText"
              class="admin-textarea"
              rows="4"
              placeholder="Каждый ингредиент с новой строки"
            />
          </label>

          <div class="admin-product-form__actions">
            <button
              type="button"
              class="admin-button admin-button--ghost"
              @click="resetProductForm"
            >
              Очистить
            </button>

            <button type="submit" class="admin-button" :disabled="isSubmittingProduct">
              {{
                isSubmittingProduct
                  ? 'Сохраняем...'
                  : productMode === 'create'
                    ? 'Создать товар'
                    : 'Сохранить товар'
              }}
            </button>
          </div>
        </form>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import BaseSelect from '@/components/BaseSelect'
import { useAdminStore } from '@/stores/admin'
import { useAuthStore } from '@/stores/auth'
import { useCategoriesStore } from '@/stores/categories'
import { useProductsStore } from '@/stores/products'
import { useSiteStore } from '@/stores/site'
import type { OrderRead, OrderStatusEnum, ProductRead, ProductVariantCreate } from '@/types/api'
import { getProductImage } from '@/utils/products'

defineOptions({
  name: 'AdminScreen',
})

type AdminTab = 'orders' | 'products'
type ProductMode = 'create' | 'edit'

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
const isTogglingSite = ref(false)
const isSubmittingProduct = ref(false)
const updatingOrderId = ref<string | null>(null)
const ordersFilter = ref('')
const ordersError = ref('')
const productError = ref('')
const productSuccess = ref('')
const siteActionMessage = ref('')
const productMode = ref<ProductMode>('create')
const selectedProductId = ref('')

const productForm = reactive({
  name: '',
  category_id: '',
  description: '',
  price: '',
  is_active: true,
})

const variantsText = ref('')
const ingredientsText = ref('')
const productImageFile = ref<File | null>(null)
const productImagePreview = ref('')
const productImageInput = ref<HTMLInputElement | null>(null)

const orderFilterOptions = [
  { value: '', label: 'Все' },
  { value: 'new', label: 'Новые' },
  { value: 'cooking', label: 'Готовятся' },
  { value: 'delivering', label: 'В пути' },
  { value: 'completed', label: 'Завершённые' },
  { value: 'cancelled', label: 'Отменённые' },
] as const

const orderStatusOptions = [
  { value: 'new', label: 'Новый' },
  { value: 'cooking', label: 'Готовится' },
  { value: 'delivering', label: 'В пути' },
  { value: 'completed', label: 'Завершён' },
  { value: 'cancelled', label: 'Отменён' },
] as const

const productModeOptions = [
  { value: 'create', label: 'Новый товар' },
  { value: 'edit', label: 'Редактировать' },
] as const

const sortedOrders = computed(() =>
  [...adminOrders.value].sort(
    (left, right) => new Date(right.created_at).getTime() - new Date(left.created_at).getTime(),
  ),
)

const groupedProducts = computed(() => {
  const categoryOrder = new Map(categories.value.map((category, index) => [category.id, index]))
  const groups = new Map<
    string,
    { id: string; name: string; sortOrder: number; products: ProductRead[] }
  >()

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

function countByStatus(status: OrderStatusEnum) {
  return adminOrders.value.filter((order) => order.status === status).length
}

function resetProductForm() {
  productForm.name = ''
  productForm.category_id = ''
  productForm.description = ''
  productForm.price = ''
  productForm.is_active = true
  variantsText.value = ''
  ingredientsText.value = ''
  productImageFile.value = null
  productImagePreview.value = ''
  if (productImageInput.value) {
    productImageInput.value.value = ''
  }
  productError.value = ''
  productSuccess.value = ''
  if (productMode.value === 'create') {
    selectedProductId.value = ''
  }
}

function handleProductModeChange() {
  productError.value = ''
  productSuccess.value = ''

  if (productMode.value === 'create') {
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
  productImagePreview.value = product.image_url ?? ''
  if (productImageInput.value) {
    productImageInput.value.value = ''
  }
  variantsText.value = product.variants
    .map((variant) => `${variant.name}|${variant.quantity_value}|${variant.price}`)
    .join('\n')
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
  selectedProductId.value = productId
  fillProductFormFromSelection()
}

function parseVariants(): ProductVariantCreate[] | undefined {
  if (!variantsText.value.trim()) return undefined

  return variantsText.value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [name, quantityValue, price] = line.split('|').map((part) => part.trim())

      if (!name || !quantityValue || !price) {
        throw new Error('Заполните варианты в формате: Название|Вес в граммах|Цена')
      }

      const parsedQuantity = Number(quantityValue)

      if (!Number.isFinite(parsedQuantity)) {
        throw new Error('Вес варианта должен быть числом')
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
    productImagePreview.value =
      products.value.find((item) => item.id === selectedProductId.value)?.image_url ?? ''
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

  isLoading.value = true
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

function formatDate(value: string) {
  return new Intl.DateTimeFormat('ru-RU', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

function formatPrice(value: string) {
  return `${Number(value).toFixed(0)} ₽`
}

function shortOrderId(value: string) {
  return `#${value.slice(0, 8)}`
}

function statusLabel(status: OrderStatusEnum) {
  return (
    {
      new: 'Новый',
      cooking: 'Готовится',
      delivering: 'В пути',
      completed: 'Завершён',
      cancelled: 'Отменён',
    }[status] ?? status
  )
}

function paymentLabel(paymentMethod: string) {
  return (
    {
      cash: 'Наличными',
      card: 'Картой курьеру',
      online: 'Онлайн',
    }[paymentMethod] ?? paymentMethod
  )
}

function openOrder(orderId: string) {
  router.push({
    name: 'admin-order',
    params: { id: orderId },
  })
}

onMounted(() => {
  void loadAdminData()
})
</script>

<style lang="scss">
.admin-screen {
  display: flex;
  flex-direction: column;
  gap: 24px;
  font-family:
    'Segoe UI',
    'Helvetica Neue',
    Arial,
    sans-serif;
  letter-spacing: -0.01em;
  font-feature-settings:
    'cv02' 1,
    'cv03' 1,
    'cv04' 1;
}

.admin-screen__state {
  min-height: 260px;
  border-radius: var(--radius-lg);
  border: 1px solid var(--surface-border);
  background: var(--surface-1);
  color: var(--text-secondary);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  text-align: center;
  padding: 24px;
}

.admin-screen__content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.admin-card,
.admin-tabs {
  border-radius: var(--radius-lg);
  border: 1px solid var(--surface-border);
  background: var(--surface-1);
}

.admin-toolbar-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.admin-card__eyebrow {
  margin: 0 0 8px;
  color: var(--text-secondary);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.admin-card__title {
  margin: 0;
  color: #fff;
  font-weight: 700;
  letter-spacing: -0.03em;
  line-height: 1.05;
}

.admin-tabs {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  width: fit-content;
}

.admin-tabs__button {
  min-height: 42px;
  padding: 0 14px;
  border-radius: 12px;
  color: var(--text-secondary);
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-weight: 600;
  letter-spacing: -0.01em;
}

.admin-tabs__button--active {
  background: rgba(127, 46, 67, 0.24);
  color: #fff;
}

.admin-tabs__count {
  min-width: 24px;
  height: 24px;
  padding: 0 8px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.08);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.02em;
}

.admin-card {
  padding: 20px;
}

.admin-card--stats {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
  padding: 10px;
}

.admin-stat {
  padding: 10px 12px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.03);
}

.admin-stat__value {
  display: block;
  font-size: 22px;
  font-weight: 700;
  color: #fff;
  margin-bottom: 2px;
  letter-spacing: -0.03em;
}

.admin-stat__label {
  color: var(--text-secondary);
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.admin-orders-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 320px;
  gap: 20px;
  align-items: start;
}

.admin-side-column {
  position: sticky;
  top: 104px;
}

.admin-card__header,
.admin-toolbar,
.admin-product-form,
.admin-site__actions,
.admin-product-form__actions,
.admin-orders {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.admin-card__header {
  margin-bottom: 16px;
}

.admin-card__header--row {
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-start;
}

.admin-order-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: flex-end;
}

.admin-filter-chip,
.admin-status-chip {
  min-height: 36px;
  padding: 0 12px;
  border-radius: 999px;
  color: var(--text-secondary);
  background: rgba(255, 255, 255, 0.04);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  transition:
    background-color 0.15s ease,
    color 0.15s ease;
}

.admin-filter-chip--active,
.admin-status-chip--active {
  background: rgba(127, 46, 67, 0.24);
  color: #fff;
}

.admin-status-chip--pending {
  opacity: 0.55;
}

.admin-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  color: var(--text-secondary);
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.02em;
}

.admin-field--grow {
  flex: 1;
}

.admin-product-picker {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
  gap: 10px;
}

.admin-product-groups {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.admin-product-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.admin-product-group__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.admin-product-group__title {
  margin: 0;
  color: #fff;
  font-size: 16px;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.admin-product-group__count {
  min-width: 24px;
  height: 24px;
  padding: 0 8px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.06);
  color: var(--text-secondary);
  font-size: 12px;
  font-weight: 700;
}

.admin-product-card {
  border-radius: 14px;
  border: 1px solid var(--surface-border);
  background: rgba(255, 255, 255, 0.03);
  overflow: hidden;
  text-align: left;
  transition:
    border-color 0.15s ease,
    background-color 0.15s ease,
    transform 0.15s ease;
}

.admin-product-card:hover {
  transform: translateY(-2px);
  border-color: rgba(255, 255, 255, 0.18);
}

.admin-product-card--active {
  border-color: rgba(127, 46, 67, 0.55);
  background: rgba(127, 46, 67, 0.18);
  box-shadow: 0 0 0 1px rgba(127, 46, 67, 0.28);
}

.admin-product-card__image {
  display: block;
  width: 100%;
  aspect-ratio: 16 / 9;
  object-fit: cover;
  background: rgba(255, 255, 255, 0.06);
}

.admin-product-card__body {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 10px;
}

.admin-product-card__top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
}

.admin-product-card__top strong {
  color: #fff;
  font-size: 13px;
  line-height: 1.3;
}

.admin-product-card__status {
  flex-shrink: 0;
  min-height: 24px;
  padding: 0 8px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.admin-product-card__status--active {
  background: rgba(63, 176, 108, 0.18);
  color: #b9f1c8;
}

.admin-product-card__status--inactive {
  background: rgba(176, 63, 63, 0.18);
  color: #ffb1b1;
}

.admin-product-card__meta,
.admin-product-card__description {
  margin: 0;
}

.admin-product-card__meta {
  color: #fff;
  font-size: 12px;
  font-weight: 600;
}

.admin-product-card__description {
  color: var(--text-secondary);
  font-size: 12px;
  line-height: 1.45;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.admin-input,
.admin-textarea {
  width: 100%;
  border-radius: 12px;
  border: 1px solid var(--surface-border);
  background: rgba(255, 255, 255, 0.03);
  color: #fff;
  padding: 0 12px;
  font: inherit;
  font-weight: 500;
  letter-spacing: -0.01em;
  outline: none;
}

.admin-input {
  height: 42px;
}

.admin-input--file {
  padding-top: 8px;
  padding-bottom: 8px;
}

.admin-textarea {
  min-height: 100px;
  padding-top: 12px;
  padding-bottom: 12px;
  resize: vertical;
}

.admin-field__hint {
  margin: -6px 0 0;
  color: var(--text-secondary);
  font-size: 12px;
  line-height: 1.4;
}

.admin-product-image-preview {
  width: 160px;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid var(--surface-border);
  background: rgba(255, 255, 255, 0.03);
}

.admin-product-image-preview img {
  display: block;
  width: 100%;
  aspect-ratio: 1 / 1;
  object-fit: cover;
}

.admin-button {
  min-height: 42px;
  padding: 0 16px;
  border-radius: 12px;
  color: #fff;
  background: linear-gradient(180deg, var(--accent), var(--accent-strong));
  font-weight: 700;
  letter-spacing: 0.02em;
}

.admin-button--ghost {
  background: rgba(255, 255, 255, 0.06);
}

.admin-button:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.admin-site__status-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.admin-site__status-label,
.admin-site__message,
.admin-order__comment {
  color: var(--text-secondary);
  line-height: 1.45;
}

.admin-site__message,
.admin-order__comment {
  margin: 0;
}

.admin-site__status-badge,
.admin-status {
  display: inline-flex;
  align-items: center;
  min-height: 30px;
  padding: 0 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  white-space: nowrap;
}

.admin-site__status-badge--ok,
.admin-status--completed {
  background: rgba(63, 176, 108, 0.18);
  color: #b9f1c8;
}

.admin-site__status-badge--warn,
.admin-status--new,
.admin-status--cooking,
.admin-status--delivering {
  background: rgba(211, 154, 34, 0.18);
  color: #f8d88f;
}

.admin-site__status-badge--neutral {
  background: rgba(255, 255, 255, 0.08);
  color: #d8d1d4;
}

.admin-empty,
.admin-notice {
  padding: 14px;
  border-radius: 14px;
}

.admin-empty {
  color: var(--text-secondary);
  background: rgba(255, 255, 255, 0.03);
}

.admin-notice {
  margin-bottom: 14px;
}

.admin-notice--error {
  background: rgba(176, 63, 63, 0.18);
  color: #ffb1b1;
}

.admin-notice--success {
  background: rgba(63, 176, 108, 0.18);
  color: #b9f1c8;
}

.admin-order {
  padding: 16px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.03);
}

.admin-order__top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
}

.admin-order__top h3,
.admin-order__top p {
  margin: 0;
}

.admin-order__link {
  margin-bottom: 4px;
  color: #fff;
  font-size: 28px;
  font-weight: 700;
  line-height: 1.1;
  letter-spacing: -0.04em;
  text-align: left;
}

.admin-order__top p {
  color: var(--text-secondary);
  font-size: 13px;
  letter-spacing: 0.01em;
}

.admin-order__meta {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  margin: 0 0 14px;
}

.admin-order__meta dt,
.admin-order__meta dd {
  margin: 0;
}

.admin-order__meta dt {
  color: var(--text-secondary);
  font-size: 12px;
  margin-bottom: 4px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.admin-order__status-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.admin-status--cancelled {
  background: rgba(176, 63, 63, 0.18);
  color: #ffb1b1;
}

.admin-product-form__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.admin-checkbox {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--text-secondary);
}

.admin-checkbox input {
  accent-color: var(--accent);
}

@media (max-width: 1200px) {
  .admin-orders-layout {
    grid-template-columns: 1fr;
  }

  .admin-side-column {
    position: static;
  }
}

@media (max-width: 960px) {
  .admin-card--stats,
  .admin-product-form__grid,
  .admin-order__meta {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 760px) {
  .admin-toolbar-top,
  .admin-card__header--row {
    flex-direction: column;
    align-items: stretch;
  }

  .admin-card--stats,
  .admin-product-form__grid,
  .admin-order__meta {
    grid-template-columns: 1fr;
  }

  .admin-order-filters {
    justify-content: flex-start;
  }
}
</style>
