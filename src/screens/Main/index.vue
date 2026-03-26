<template>
  <div class="main-screen">
    <CategoryPreviewList class="main-screen__category-preview-list" title="Категория 1" :menu-list="menuList" />

    <CategoryPreviewList class="main-screen__category-preview-list" title="Категория 2" :menu-list="menuList" />

    <CategoryPreviewList class="main-screen__category-preview-list" title="Категория 3" :menu-list="menuList" />

    <CategoryPreviewList class="main-screen__category-preview-list" title="Категория 4" :menu-list="menuList" />
  </div>
</template>

<script setup lang="ts">
import CategoryPreviewList from '@/components/CategoryPreviewList'
import { menuList } from '@/mocks'

defineOptions({
  name: 'MainScreen',
})
</script>

<style lang="scss">
.main-screen {
  padding-top: 100px;
  background-color: black;
  flex-grow: 1;
  height: 2000px;
  overflow: hidden;
  width: 100%;
  // max-width: 1000px;
  // width: 100%;
}

.main-screen__category-preview-list {
  margin-bottom: 30px;
}
</style>
