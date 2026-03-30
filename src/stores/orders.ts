import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import * as ordersApi from '@/api/orders'
import type { OrderCreateInput, OrderRead, Uuid } from '@/types/api'

export const useOrdersStore = defineStore('orders', () => {
  const myOrders = ref<OrderRead[]>([])
  const ordersById = ref<Record<string, OrderRead>>({})
  const createdOrder = ref<OrderRead | null>(null)

  const hasOrders = computed(() => myOrders.value.length > 0)

  function upsertOrder(order: OrderRead) {
    ordersById.value[order.id] = order
  }

  function upsertOrderList(orderList: OrderRead[]) {
    orderList.forEach(upsertOrder)
  }

  async function createOrder(payload: OrderCreateInput) {
    const response = await ordersApi.createOrder(payload)
    createdOrder.value = response
    upsertOrder(response)

    return response
  }

  async function fetchMyOrders() {
    const response = await ordersApi.getMyOrders()
    myOrders.value = response
    upsertOrderList(response)

    return response
  }

  async function fetchOrder(orderId: Uuid) {
    const response = await ordersApi.getOrder(orderId)
    upsertOrder(response)

    return response
  }

  return {
    myOrders,
    ordersById,
    createdOrder,
    hasOrders,
    createOrder,
    fetchMyOrders,
    fetchOrder,
  }
})
