<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { Home, List, FilePlus } from 'lucide-vue-next'

interface NavItem {
  label: string
  to: string
  icon: typeof Home
}

const navItems: NavItem[] = [
  { label: 'Home', to: '/', icon: Home },
  { label: 'Content List', to: '/list', icon: List },
  { label: 'New Post', to: '/editor/new', icon: FilePlus },
]

const route = useRoute()

function isActive(to: string): boolean {
  if (to === '/' && (route.path === '/' || route.path === '')) {
    return true
  }
  return route.path.startsWith(to) && to !== '/'
}
</script>

<template>
  <aside class="sidebar">
    <div class="sidebar-header">
      <span class="sidebar-logo">Content Workspace</span>
    </div>
    <nav class="sidebar-nav">
      <router-link
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        :class="['sidebar-link', { 'sidebar-link--active': isActive(item.to) }]"
      >
        <component :is="item.icon" :size="18" class="sidebar-link-icon" />
        <span>{{ item.label }}</span>
      </router-link>
    </nav>
  </aside>
</template>

<style scoped lang="scss">
.sidebar {
  width: 220px;
  background: var(--surface);
  border-right: 1px solid var(--border);
  padding: 24px 0;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  padding: 0 16px 24px;
  border-bottom: 1px solid var(--border);
}

.sidebar-logo {
  font-size: 1.25rem;
  font-weight: 700;
  background: var(--brand-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.sidebar-nav {
  padding: 16px 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.sidebar-link {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  color: var(--text-secondary);
  text-decoration: none;
  font-size: var(--text-body);
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

.sidebar-link-icon {
  flex-shrink: 0;
}
</style>
