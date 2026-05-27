<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import MarkdownIt from 'markdown-it'
import { useContentStore, type ContentEntry } from '@/stores/content'
import PlatformBadge from '@/components/PlatformBadge.vue'
import {
  renderMarkdown,
  stripFrontmatter,
  generateWeChatHtml,
  generateXiaohongshuCard,
} from '@/utils/preview'

const route = useRoute()
const store = useContentStore()
const md = new MarkdownIt({ html: true, linkify: true, typographer: true })

type Platform = 'blog' | 'wechat' | 'xiaohongshu'

const activePlatform = ref<Platform>('blog')
const entry = ref<ContentEntry | null>(null)
const notFound = ref(false)

const postId = computed(() => route.params.id as string)

const bodyText = computed(() => {
  if (!entry.value?.body) return ''
  return stripFrontmatter(entry.value.body)
})

const blogHtml = computed(() => {
  if (!entry.value) return ''
  return md.render(bodyText.value || '*No content yet*')
})

const wechatHtml = computed(() => {
  if (!entry.value) return ''
  return generateWeChatHtml(
    entry.value.title,
    bodyText.value || '*No content yet*',
    entry.value.author || 'Anonymous',
  )
})

const xhsHtml = computed(() => {
  if (!entry.value) return ''
  return generateXiaohongshuCard(
    entry.value.title,
    bodyText.value || '*No content yet*',
    entry.value.tags,
  )
})

function loadEntry() {
  const id = postId.value
  const found = store.findById(id)
  if (found) {
    entry.value = found
    notFound.value = false
    // Default to the first platform the entry targets
    if (found.targets.length > 0 && !found.targets.includes(activePlatform.value)) {
      activePlatform.value = found.targets[0]
    }
  } else {
    entry.value = null
    notFound.value = true
  }
}

onMounted(() => {
  loadEntry()
})

watch(() => route.params.id, () => {
  loadEntry()
})

const tabs: { key: Platform; label: string }[] = [
  { key: 'blog', label: 'Blog' },
  { key: 'wechat', label: 'WeChat' },
  { key: 'xiaohongshu', label: 'Xiaohongshu' },
]
</script>

<template>
  <div class="preview-view">
    <!-- Header -->
    <div class="preview-header">
      <div v-if="entry" class="preview-title-bar">
        <h1 class="preview-title">{{ entry.title }}</h1>
        <span :class="['preview-status', `preview-status--${entry.status}`]">
          {{ entry.status === 'draft' ? 'Draft' : 'Published' }}
        </span>
      </div>
      <p v-if="entry" class="preview-meta">
        <span>{{ entry.date }}</span>
        <span v-if="entry.author">&middot; {{ entry.author }}</span>
      </p>
      <div v-if="entry && entry.tags.length" class="preview-tags">
        <span v-for="tag in entry.tags" :key="tag" class="preview-tag">
          {{ tag }}
        </span>
      </div>
      <div v-if="notFound" class="preview-error">
        <h2>Content not found</h2>
        <p>No entry exists with ID: {{ postId }}</p>
      </div>
    </div>

    <!-- Platform tabs (only when entry exists) -->
    <div v-if="entry" class="platform-tabs">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        :class="[
          'platform-tab',
          { 'platform-tab--active': activePlatform === tab.key },
          { 'platform-tab--disabled': !entry.targets.includes(tab.key) },
        ]"
        :disabled="!entry.targets.includes(tab.key)"
        @click="activePlatform = tab.key"
      >
        <PlatformBadge v-if="entry.targets.includes(tab.key)" :platform="tab.key" />
        <span v-else class="tab-label-disabled">{{ tab.label }}</span>
      </button>
    </div>

    <!-- Blog preview -->
    <div v-if="entry && activePlatform === 'blog'" class="preview-panel preview-panel--blog">
      <div class="blog-content" v-html="blogHtml" />
    </div>

    <!-- WeChat preview -->
    <div v-if="entry && activePlatform === 'wechat'" class="preview-panel preview-panel--wechat">
      <div class="wechat-frame">
        <div class="wechat-frame-header">
          <div class="wechat-frame-notch" />
        </div>
        <div class="wechat-article" v-html="wechatHtml" />
      </div>
    </div>

    <!-- Xiaohongshu preview -->
    <div v-if="entry && activePlatform === 'xiaohongshu'" class="preview-panel preview-panel--xhs">
      <div class="xhs-frame">
        <div class="xhs-card-preview" v-html="xhsHtml" />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.preview-view {
  max-width: 800px;
  margin: 0 auto;
}

