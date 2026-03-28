<template>
  <div class="categories-list">
    <span v-for="category in categories" :key="category">
      {{ category }}
    </span>
  </div>
</template>

<script setup lang="ts">
  defineOptions({
    name: 'CategoriesList'
  })

  const categories = [
    'Категория 1',
    'Категория 2',
    'Категория 3',
    'Категория 4',
    'Категория 5',
    'Категория 6',
    'Категория 7',
    'Категория 8',
  ]
</script>

<style lang="scss">
  .categories-list {
    height: 400px;
    width: 250px;
    display: flex;
    gap: 20px;
    color: white;
    flex-direction: column;
    font-size: 18px;
  }
</style>
