<script setup lang="ts">
import { Save, Eye } from 'lucide-vue-next'

interface Props {
  status?: 'draft' | 'published'
  selectedPlatforms?: ('blog' | 'wechat' | 'xiaohongshu')[]
}

const props = withDefaults(defineProps<Props>(), {
  status: 'draft',
  selectedPlatforms: () => ['blog'],
})

const emit = defineEmits<{
  save: []
  preview: []
  'update:status': [value: 'draft' | 'published']
  'update:platforms': [value: ('blog' | 'wechat' | 'xiaohongshu')[]]
}>()

const allPlatforms: { key: 'blog' | 'wechat' | 'xiaohongshu'; label: string }[] = [
  { key: 'blog', label: 'Blog' },
  { key: 'wechat', label: 'WeChat' },
  { key: 'xiaohongshu', label: 'Xiaohongshu' },
]

function togglePlatform(key: 'blog' | 'wechat' | 'xiaohongshu') {
  const current = [...props.selectedPlatforms]
  const idx = current.indexOf(key)
  if (idx >= 0) {
    current.splice(idx, 1)
  } else {
    current.push(key)
  }
  emit('update:platforms', current)
}
</script>

<template>
  <div class="editor-toolbar">
    <div class="editor-toolbar-left">
      <div class="platform-selector">
        <label class="platform-selector-label">Platforms:</label>
        <label
          v-for="platform in allPlatforms"
          :key="platform.key"
          :class="['platform-checkbox', { 'platform-checkbox--checked': selectedPlatforms.includes(platform.key) }]"
        >
          <input
            type="checkbox"
            :checked="selectedPlatforms.includes(platform.key)"
            @change="togglePlatform(platform.key)"
          />
          {{ platform.label }}
        </label>
      </div>
    </div>
    <div class="editor-toolbar-right">
      <select
        :value="status"
        class="status-select"
        @change="emit('update:status', ($event.target as HTMLSelectElement).value as 'draft' | 'published')"
      >
        <option value="draft">Draft</option>
        <option value="published">Published</option>
      </select>
      <button class="toolbar-btn toolbar-btn--secondary" @click="emit('preview')">
        <Eye :size="14" /> Preview
      </button>
      <button class="toolbar-btn toolbar-btn--primary" @click="emit('save')">
        <Save :size="14" /> Save
      </button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.editor-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 16px;
  background: var(--surface);
  border-bottom: 1px solid var(--border);
  gap: 16px;
  flex-wrap: wrap;
}

.editor-toolbar-left,
.editor-toolbar-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.platform-selector {
  display: flex;
  align-items: center;
  gap: 12px;
}

.platform-selector-label {
  font-size: 13px;
  color: var(--text-secondary);
  font-weight: 500;
}

.platform-checkbox {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.15s ease;

  &--checked {
    color: var(--primary);
    background: rgba(99, 102, 241, 0.08);
    font-weight: 500;
  }

  input {
    display: none;
  }
}

.status-select {
  padding: 4px 8px;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--surface);
  color: var(--text);
  font-size: 13px;
  font-family: var(--font-sans);
  cursor: pointer;
  outline: none;

  &:focus {
    border-color: var(--primary);
  }
}

.toolbar-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  font-family: var(--font-sans);
  cursor: pointer;
  transition: all 0.15s ease;
  border: none;

  &--primary {
    background: var(--primary);
    color: #fff;

    &:hover {
      background: var(--primary-light);
    }
  }

  &--secondary {
    background: transparent;
    color: var(--text-secondary);
    border: 1px solid var(--border);

    &:hover {
      background: var(--bg);
      color: var(--text);
    }
  }
}
</style>