/* Header */
.preview-header {
  margin-bottom: var(--space-5);
}

.preview-title-bar {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-3);
  margin-bottom: var(--space-2);
}

.preview-title {
  font-size: var(--text-h1);
  font-weight: 700;
  line-height: 1.3;
  color: var(--text);
}

.preview-status {
  font-size: 12px;
  padding: 2px 10px;
  border-radius: var(--radius-sm);
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

.preview-meta {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  display: flex;
  gap: var(--space-2);
  margin-bottom: var(--space-2);
}

.preview-tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.preview-tag {
  font-size: 12px;
  color: var(--text-secondary);
  background: var(--surface);
  border: 1px solid var(--border);
  padding: 2px 10px;
  border-radius: var(--radius-sm);
}

.preview-error {
  text-align: center;
  padding: var(--space-7) var(--space-5);
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);

  h2 {
    color: var(--error);
    margin-bottom: var(--space-2);
  }

  p {
    color: var(--text-secondary);
  }
}

/* Platform tabs */
.platform-tabs {
  display: flex;
  gap: 4px;
  margin-bottom: var(--space-5);
  padding-bottom: var(--space-3);
  border-bottom: 1px solid var(--border);
}

.platform-tab {
  padding: 8px 16px;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-secondary);
  border-bottom: 2px solid transparent;
  transition: all 0.15s ease;
  display: flex;
  align-items: center;
  gap: 6px;

  &:hover:not(.platform-tab--disabled) {
    color: var(--text);
    background: var(--bg);
    border-radius: var(--radius-sm) var(--radius-sm) 0 0;
  }

  &--active {
    color: var(--primary);
    border-bottom-color: var(--primary);
  }

  &--disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
}

.tab-label-disabled {
  font-size: 13px;
}

/* Preview panels */
.preview-panel {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: var(--space-5);
  box-shadow: var(--shadow-sm);
  min-height: 200px;
}

/* Blog preview */
.preview-panel--blog {
  :deep(h1) {
    font-size: 1.5rem;
    font-weight: 700;
    margin-bottom: var(--space-4);
    padding-bottom: var(--space-2);
    border-bottom: 1px solid var(--border);
  }

  :deep(h2) {
    font-size: 1.25rem;
    font-weight: 600;
    margin-top: var(--space-5);
    margin-bottom: var(--space-3);
  }

  :deep(h3) {
    font-size: 1.1rem;
    font-weight: 600;
    margin-top: var(--space-4);
    margin-bottom: var(--space-2);
  }

  :deep(p) {
    margin-bottom: var(--space-3);
    line-height: 1.7;
  }

  :deep(ul), :deep(ol) {
    margin-bottom: var(--space-3);
    padding-left: var(--space-5);
  }

  :deep(li) {
    margin-bottom: 4px;
    line-height: 1.6;
  }

  :deep(code) {
    background: var(--bg);
    padding: 2px 6px;
    border-radius: 4px;
    font-family: var(--font-mono);
    font-size: 0.85em;
  }

  :deep(pre) {
    background: var(--bg);
    padding: var(--space-4);
    border-radius: var(--radius-sm);
    overflow-x: auto;
    margin-bottom: var(--space-3);

    code {
      background: none;
      padding: 0;
    }
  }

  :deep(table) {
    border-collapse: collapse;
    width: 100%;
    margin-bottom: var(--space-3);

    th, td {
      border: 1px solid var(--border);
      padding: 8px 12px;
      text-align: left;
    }

    th {
      background: var(--bg);
      font-weight: 600;
    }
  }

  :deep(blockquote) {
    border-left: 3px solid var(--primary);
    padding-left: var(--space-4);
    margin: var(--space-3) 0;
    color: var(--text-secondary);
  }

  :deep(hr) {
    border: none;
    border-top: 1px solid var(--border);
    margin: var(--space-5) 0;
  }

  :deep(strong) {
    font-weight: 600;
  }

  :deep(em) {
    font-style: italic;
  }
}

/* WeChat preview */
.preview-panel--wechat {
  padding: 0;
  overflow: hidden;
}

.wechat-frame {
  background: #ededed;
  max-width: 420px;
  margin: 0 auto;
  border-radius: var(--radius-md);
  overflow: hidden;
}

