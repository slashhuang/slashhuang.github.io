<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import EditorToolbar from '@/components/EditorToolbar.vue'
import MonacoEditor from '@/components/MonacoEditor.vue'
import PlatformBadge from '@/components/PlatformBadge.vue'
import { useContentStore } from '@/stores/content'
import { renderMarkdown, generateWeChatHtml, generateXiaohongshuCard } from '@/utils/preview'

type Platform = 'blog' | 'wechat' | 'xiaohongshu'

const route = useRoute()
const router = useRouter()
const store = useContentStore()

const postId = ref<string | undefined>(undefined)
const title = ref('')
const tags = ref<string[]>([])
const targets = ref<('blog' | 'wechat' | 'xiaohongshu')[]>(['blog'])
const status = ref<'draft' | 'published'>('draft')
const bodyContent = ref('')
const showPreview = ref(true)
const activePlatform = ref<Platform>('blog')
const saveMessage = ref('')

const isNew = computed(() => postId.value === 'new')

const frontmatter = computed(() => {
  const lines = [
    '---',
    `title: "${title.value}"`,
    `date: ${new Date().toISOString().split('T')[0]}`,
    `tags: [${tags.value.join(', ')}]`,
    `targets: [${targets.value.join(', ')}]`,
    `status: ${status.value}`,
    '---',
  ].join('\n')
  return lines
})

const fullContent = computed(() => `${frontmatter.value}\n\n${bodyContent.value}`)

const platformTabs: { key: Platform; label: string }[] = [
  { key: 'blog', label: 'Blog' },
  { key: 'wechat', label: 'WeChat' },
  { key: 'xiaohongshu', label: 'Xiaohongshu' },
]

const blogHtml = computed(() => md.render(bodyContent.value || '*No content yet*'))
const wechatHtml = computed(() =>
  generateWeChatHtml(title.value || 'Untitled', bodyContent.value || '*No content yet*', 'slashhuang')
)
const xhsHtml = computed(() =>
  generateXiaohongshuCard(title.value || 'Untitled', bodyContent.value || '*No content yet*', tags.value)
)

const currentHtml = computed(() => {
  switch (activePlatform.value) {
    case 'blog': return blogHtml.value
    case 'wechat': return wechatHtml.value
    case 'xiaohongshu': return xhsHtml.value
  }
})

// We need a separate markdown-it instance for the blog preview
import MarkdownIt from 'markdown-it'
const md = new MarkdownIt({ html: true, linkify: true, typographer: true })

function parseContent(raw: string): {
  title: string
  tags: string[]
  targets: ('blog' | 'wechat' | 'xiaohongshu')[]
  status: 'draft' | 'published'
  body: string
} {
  const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/
  const match = raw.match(frontmatterRegex)

  if (!match) {
    return { title: raw.slice(0, 50), tags: [], targets: ['blog'], status: 'draft', body: raw }
  }

  const [, frontmatterStr, body] = match
  const parsed: Record<string, string> = {}

  for (const line of frontmatterStr.split('\n')) {
    const colonIdx = line.indexOf(':')
    if (colonIdx > 0) {
      const key = line.slice(0, colonIdx).trim()
      const val = line.slice(colonIdx + 1).trim()
      parsed[key] = val
    }
  }

  const parseArray = (str: string): string[] => {
    const m = str.match(/\[([^\]]*)\]/)
    if (!m) return []
    return m[1].split(',').map((s) => s.trim()).filter(Boolean)
  }

  return {
    title: parsed.title || 'Untitled',
    tags: parseArray(parsed.tags || '[]'),
    targets: (parseArray(parsed.targets || '[blog]') as ('blog' | 'wechat' | 'xiaohongshu')[]),
    status: (parsed.status === 'published' ? 'published' : 'draft') as 'draft' | 'published',
    body: body || '',
  }
}

function loadEntry() {
  const id = route.params.id as string | undefined
  postId.value = id

  if (!id || id === 'new') {
    title.value = ''
    tags.value = []
    targets.value = ['blog']
    status.value = 'draft'
    bodyContent.value = ''
    return
  }

  const entry = store.findById(id)
  if (entry) {
    title.value = entry.title
    tags.value = [...entry.tags]
    targets.value = [...entry.targets]
    status.value = entry.status
    bodyContent.value = ''
  }
}

function handleSave() {
  if (isNew.value) {
    const entry = store.createEntry({
      title: title.value || 'Untitled',
      tags: [...tags.value],
      targets: [...targets.value],
      status: status.value,
    })
    postId.value = entry.id
    router.replace({ name: 'editor', params: { id: entry.id } })
  } else if (postId.value) {
    const existing = store.findById(postId.value)
    if (existing) {
      store.saveEntry({
        ...existing,
        title: title.value,
        tags: [...tags.value],
        targets: [...targets.value],
        status: status.value,
      })
    }
  }
  saveMessage.value = 'Saved!'
  setTimeout(() => { saveMessage.value = '' }, 2000)
}

