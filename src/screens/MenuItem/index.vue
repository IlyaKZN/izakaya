<template>
  <div class="menu-item-screen">
    <div class="menu-item-screen__content" v-if="item">
      <div class="menu-item-screen__left-column">
        <button class="menu-item-screen__back-link" type="button" @click="goToMain">
          <span class="material-symbols"> arrow_back </span>

          <span class="menu-item-screen__back-link-text"> Вернуться назад </span>
        </button>

        <img class="menu-item-screen__preview" :src="item.preview" :alt="item.name" />

        <div class="menu-item-screen__ingredients">
          <template v-for="(ingredient, index) in item.ingredients" :key="index">
            <span class="menu-item-screen__ingredient">
              {{ ingredient }}
            </span>

            <span v-if="index !== item.ingredients.length - 1" class="menu-item-screen__separator">
              •
            </span>
          </template>
        </div>
      </div>

      <div class="menu-item-screen__info">
        <span class="menu-item-screen__name">
          {{ item.name }}
        </span>

        <span class="menu-item-screen__weight"> {{ item.weight }} г </span>

        <span class="menu-item-screen__price"> {{ item.price }} ₽ </span>

        <div v-if="!cartItem" class="menu-item-screen__add-container">
          <button
            @click="cartStore.addToCart(item)"
            class="menu-item-screen__add-to-cart-button"
            type="button"
          >
            Добавить в корзину
          </button>
        </div>

        <div class="menu-item-screen__change-count-button-container" v-else>
          <button
            class="menu-item-screen__change-count-button"
            type="button"
            @click="cartStore.removeFromCart(item)"
          >
            <span class="material-symbols"> remove </span>
          </button>

          <span class="menu-item-screen__count">
            {{ cartItem.count }}
          </span>

          <button
            class="menu-item-screen__change-count-button"
            type="button"
            @click="cartStore.addToCart(item)"
          >
            <span class="material-symbols"> add </span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { menuList } from '@/mocks'
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { storeToRefs } from 'pinia'

defineOptions({
  name: 'MenuItemScreen',
})

const router = useRouter()
const route = useRoute()

const cartStore = useCartStore()

const { cartItems } = storeToRefs(cartStore)

const itemId = computed(() => Number(route.params.id))

const item = computed(() => {
  return menuList.find((menuItem) => menuItem.id === itemId.value)
})

const cartItem = computed(() => cartItems.value[itemId.value])

function goToMain() {
  router.push({
    name: 'main',
  })
}
</script>

<style lang="scss">
.menu-item-screen {
  width: 100%;
}

.menu-item-screen__preview {
  width: min(460px, 100%);
  aspect-ratio: 2/1.45;
  border-radius: 18px;
  object-fit: cover;
  box-shadow: var(--shadow-card);
}

.menu-item-screen__content {
  display: grid;
  grid-template-columns: minmax(0, 460px) minmax(0, 1fr);
  gap: 28px;
  padding: 22px;
  border-radius: var(--radius-lg);
  border: 1px solid var(--surface-border);
  background: var(--surface-1);
}

.menu-item-screen__left-column {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.menu-item-screen__back-link {
  width: fit-content;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.08);
}

.menu-item-screen__back-link:hover {
  background: rgba(255, 255, 255, 0.14);
}

.menu-item-screen__back-link-text {
  cursor: pointer;
}

.menu-item-screen__info {
  display: flex;
  flex-direction: column;
  padding-top: 44px;
}

.menu-item-screen__name {
  font-size: 34px;
  margin-bottom: 10px;
  font-weight: 700;
}

.menu-item-screen__weight {
  color: var(--text-secondary);
  margin-bottom: 20px;
}

.menu-item-screen__ingredients {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.menu-item-screen__ingredient {
  font-size: 16px;
  color: var(--text-secondary);
}

.menu-item-screen__price {
  margin-bottom: 20px;
  font-size: 34px;
  font-weight: 700;
}

.menu-item-screen__add-container {
  display: flex;
}

.menu-item-screen__add-to-cart-button {
  height: 44px;
  padding: 0 18px;
  border-radius: 10px;
  color: #fff;
  background: linear-gradient(180deg, var(--accent), var(--accent-strong));
}

.menu-item-screen__separator {
  font-size: 12px;
  color: rgb(144, 144, 144);
}

.menu-item-screen__change-count-button-container {
  display: flex;
  align-items: center;
  gap: 12px;
}

.menu-item-screen__change-count-button {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.14);
  display: flex;
  align-items: center;
  justify-content: center;

  span {
    color: white;
    font-size: 24px;
  }
}

.menu-item-screen__count {
  min-width: 24px;
  text-align: center;
  font-size: 20px;
  font-weight: 600;
}

@media (max-width: 900px) {
  .menu-item-screen__content {
    grid-template-columns: 1fr;
    padding: 14px;
  }

  .menu-item-screen__info {
    padding-top: 0;
  }

  .menu-item-screen__name,
  .menu-item-screen__price {
    font-size: 28px;
  }
}
</style>
