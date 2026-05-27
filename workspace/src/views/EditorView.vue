<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import MarkdownIt from 'markdown-it'
import EditorToolbar from '@/components/EditorToolbar.vue'
import MonacoEditor from '@/components/MonacoEditor.vue'
import { useContentStore } from '@/stores/content'

const route = useRoute()
const router = useRouter()
const store = useContentStore()
const md = new MarkdownIt({ html: true, linkify: true, typographer: true })

const postId = ref<string | undefined>(undefined)
const title = ref('')
const tags = ref<string[]>([])
const targets = ref<('blog' | 'wechat' | 'xiaohongshu')[]>(['blog'])
const status = ref<'draft' | 'published'>('draft')
const bodyContent = ref('')
const showPreview = ref(false)
const saveMessage = ref('')

const isNew = computed(() => postId.value === 'new')

const fullContent = computed({
  get() {
    const frontmatter = [
      '---',
      `title: ${title.value}`,
      `tags: [${tags.value.join(', ')}]`,
      `targets: [${targets.value.join(', ')}]`,
      `status: ${status.value}`,
      '---',
      '',
      bodyContent.value,
    ].join('\n')
    return frontmatter
  },
  set(value: string) {
    const parsed = parseContent(value)
    title.value = parsed.title
    tags.value = parsed.tags
    targets.value = parsed.targets
    status.value = parsed.status
    bodyContent.value = parsed.body
  },
})

const previewHtml = computed(() => {
  return md.render(bodyContent.value)
})

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

function handlePreview() {
  showPreview.value = !showPreview.value
}

function handleTagInput(event: Event) {
  const input = event.target as HTMLInputElement
  const raw = input.value
  tags.value = raw.split(',').map((t) => t.trim()).filter(Boolean)
}

function handleTitleInput(event: Event) {
  title.value = (event.target as HTMLInputElement).value
}

// Watch for route changes (navigation while component is mounted)
watch(() => route.path, () => {
  loadEntry()
})

// Load content on mount (after router is ready, the path will be set)
onMounted(() => {
  loadEntry()
})
</script>

<template>
  <div class="editor-view">
    <!-- Header with title and toolbar -->
    <div class="editor-header">
      <div class="editor-title-bar">
        <button class="btn-back" @click="router.push('/list')">&larr; Back</button>
        <h1 class="editor-title">{{ isNew ? 'New Post' : 'Edit Post' }}</h1>
        <span v-if="saveMessage" class="save-message">{{ saveMessage }}</span>
      </div>
      <EditorToolbar
        :status="status"
        :selected-platforms="targets"
        @save="handleSave"
        @preview="handlePreview"
        @update:status="status = $event"
        @update:platforms="targets = $event"
      />
    </div>

    <!-- Frontmatter editor -->
    <div class="frontmatter-editor">
      <div class="frontmatter-field">
        <label for="post-title">Title</label>
        <input
          id="post-title"
          type="text"
          class="frontmatter-input"
          :value="title"
          placeholder="Enter post title..."
          @input="handleTitleInput"
        />
      </div>
      <div class="frontmatter-field">
        <label for="post-tags">Tags (comma-separated)</label>
        <input
          id="post-tags"
          type="text"
          class="frontmatter-input"
          :value="tags.join(', ')"
          placeholder="e.g. Vue, TypeScript, Tutorial"
          @input="handleTagInput"
        />
      </div>
      <div class="frontmatter-field">
        <label>Target Platforms</label>
        <div class="platform-checkboxes">
          <label class="platform-check">
            <input
              type="checkbox"
              :checked="targets.includes('blog')"
              @change="targets.includes('blog') ? targets = targets.filter(t => t !== 'blog') : targets = [...targets, 'blog']"
            />
            Blog
          </label>
          <label class="platform-check">
            <input
              type="checkbox"
              :checked="targets.includes('wechat')"
              @change="targets.includes('wechat') ? targets = targets.filter(t => t !== 'wechat') : targets = [...targets, 'wechat']"
            />
            WeChat
          </label>
          <label class="platform-check">
            <input
              type="checkbox"
              :checked="targets.includes('xiaohongshu')"
              @change="targets.includes('xiaohongshu') ? targets = targets.filter(t => t !== 'xiaohongshu') : targets = [...targets, 'xiaohongshu']"
            />
            Xiaohongshu
          </label>
        </div>
      </div>
    </div>

    <!-- Editor panels -->
    <div class="editor-panels" :class="{ 'editor-panels--preview': showPreview }">
      <div class="editor-panel editor-panel--editor">
        <MonacoEditor
          v-model="fullContent"
          language="markdown"
          height="500px"
        />
      </div>
      <div v-if="showPreview" class="editor-panel editor-panel--preview">
        <div class="preview-container">
          <h2 class="preview-title">{{ title || 'Untitled' }}</h2>
          <div class="preview-content" v-html="previewHtml" />
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
  max-width: 100%;
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
  padding: 16px;
  border-bottom: 1px solid var(--border, #e2e8f0);
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: var(--bg, #f8fafc);
}

.frontmatter-field {
  display: flex;
  flex-direction: column;
  gap: 4px;

  label {
    font-size: 13px;
    font-weight: 500;
    color: var(--text-secondary, #64748b);
  }
}

.frontmatter-input {
  padding: 8px 12px;
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

.platform-checkboxes {
  display: flex;
  gap: 16px;
}

.platform-check {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: var(--text, #1e293b);
  cursor: pointer;

  input[type='checkbox'] {
    accent-color: var(--primary, #6366f1);
    width: 16px;
    height: 16px;
  }
}

.editor-panels {
  display: flex;
  gap: 0;
  flex: 1;
  min-height: 400px;

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

.preview-container {
  padding: 24px;
  overflow-y: auto;
  height: 100%;

  .preview-title {
    font-size: 1.75rem;
    font-weight: 700;
    margin: 0 0 16px;
    color: var(--text, #1e293b);
  }

  .preview-content {
    font-size: 15px;
    line-height: 1.7;
    color: var(--text, #1e293b);

    :deep(h1), :deep(h2), :deep(h3) {
      margin-top: 24px;
      margin-bottom: 12px;
      font-weight: 600;
    }

    :deep(h1) { font-size: 1.5rem; }
    :deep(h2) { font-size: 1.25rem; }
    :deep(h3) { font-size: 1.1rem; }

    :deep(p) {
      margin-bottom: 12px;
    }

    :deep(code) {
      background: var(--bg, #f1f5f9);
      padding: 2px 6px;
      border-radius: 4px;
      font-family: 'Consolas', 'Monaco', monospace;
      font-size: 0.9em;
    }

    :deep(pre) {
      background: var(--bg, #f1f5f9);
      padding: 16px;
      border-radius: 6px;
      overflow-x: auto;

      code {
        background: none;
        padding: 0;
      }
    }

    :deep(ul), :deep(ol) {
      margin-bottom: 12px;
      padding-left: 24px;
    }

    :deep(blockquote) {
      border-left: 3px solid var(--primary, #6366f1);
      padding-left: 16px;
      margin: 12px 0;
      color: var(--text-secondary, #64748b);
    }
  }
}

/* Responsive: stacked on mobile */
@media (max-width: 768px) {
  .editor-panels {
    flex-direction: column;

    &--preview {
      .editor-panel {
        width: 100%;
      }
    }
  }

  .editor-panel--preview {
    border-left: none;
    border-top: 1px solid var(--border, #e2e8f0);
  }

  .frontmatter-editor {
    padding: 12px;
  }

  .platform-checkboxes {
    flex-direction: column;
    gap: 8px;
  }
}
</style>
