<template>
  <header class="header">
    <div class="header__inner">
      <div class="header__brand">
        <span class="header__brand-mark">Viet Kitchen</span>
        <span class="header__brand-subtitle">доставка вьетнамской кухни</span>
      </div>

      <label class="header__search">
        <span class="material-symbols">search</span>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Поиск по меню"
        />
      </label>

      <div class="header__meta">
        <div class="header__meta-item">
          <span class="material-symbols">schedule</span>
          <span>11:30 - 22:25</span>
        </div>
        <div class="header__meta-item">
          <span class="material-symbols">call</span>
          <span>+7 (843) 558-78-87</span>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useCatalogStore } from '@/stores/catalog';

defineOptions({
  name: 'TheHeader',
});

const catalogStore = useCatalogStore();
const { searchQuery } = storeToRefs(catalogStore);
</script>

<style lang="scss">
.header {
  width: 100%;
  border-bottom: 1px solid var(--surface-border);
  background: rgba(24, 18, 21, 0.96);
  backdrop-filter: blur(4px);
}

.header__inner {
  max-width: 1700px;
  margin: 0 auto;
  height: 80px;
  padding: 0 24px;
  display: flex;
  align-items: center;
  gap: 18px;
}

.header__brand {
  display: flex;
  flex-direction: column;
  min-width: 220px;
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

.header__search {
  height: 46px;
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  border-radius: 12px;
  border: 1px solid var(--surface-border);
  background: var(--surface-1);
  padding: 0 12px;

  span {
    color: var(--text-secondary);
  }

  input {
    flex: 1;
    background: transparent;
    border: 0;
    color: var(--text-primary);
    outline: none;
    font: inherit;
  }
}

.header__meta {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header__meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
  color: var(--text-secondary);
  font-size: 13px;

  span:first-child {
    font-size: 18px;
  }
}

@media (max-width: 1100px) {
  .header__meta {
    display: none;
  }
}

@media (max-width: 900px) {
  .header__inner {
    padding: 0 16px;
    height: 72px;
  }

  .header__brand {
    min-width: 150px;
  }

  .header__brand-subtitle {
    display: none;
  }
}
</style>