function handleTagInput(event: Event) {
  const input = event.target as HTMLInputElement
  const raw = input.value
  tags.value = raw.split(',').map((t) => t.trim()).filter(Boolean)
}

function handleTitleInput(event: Event) {
  title.value = (event.target as HTMLInputElement).value
}

// Watch for route changes
watch(() => route.path, () => {
  loadEntry()
})

// When targets change, switch to first available platform
watch(targets, (newTargets) => {
  if (!newTargets.includes(activePlatform.value) && newTargets.length > 0) {
    activePlatform.value = newTargets[0]
  }
})

onMounted(() => {
  loadEntry()
})
</script>

<template>
  <div class="editor-view">
    <!-- Header -->
    <div class="editor-header">
      <div class="editor-title-bar">
        <button class="btn-back" @click="router.push('/list')">&larr; 返回列表</button>
        <h1 class="editor-title">{{ isNew ? 'New Post' : 'Edit Post' }}</h1>
        <span v-if="saveMessage" class="save-message">{{ saveMessage }}</span>
      </div>
      <EditorToolbar
        :status="status"
        :selected-platforms="targets"
        @save="handleSave"
        @update:status="status = $event"
        @update:platforms="targets = $event"
      />
    </div>

    <!-- Frontmatter editor -->
    <div class="frontmatter-editor">
      <div class="frontmatter-field">
        <label for="post-title">标题</label>
        <input
          id="post-title"
          type="text"
          class="frontmatter-input"
          :value="title"
          placeholder="输入文章标题..."
          @input="handleTitleInput"
        />
      </div>
      <div class="frontmatter-field">
        <label for="post-tags">标签（逗号分隔）</label>
        <input
          id="post-tags"
          type="text"
          class="frontmatter-input"
          :value="tags.join(', ')"
          placeholder="例如：Vue, TypeScript, 教程"
          @input="handleTagInput"
        />
      </div>
    </div>

    <!-- Editor panels -->
    <div class="editor-panels" :class="{ 'editor-panels--preview': showPreview }">
      <div class="editor-panel editor-panel--editor">
        <MonacoEditor
          v-model="fullContent"
          language="markdown"
          height="100%"
        />
      </div>
      <div v-if="showPreview" class="editor-panel editor-panel--preview">
        <div class="preview-wrapper">
          <!-- Platform tabs -->
          <div v-if="targets.length" class="preview-platform-tabs">
            <button
              v-for="tab in platformTabs.filter(t => targets.includes(t.key))"
              :key="tab.key"
              :class="['preview-platform-tab', { 'preview-platform-tab--active': activePlatform === tab.key }]"
              @click="activePlatform = tab.key"
            >
              <PlatformBadge :platform="tab.key" />
            </button>
          </div>

          <!-- Preview content -->
          <div class="preview-content" v-html="currentHtml" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.editor-view {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--surface, #fff);
}

