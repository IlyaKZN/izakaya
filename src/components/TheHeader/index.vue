<template>
  <header class="header">
    <div class="header__inner">
      <div class="header__brand">
        <span class="header__brand-mark">Viet Kitchen</span>
        <span class="header__brand-subtitle">доставка вьетнамской кухни</span>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
defineOptions({
  name: 'TheHeader',
});
</script>

<style lang="scss">
.header {
  width: 100%;
  border-bottom: 1px solid var(--surface-border);
  background: rgba(24, 18, 21, 0.94);
}

.header__inner {
  max-width: 1700px;
  margin: 0 auto;
  height: 80px;
  padding: 0 24px;
  display: flex;
  align-items: center;
}

.header__brand {
  display: flex;
  flex-direction: column;
}

.header__brand-mark {
  font-size: 23px;
  letter-spacing: 0.3px;
  font-weight: 700;
  text-transform: uppercase;
}

.header__brand-subtitle {
  color: var(--text-secondary);
  font-size: 13px;
}

@media (max-width: 900px) {
  .header__inner {
    padding: 0 16px;
  }
}
</style>