.wechat-frame-header {
  background: #ededed;
  padding: 8px 12px;
  display: flex;
  justify-content: center;
}

.wechat-frame-notch {
  width: 40px;
  height: 4px;
  background: #ccc;
  border-radius: 2px;
}

.wechat-article {
  background: #fff;
  padding: 20px 16px 32px;
}

.preview-panel--wechat :deep(.wechat-title) {
  font-size: 22px;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 8px;
  line-height: 1.4;
}

.preview-panel--wechat :deep(.wechat-meta) {
  font-size: 14px;
  color: #888;
  margin-bottom: 12px;
}

.preview-panel--wechat :deep(.wechat-author) {
  color: #576b95;
  font-weight: 500;
}

.preview-panel--wechat :deep(.wechat-divider) {
  border: none;
  border-top: 1px solid #e5e5e5;
  margin: 16px 0;
}

.preview-panel--wechat :deep(.wechat-body) {
  font-size: 16px;
  line-height: 1.8;
  color: #333;

  h1 {
    font-size: 20px;
    font-weight: 700;
    margin: 24px 0 12px;
    padding-left: 12px;
    border-left: 3px solid #576b95;
  }

  h2 {
    font-size: 18px;
    font-weight: 600;
    margin: 20px 0 10px;
  }

  h3 {
    font-size: 16px;
    font-weight: 600;
    margin: 16px 0 8px;
  }

  p {
    margin-bottom: 12px;
  }

  ul, ol {
    margin-bottom: 12px;
    padding-left: 20px;
  }

  li {
    margin-bottom: 4px;
  }

  strong {
    font-weight: 600;
    color: #1a1a1a;
  }

  code {
    background: #f5f5f5;
    padding: 2px 4px;
    border-radius: 3px;
    font-size: 0.9em;
  }

  pre {
    background: #f5f5f5;
    padding: 12px;
    border-radius: 4px;
    overflow-x: auto;
    margin-bottom: 12px;

    code {
      background: none;
      padding: 0;
    }
  }

  blockquote {
    border-left: 3px solid #576b95;
    padding-left: 12px;
    margin: 12px 0;
    color: #666;
  }
}

/* Xiaohongshu preview */
.preview-panel--xhs {
  background: var(--bg);
  border: none;
  display: flex;
  justify-content: center;
  padding: var(--space-5);
}

.xhs-frame {
  width: 100%;
  max-width: 360px;
}

.xhs-card-preview {
  aspect-ratio: 3 / 4;
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 50%, #f0932b 100%);
  border-radius: var(--radius-lg);
  padding: var(--space-5);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-shadow: var(--shadow-lg);
  color: #fff;
  overflow: hidden;

  :deep(.xhs-title) {
    font-size: 20px;
    font-weight: 700;
    line-height: 1.4;
    margin-bottom: var(--space-3);
    text-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  }

  :deep(.xhs-body) {
    flex: 1;
    font-size: 14px;
    line-height: 1.6;
    overflow: hidden;
    opacity: 0.95;

    h1, h2, h3 {
      font-weight: 600;
      margin-bottom: 6px;
    }

    h1 { font-size: 16px; }
    h2 { font-size: 15px; }
    h3 { font-size: 14px; }

    p {
      margin-bottom: 6px;
    }

    ul, ol {
      padding-left: 16px;
      margin-bottom: 6px;
    }

    code {
      background: rgba(255, 255, 255, 0.2);
      padding: 1px 4px;
      border-radius: 3px;
      font-size: 0.85em;
    }

    pre {
      background: rgba(255, 255, 255, 0.15);
      padding: 8px;
      border-radius: 4px;
      overflow-x: auto;
      margin-bottom: 6px;

      code {
        background: none;
        padding: 0;
      }
    }

    strong {
      font-weight: 600;
    }
  }

  :deep(.xhs-tags) {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    margin-top: var(--space-3);
  }

  :deep(.xhs-tag) {
    font-size: 12px;
    background: rgba(255, 255, 255, 0.25);
    padding: 2px 8px;
    border-radius: var(--radius-sm);
    backdrop-filter: blur(4px);
  }
}

/* Responsive */
@media (max-width: 640px) {
  .preview-view {
    padding: 0 var(--space-3);
  }

  .platform-tabs {
    overflow-x: auto;
  }

  .preview-panel {
    padding: var(--space-4);
  }

  .wechat-frame {
    max-width: 100%;
  }
}
</style>
