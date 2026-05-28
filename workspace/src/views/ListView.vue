<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Plus, Filter } from 'lucide-vue-next'
import ContentCard from '@/components/ContentCard.vue'
import { useContentStore } from '@/stores/content'

const router = useRouter()
const { platformFilter, statusFilter, filtered, platforms, statuses } = useContentStore()

const platformLabels: Record<string, string> = {
  all: 'All',
  blog: 'Blog',
  wechat: 'WeChat',
  xiaohongshu: 'Xiaohongshu',
}

const statusLabels: Record<string, string> = {
  all: 'All',
  draft: 'Draft',
  published: 'Published',
}

function navigateToEditor() {
  router.push('/editor/new')
}
</script>

<template>
  <div class="list-view">
    <div class="list-view-header">
      <h1>Content List</h1>
      <button class="btn-new" @click="navigateToEditor">
        <Plus :size="18" />
        New Post
      </button>
    </div>

    <div class="filter-bar">
      <div class="filter-group">
        <Filter :size="14" class="filter-icon" />
        <span class="filter-label">Platform:</span>
        <div class="filter-chips">
          <button
            v-for="p in platforms"
            :key="p"
            :class="['filter-chip', { active: platformFilter.value === p }]"
            @click="platformFilter.value = p"
          >
            {{ platformLabels[p] }}
          </button>
        </div>
      </div>

      <div class="filter-group">
        <span class="filter-label">Status:</span>
        <div class="filter-chips">
          <button
            v-for="s in statuses"
            :key="s"
            :class="['filter-chip', { active: statusFilter.value === s }]"
            @click="statusFilter.value = s"
          >
            {{ statusLabels[s] }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="filtered.length" class="content-grid">
      <ContentCard
        v-for="entry in filtered"
        :key="entry.id"
        :title="entry.title"
        :date="entry.date"
        :platforms="entry.targets"
        :tags="entry.tags"
        :status="entry.status"
        @click="router.push(`/editor/${entry.id}`)"
      />
    </div>

    <div v-else class="empty-state">
      <Filter :size="48" class="empty-state-icon" />
      <p class="empty-state-text">No content matches the current filters.</p>
      <button class="btn-reset" @click="platformFilter.value = 'all'; statusFilter.value = 'all'">
        Clear Filters
      </button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.list-view {
  max-width: 1100px;
}

.list-view-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-5);
}

h1 {
  font-size: var(--text-h1, 1.75rem);
  font-weight: 700;
}

.btn-new {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: var(--primary);
  color: white;
  border: none;
  border-radius: var(--radius-sm);
  font-size: var(--text-sm);
  font-weight: 500;
  cursor: pointer;
  transition: opacity 0.15s ease;

  &:hover {
    opacity: 0.9;
  }
}

.filter-bar {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  margin-bottom: var(--space-5);
  padding: var(--space-4);
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
}

.filter-group {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  flex-wrap: wrap;
}

.filter-icon {
  color: var(--text-secondary);
  flex-shrink: 0;
}

.filter-label {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  font-weight: 500;
}

.filter-chips {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.filter-chip {
  padding: 4px 12px;
  border: 1px solid var(--border);
  border-radius: var(--radius-full);
  background: transparent;
  font-size: var(--text-sm);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    border-color: var(--primary);
    color: var(--primary);
  }

  &.active {
    background: var(--primary);
    border-color: var(--primary);
    color: white;
  }
}

.content-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-4);

  @media (max-width: 900px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-7);
  text-align: center;
}

.empty-state-icon {
  color: var(--text-secondary);
  opacity: 0.4;
  margin-bottom: var(--space-4);
}

.empty-state-text {
  color: var(--text-secondary);
  margin-bottom: var(--space-4);
  font-size: var(--text-body);
}

.btn-reset {
  padding: 8px 16px;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--surface);
  color: var(--text-secondary);
  font-size: var(--text-sm);
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    border-color: var(--primary);
    color: var(--primary);
  }
}
</style>
