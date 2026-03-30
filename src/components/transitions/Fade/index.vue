<template>
  <Transition name="fade">
    <slot />
  </Transition>
</template>

<script setup lang="ts">
defineOptions({
  name: 'FadeTransition',
})
</script>

<style lang="scss">
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
