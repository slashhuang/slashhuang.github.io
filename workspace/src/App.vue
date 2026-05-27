<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>

<template>
  <div class="workspace-shell">
    <aside class="sidebar">
      <div class="sidebar-logo">工作台</div>
      <nav class="sidebar-nav">
        <router-link to="/workspace/" class="nav-link" active-class="nav-link--active">首页</router-link>
        <router-link to="/workspace/list" class="nav-link" active-class="nav-link--active">内容列表</router-link>
      </nav>
    </aside>
    <main class="workspace-main">
      <RouterView />
    </main>
  </div>
</template>

<style lang="scss">
.workspace-shell {
  display: flex;
  min-height: 100vh;
}

.sidebar {
  width: 220px;
  background: var(--surface);
  border-right: 1px solid var(--border);
  padding: 24px 0;
  flex-shrink: 0;
}

.sidebar-logo {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--primary);
  padding: 0 16px 24px;
  border-bottom: 1px solid var(--border);
}

.sidebar-nav {
  padding: 16px 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.nav-link {
  padding: 8px 16px;
  color: var(--text-secondary);
  text-decoration: none;
  font-size: 0.875rem;
  transition: all 0.15s ease;
  border-left: 3px solid transparent;

  &:hover {
    color: var(--text);
    background: var(--bg);
  }

  &--active {
    color: var(--primary);
    background: rgba(99, 102, 241, 0.06);
    border-left-color: var(--primary);
    font-weight: 500;
  }
}

.workspace-main {
  flex: 1;
  background: var(--bg);
  padding: 24px 32px;
  overflow-y: auto;
}
</style>
