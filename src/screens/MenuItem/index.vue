<template>
  <div class="menu-item-screen">
    <div class="menu-item-screen__content" v-if="item">
      <div class="menu-item-screen__left-column">
        <div class="menu-item-screen__back-link">
          <span class="material-symbols">
            arrow_back
          </span>

          <span @click="goToMain" class="menu-item-screen__back-link-text">
            Вернуться назад
          </span>
        </div>

        <img class="menu-item-screen__preview" :src="item?.preview"/>
        
        <div class="menu-item-screen__ingredients">
          <template :key="index" v-for="(ingredient, index) in item.ingredients">
            <span class="menu-item-screen__ingredient">
              {{ ingredient }}
            </span>

            <span v-if="index !== item.ingredients.length - 1" class="menu-item-screen__separator">
              ●
            </span>
          </template>
        </div>
      </div>

      <div class="menu-item-screen__info">
        <span class="menu-item-screen__name">
          {{ item.name }}
        </span>

        <span class="menu-item-screen__weight">
          {{ item.weight }} г
        </span>

        <span class="menu-item-screen__price">
          {{ item.price }} ₽
        </span>

        <div v-if="!cartItem" class="menu-item-screen__add-container">
          <button @click="cartStore.addToCart(item)" class="menu-item-screen__add-to-cart-button">
            Добавить в корзину
          </button>
        </div>

        <div class="menu-item-screen__change-count-button-container" v-else>
          <button class="menu-item-screen__change-count-button" @click="cartStore.removeFromCart(item)">
            <span class="material-symbols">
              remove
            </span>
          </button>

          <span>
            {{ cartItem.count }}
          </span>
  
          <button class="menu-item-screen__change-count-button" @click="cartStore.addToCart(item)">
            <span class="material-symbols">
              add
            </span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { menuList } from '@/mocks';
  import { computed } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { useCartStore } from '@/stores/cart';
  import { storeToRefs } from 'pinia';

  defineOptions({
    name: 'MenuItemScreen'
  });

  const router = useRouter();
  const route = useRoute();

  const cartStore = useCartStore();

  const { cartItems } = storeToRefs(cartStore);

  const itemId = computed(() => Number(route.params.id));

  const item = computed(() => {
    return menuList.find((menuItem) => menuItem.id === itemId.value);
  });

  const cartItem = computed(() => cartItems.value[itemId.value]);

  function goToMain() {
    router.push({
      name: 'main'
    })
  }
</script>

<style lang="scss">
  .menu-item-screen {
    flex-grow: 1;
    width: 100%;
    padding-top: 100px;
  }

  .menu-item-screen__preview {
    width: 400px;
    aspect-ratio: 2/1.4;
    border-radius: 16px;
  }

  .menu-item-screen__content {
    display: flex;
    gap: 20px;
  }

  .menu-item-screen__left-column {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .menu-item-screen__back-link {
    display: flex;
    align-items: center;
    font-size: 18px;

    gap: 8px;
  }
  
  .menu-item-screen__back-link-text {
    cursor: pointer;

    &:hover {
      text-decoration: underline;
    }
  }

  .menu-item-screen__info {
    display: flex;
    flex-direction: column;
    padding-top: 44px;
  }

  .menu-item-screen__name {
    font-size: 24px;
    margin-bottom: 12px;
  }

  .menu-item-screen__weight {
    color: rgb(197, 197, 197);
    margin-bottom: 20px;
  }

  .menu-item-screen__ingredients {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .menu-item-screen__ingredient {
    font-size: 20px;
  }

  .menu-item-screen__price {
    margin-bottom: 20px;
  }

  .menu-item-screen__add-container {
    display: flex;
  }

  .menu-item-screen__add-to-cart-button {
    padding: 12px;
    background-color: rgba(255, 0, 47, 0.286);
    color: white;
    font-size: 18px;
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
    padding: 10px;
    background-color: rgba(255, 0, 47, 0.286);
    display: flex;
    align-items: center;
    justify-content: center;

    span {
      color: white;
      font-size: 24px;
    }
  }
</style>