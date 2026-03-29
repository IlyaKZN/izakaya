<template>
  <div class="main-screen">
    <CategoryPreviewList class="main-screen__category-preview-list" title="Популярные блюда" :menu-list="menuList" />

    <CategoryPreviewList class="main-screen__category-preview-list" title="Супы и фо" :menu-list="menuList" />

    <CategoryPreviewList class="main-screen__category-preview-list" title="Рис и лапша" :menu-list="menuList" />

    <CategoryPreviewList class="main-screen__category-preview-list" title="Горячие блюда" :menu-list="menuList" />
  </div>
</template>

<script setup lang="ts">
import CategoryPreviewList from '@/components/CategoryPreviewList';
import { menuList } from '@/mocks';

defineOptions({
  name: 'MainScreen',
});
</script>

<style lang="scss">
.main-screen {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.main-screen__category-preview-list {
  margin-bottom: 0;
}
</style>
