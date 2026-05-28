<script setup lang="ts">
import PlatformBadge from './PlatformBadge.vue'

interface Props {
  title: string
  date: string
  tags?: string[]
  platforms?: ('blog' | 'wechat' | 'xiaohongshu')[]
  status?: 'draft' | 'published'
}

const emit = defineEmits<{
  click: []
}>()

withDefaults(defineProps<Props>(), {
  tags: () => [],
  platforms: () => [],
  status: 'draft',
})
</script>

<template>
  <article class="content-card" @click="emit('click')">
    <div class="content-card-header">
      <h3 class="content-card-title">{{ title }}</h3>
      <span
        :class="['content-card-status', `content-card-status--${status}`]"
      >
        {{ status === 'draft' ? 'Draft' : 'Published' }}
      </span>
    </div>
    <time class="content-card-date">{{ date }}</time>
    <div v-if="platforms.length" class="content-card-platforms">
      <PlatformBadge
        v-for="platform in platforms"
        :key="platform"
        :platform="platform"
      />
    </div>
    <div v-if="tags.length" class="content-card-tags">
      <span v-for="tag in tags" :key="tag" class="content-card-tag">
        {{ tag }}
      </span>
    </div>
  </article>
</template>

<style scoped lang="scss">
.content-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: var(--space-4);
  box-shadow: var(--shadow-sm);
  cursor: pointer;
  transition: box-shadow 0.15s ease, border-color 0.15s ease, transform 0.15s ease;

  &:hover {
    box-shadow: var(--shadow-md);
    border-color: var(--primary);
    transform: translateY(-1px);
  }
}

.content-card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 8px;
}

.content-card-title {
  font-size: var(--text-h3);
  font-weight: 600;
  line-height: 1.4;
  color: var(--text);
}

.content-card-status {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: var(--radius-full);
  font-weight: 500;
  white-space: nowrap;
  flex-shrink: 0;

  &--draft {
    background: #fef3c7;
    color: #92400e;
  }

  &--published {
    background: #dcfce7;
    color: #166534;
  }
}

.content-card-date {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  display: block;
  margin-bottom: 8px;
}

.content-card-platforms {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-bottom: 8px;
}

.content-card-tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.content-card-tag {
  font-size: 12px;
  color: var(--text-secondary);
  background: var(--bg);
  padding: 2px 8px;
  border-radius: var(--radius-full);
}
</style>
