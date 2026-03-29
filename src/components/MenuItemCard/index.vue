<template>
  <div class="menu-item-card">
    <div @click="goToItem" class="menu-item-card__image-container">
      <img
        class="menu-item-card__image"
        :src="menuItem.preview"
        :alt="menuItem.name"
        loading="lazy"
      />
    </div>

    <div class="menu-item-card__info">
      <span @click="goToItem" class="menu-item-card__name">{{ menuItem.name }}</span>

      <span class="menu-item-card__weight">{{ menuItem.weight }} г</span>

      <div class="menu-item-card__bottom-container">
        <span class="menu-item-card__price">{{ menuItem.price }} ₽</span>

        <div class="menu-item-card__buttons-container">
          <FadeTransition>
            <button
              v-if="cartItem"
              @click="cartStore.removeFromCart(menuItem)"
              class="menu-item-card__button menu-item-card__button--remove"
            >
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
            class="menu-item-card__button"
          >
            <span class="material-symbols">add</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TMenuItem } from '@/mocks';
import { useCartStore } from '@/stores/cart';
import { storeToRefs } from 'pinia';
import { computed } from 'vue';
import FadeTransition from '../transitions/Fade';
import { useRouter } from 'vue-router';

defineOptions({
  name: 'MenuItemCard',
});

const { menuItem } = defineProps<{
  menuItem: TMenuItem;
}>();

const router = useRouter();

const cartStore = useCartStore();

const { cartItems } = storeToRefs(cartStore);

const cartItem = computed(() => cartItems.value[menuItem.id]);

function goToItem() {
  router.push({
    name: 'menu-item',
    params: {
      id: menuItem.id,
    },
  });
}
</script>

<style lang="scss">
.menu-item-card {
  width: 224px;
  height: 320px;
  padding: 10px;
  min-width: 224px;
  display: flex;
  flex-direction: column;
  background: var(--surface-1);
  border: 1px solid var(--surface-border);
  border-radius: 16px;
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-card);
    border-color: rgba(255, 255, 255, 0.28);

    .menu-item-card__image {
      transform: scale(1.08);
    }
  }
}

.menu-item-card__image-container {
  width: 100%;
  aspect-ratio: 2/1.5;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  margin-bottom: 12px;
  background: rgba(0, 0, 0, 0.2);
}

.menu-item-card__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.35s ease;
}

.menu-item-card__info {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  flex-grow: 1;
  padding: 4px;
}

.menu-item-card__name {
  font-size: 17px;
  line-height: 1.25;
  font-weight: 600;
  color: white;
  margin-bottom: 10px;
  cursor: pointer;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;

  &:hover {
    text-decoration: underline;
  }
}

.menu-item-card__weight {
  width: fit-content;
  padding: 4px 8px;
  border-radius: 999px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.85);
  background: rgba(255, 255, 255, 0.12);
  margin-bottom: 10px;
}

.menu-item-card__price {
  color: white;
  font-size: 22px;
  line-height: 1;
  font-weight: 700;
  letter-spacing: 0.2px;
}

.menu-item-card__button {
  height: 34px;
  width: 34px;
  border-radius: 50%;
  background: linear-gradient(180deg, var(--accent), var(--accent-strong));
  box-shadow: none;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease, filter 0.15s ease;

  &:hover {
    transform: translateY(-1px);
    filter: brightness(1.08);
  }

  &:active {
    transform: translateY(0);
  }

  span {
    color: white;
  }
}

.menu-item-card__button--remove {
  background: rgba(255, 255, 255, 0.12);
  box-shadow: none;
}

.menu-item-card__bottom-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.menu-item-card__buttons-container {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.2);
}

.menu-item-card__count {
  min-width: 22px;
  text-align: center;
  font-size: 16px;
  font-weight: 700;
  color: #fff;
}

@media (max-width: 480px) {
  .menu-item-card {
    width: 100%;
    min-width: 0;
  }
}
</style>

