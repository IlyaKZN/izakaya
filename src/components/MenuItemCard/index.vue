<template>
  <div class="menu-item-card">
    <div @click="goToItem" class="menu-item-card__image-container">
      <img
        class="menu-item-card__image"
        :src="menuItem.preview"
      />
    </div>

    <div class="menu-item-card__info">
      <span @click="goToItem" class="menu-item-card__name">{{ menuItem.name }}</span>

      <span class="menu-item-card__weight">{{ menuItem.weight }} г</span>

      <div class="menu-item-card__bottom-container">
        <span class="menu-item-card__price"> {{ menuItem.price }} ₽ </span>

        <div
        class="menu-item-card__buttons-container"
        :class="{
          'menu-item-card__buttons-container-test': !cartItem
        }">
            <FadeTransition>
              <button
              v-if="cartItem"
              @click="cartStore.removeFromCart(menuItem)"
              class="menu-item-card__button menu-item-card__button--remove">
                <span class="material-symbols">remove</span>
              </button>
            </FadeTransition>

            <FadeTransition>
              <span v-if="cartItem" class="menu-item-card__count">
                {{ cartItem.count }}
              </span>
            </FadeTransition>

          <button
          @click="cartStore.addToCart(menuItem)"
          class="menu-item-card__button">
            <span class="material-symbols">add</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TMenuItem } from '@/mocks'
import { useCartStore } from '@/stores/cart';
import { storeToRefs } from 'pinia';
import { computed } from 'vue';
import FadeTransition from '../transitions/Fade';
import { useRouter } from 'vue-router';

defineOptions({
  name: 'MenuItemCard',
})

const { menuItem } = defineProps<{
  menuItem: TMenuItem
}>()

const router = useRouter();

const cartStore = useCartStore();

const { cartItems } = storeToRefs(cartStore);

const cartItem = computed(() => cartItems.value[menuItem.id]);

function goToItem() {
  router.push({
    name: 'menu-item',
    params: {
      id: menuItem.id,
    }
  })
}
</script>

<style lang="scss">
.menu-item-card {
  width: 224px;
  height: 300px;
  padding: 8px;
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
  aspect-ratio: 2/1.5;
  border-radius: 6px;
  overflow: hidden;
  cursor: pointer;
  margin-bottom: 12px;
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
  padding: 4px;
}

.menu-item-card__name {
  font-size: 18px;
  color: white;
  margin-bottom: auto;
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
}

.menu-item-card__weight {
  font-size: 16px;
  color: rgb(197, 197, 197);
  margin-bottom: 4px;
}

.menu-item-card__price {
  color: white;
  font-size: 18px;
}

.menu-item-card__button {
  height: 36px;
  width: 36px;
  background-color: rgba(255, 0, 47, 0.286);
  cursor: pointer;

  span {
    color: white;
  }
}

.menu-item-card__button--remove {
  background-color: transparent;
}

.menu-item-card__bottom-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.menu-item-card__buttons-container {
  display: flex;
  align-items: center;
  gap: 12px;
}

.menu-item-card__count {
  font-size: 18px;
}
</style>