.editor-header {
  border-bottom: 1px solid var(--border, #e2e8f0);
}

.editor-title-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;

  .btn-back {
    background: none;
    border: none;
    color: var(--primary, #6366f1);
    font-size: 14px;
    cursor: pointer;
    padding: 4px 8px;
    border-radius: 4px;
    font-family: var(--font-sans);

    &:hover {
      background: rgba(99, 102, 241, 0.08);
    }
  }

  .editor-title {
    font-size: var(--text-h1, 1.5rem);
    font-weight: 700;
    margin: 0;
    flex: 1;
  }

  .save-message {
    color: #22c55e;
    font-size: 13px;
    font-weight: 500;
  }
}

.frontmatter-editor {
  padding: 12px 16px;
  border-bottom: 1px solid var(--border, #e2e8f0);
  display: flex;
  flex-direction: row;
  gap: 16px;
  background: var(--bg, #f8fafc);

  .frontmatter-field {
    flex: 1;
    min-width: 0;

    label {
      font-size: 12px;
      font-weight: 500;
      color: var(--text-secondary, #64748b);
      margin-bottom: 4px;
      display: block;
    }
  }
}

.frontmatter-input {
  width: 100%;
  padding: 6px 10px;
  border: 1px solid var(--border, #e2e8f0);
  border-radius: 6px;
  font-size: 14px;
  font-family: var(--font-sans);
  background: var(--surface, #fff);
  color: var(--text, #1e293b);
  outline: none;
  transition: border-color 0.15s ease;

  &:focus {
    border-color: var(--primary, #6366f1);
  }
}

.editor-panels {
  display: flex;
  gap: 0;
  flex: 1;
  min-height: 0;

  &--preview {
    .editor-panel {
      width: 50%;
    }
  }
}

.editor-panel {
  flex: 1;
  min-width: 0;
  overflow: hidden;

  &--preview {
    border-left: 1px solid var(--border, #e2e8f0);
  }
}

/* Preview wrapper */
.preview-wrapper {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* Platform tabs in preview */
.preview-platform-tabs {
  display: flex;
  gap: 4px;
  padding: 8px 12px;
  border-bottom: 1px solid var(--border, #e2e8f0);
  background: var(--bg, #f8fafc);
}

.preview-platform-tab {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 12px;
  border: 1px solid var(--border, #e2e8f0);
  border-radius: 6px;
  background: var(--surface, #fff);
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  color: var(--text-secondary, #64748b);
  transition: all 0.15s ease;

  &:hover {
    border-color: var(--primary, #6366f1);
    color: var(--primary, #6366f1);
  }

  &--active {
    background: var(--primary, #6366f1);
    border-color: var(--primary, #6366f1);
    color: #fff;

    :deep(.platform-badge) {
      filter: brightness(0) invert(1);
    }
  }
}

/* Preview content */
.preview-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;

  /* Blog preview */
  :deep(h1) {
    font-size: 1.5rem;
    font-weight: 700;
    margin-bottom: 16px;
    padding-bottom: 8px;
    border-bottom: 1px solid var(--border, #e2e8f0);
  }

  :deep(h2) {
    font-size: 1.25rem;
    font-weight: 600;
    margin-top: 20px;
    margin-bottom: 12px;
  }

  :deep(h3) {
    font-size: 1.1rem;
    font-weight: 600;
    margin-top: 16px;
    margin-bottom: 8px;
  }

  :deep(p) {
    margin-bottom: 12px;
    line-height: 1.7;
  }

  :deep(ul), :deep(ol) {
    margin-bottom: 12px;
    padding-left: 20px;
  }

  :deep(li) {
    margin-bottom: 4px;
    line-height: 1.6;
  }

  :deep(code) {
    background: var(--bg, #f1f5f9);
    padding: 2px 6px;
    border-radius: 4px;
    font-family: var(--font-mono);
    font-size: 0.85em;
  }

  :deep(pre) {
    background: var(--bg, #f1f5f9);
    padding: 16px;
    border-radius: 8px;
    overflow-x: auto;
    margin-bottom: 12px;

    code {
      background: none;
      padding: 0;
    }
  }

  :deep(blockquote) {
    border-left: 3px solid var(--primary, #6366f1);
    padding-left: 16px;
    margin: 12px 0;
    color: var(--text-secondary, #64748b);
  }

  :deep(table) {
    border-collapse: collapse;
    width: 100%;
    margin-bottom: 12px;

    th, td {
      border: 1px solid var(--border, #e2e8f0);
      padding: 8px 12px;
      text-align: left;
    }

    th {
      background: var(--bg, #f1f5f9);
      font-weight: 600;
    }
  }

  /* WeChat preview */
  :deep(.wechat-article) {
    max-width: 400px;
    margin: 0 auto;
    background: #fff;
    padding: 16px;
    font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  }

  :deep(.wechat-title) {
    font-size: 22px;
    font-weight: 700;
    color: #1a1a1a;
    margin-bottom: 8px;
    line-height: 1.4;
  }

  :deep(.wechat-meta) {
    font-size: 14px;
    color: #888;
    margin-bottom: 12px;
  }

  :deep(.wechat-author) {
    color: #576b95;
    font-weight: 500;
  }

  :deep(.wechat-divider) {
    border: none;
    border-top: 1px solid #e5e5e5;
    margin: 16px 0;
  }

  :deep(.wechat-body section) {
    margin-bottom: 8px;
  }

  :deep(.wechat-end) {
    margin-top: 32px;
    padding-top: 12px;
    border-top: 1px dashed #ddd;
    text-align: center;
    font-size: 12px;
    color: #bbb;
  }

  /* Xiaohongshu preview */
  :deep(.xhs-card) {
    width: 100%;
    max-width: 360px;
    margin: 0 auto;
    border-radius: 16px;
    padding: 32px;
    box-sizing: border-box;
    min-height: 400px;
    font-family: -apple-system, BlinkMacSystemFont, 'Noto Sans SC', sans-serif;
    display: flex;
    flex-direction: column;
    box-shadow: 0 8px 32px rgba(0,0,0,0.12);
  }

  :deep(.xhs-header) {
    margin-bottom: 24px;
  }

  :deep(.xhs-title) {
    font-size: 20px;
    font-weight: 700;
    line-height: 1.4;
    margin-bottom: 8px;
  }

  :deep(.xhs-author) {
    font-size: 14px;
    opacity: 0.7;
  }

  :deep(.xhs-body) {
    flex: 1;
    font-size: 14px;
    line-height: 1.6;

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
  }

  :deep(.xhs-footer) {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    margin-top: 16px;
    padding-top: 12px;
  }

  :deep(.xhs-tag) {
    font-size: 12px;
    background: rgba(255, 255, 255, 0.25);
    padding: 2px 8px;
    border-radius: 12px;
    backdrop-filter: blur(4px);
  }
}
</style>
