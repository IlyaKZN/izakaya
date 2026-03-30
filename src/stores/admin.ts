import { ref } from 'vue'
import { defineStore } from 'pinia'
import * as adminApi from '@/api/admin'
import type {
  ApiEmptyResponse,
  OrderRead,
  OrderStatusUpdate,
  ProductCreate,
  ProductRead,
  ProductUpdate,
  Uuid,
} from '@/types/api'

export const useAdminStore = defineStore('admin', () => {
  const adminOrders = ref<OrderRead[]>([])
  const adminOrdersById = ref<Record<string, OrderRead>>({})
  const adminProductsById = ref<Record<string, ProductRead>>({})
  const lastSiteToggleResult = ref<ApiEmptyResponse | null>(null)

  function upsertOrder(order: OrderRead) {
    adminOrdersById.value[order.id] = order
  }

  function upsertOrders(orders: OrderRead[]) {
    orders.forEach(upsertOrder)
  }

  function upsertProduct(product: ProductRead) {
    adminProductsById.value[product.id] = product
  }

  async function createProduct(payload: ProductCreate) {
    const response = await adminApi.createProduct(payload)
    upsertProduct(response)

    return response
  }

  async function updateProduct(productId: Uuid, payload: ProductUpdate) {
    const response = await adminApi.updateProduct(productId, payload)
    upsertProduct(response)

    return response
  }

  async function fetchOrders(status?: string | null) {
    const response = await adminApi.listOrders(status)
    adminOrders.value = response
    upsertOrders(response)

    return response
  }

  async function updateOrderStatus(orderId: Uuid, payload: OrderStatusUpdate) {
    const response = await adminApi.updateOrderStatus(orderId, payload)
    upsertOrder(response)
    adminOrders.value = adminOrders.value.map((order) =>
      order.id === response.id ? response : order,
    )

    return response
  }

  async function toggleSite(enabled: boolean) {
    const response = await adminApi.toggleSite(enabled)
    lastSiteToggleResult.value = response

    return response
  }

  return {
    adminOrders,
    adminOrdersById,
    adminProductsById,
    lastSiteToggleResult,
    createProduct,
    updateProduct,
    fetchOrders,
    updateOrderStatus,
    toggleSite,
  }
})
