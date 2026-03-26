<template>
  <div class="menu-item-card">
    <div class="menu-item-card__image-container">
      <img
        class="menu-item-card__image"
        src="https://www.russianfood.com/dycontent/images_upl/559/big_558596.jpg"
      />
    </div>

    <div class="menu-item-card__info">
      <span class="menu-item-card__name">{{ menuItem.name }}</span>

      <span class="menu-item-card__weight">{{ menuItem.weight }} г</span>

      <div>
        <span class="menu-item-card__price"> {{ menuItem.price }} ₽ </span>

        <button
        @click="addToCart(menuItem)"
        class="button">
          <span class="material-symbols">add</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TMenuItem } from '@/mocks'
import { useCartStore } from '@/stores/cart';

defineOptions({
  name: 'MenuItemCard',
})

const { menuItem } = defineProps<{
  menuItem: TMenuItem
}>()

const { addToCart } = useCartStore();
</script>

<style lang="scss">
.menu-item-card {
  width: 224px;
  height: 280px;
  padding: 12px;
  min-width: 224px;
  display: flex;
  flex-direction: column;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 12px;

  &:hover {
    .menu-item-card__image {
      transform: scale(1.2);
    }
  }
}

.menu-item-card__image-container {
  width: 100%;
  aspect-ratio: 2/1.4;
  overflow: hidden;
  cursor: pointer;
  margin-bottom: 8px;
}

.menu-item-card__image {
  width: 100%;
  height: 100%;

  transition: transform 0.2s ease;
}

.menu-item-card__info {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  flex-grow: 1;
}

.menu-item-card__name {
  font-size: 18px;
  color: white;
  margin-bottom: auto;
}

.menu-item-card__weight {
  font-size: 16px;
  color: white;
}

.menu-item-card__price {
  color: white;
  font-size: 18px;
}

.button {
  height: 44px;
  width: 44px;
  background-color: rgba(200, 16, 49, 0.675);
  cursor: pointer;
}
</style>
