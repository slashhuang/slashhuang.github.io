import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises, RouterLinkStub } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import EditorView from '../EditorView.vue'
import EditorToolbar from '@/components/EditorToolbar.vue'
import MonacoEditor from '@/components/MonacoEditor.vue'
import { contentStore, useContentStore } from '@/stores/content'

// Mock monaco-editor in test environment (happy-dom can't render it)
vi.mock('monaco-editor', () => ({
  editor: {
    create: vi.fn(() => ({
      getValue: vi.fn(() => ''),
      setValue: vi.fn(),
      onDidChangeModelContent: vi.fn(),
      dispose: vi.fn(),
    })),
    EditorWorker: vi.fn(),
  },
}))

function createRouterWithInitialPath(path: string) {
  const router = createRouter({
    history: createMemoryHistory('/workspace/'),
    routes: [
      { path: '/', component: { template: '<div>home</div>' }, name: 'home' },
      { path: '/list', component: { template: '<div>list</div>' }, name: 'list' },
      { path: '/editor/:id?', component: EditorView, name: 'editor' },
    ],
  })
  // Navigate to the initial path BEFORE mounting
  router.push(path)
  return router
}

describe('EditorView', () => {
  beforeEach(() => {
    const store = useContentStore()
    store.platformFilter.value = 'all'
    store.statusFilter.value = 'all'
  })

  it('creates new post when route has "new" id', async () => {
    const router = createRouterWithInitialPath('/editor/new')
    // Wait for router to be ready before mounting
    await router.isReady()

    const wrapper = mount(EditorView, {
      global: {
        plugins: [router],
        stubs: { RouterLink: RouterLinkStub },
      },
    })

    await flushPromises()

    expect(wrapper.find('.editor-title').text()).toBe('New Post')

    // Title input should be empty for new posts
    const titleInput = wrapper.find('#post-title')
    expect(titleInput.exists()).toBe(true)
    expect((titleInput.element as HTMLInputElement).value).toBe('')
  })

  it('loads existing content when route has id', async () => {
    const router = createRouterWithInitialPath('/editor/1')
    await router.isReady()

    const wrapper = mount(EditorView, {
      global: {
        plugins: [router],
        stubs: { RouterLink: RouterLinkStub },
      },
    })

    await flushPromises()

    expect(wrapper.find('.editor-title').text()).toBe('Edit Post')

    // Title should be populated from the store
    const titleInput = wrapper.find('#post-title')
    expect(titleInput.exists()).toBe(true)
    expect((titleInput.element as HTMLInputElement).value).toBe(
      'Getting Started with Vue 3 Composition API',
    )

    // Tags should be populated
    const tagsInput = wrapper.find('#post-tags')
    expect(tagsInput.exists()).toBe(true)
    expect((tagsInput.element as HTMLInputElement).value).toBe('Vue, Frontend')
  })

  it('save button updates the content store for new post', async () => {
    const router = createRouterWithInitialPath('/editor/new')
    await router.isReady()

    const initialCount = contentStore.entries.length

    const wrapper = mount(EditorView, {
      global: {
        plugins: [router],
        stubs: { RouterLink: RouterLinkStub },
      },
    })

    await flushPromises()

    // Set the title via the input
    const titleInput = wrapper.find('#post-title')
    await titleInput.setValue('My New Post')
    await wrapper.vm.$nextTick()

    // Click save via toolbar
    const toolbar = wrapper.findComponent(EditorToolbar)
    toolbar.vm.$emit('save')
    await wrapper.vm.$nextTick()
    await flushPromises()

    // Should have created a new entry
    expect(contentStore.entries.length).toBe(initialCount + 1)
    const newEntry = contentStore.entries[0]
    expect(newEntry.title).toBe('My New Post')
  })

  it('save button updates existing entry in content store', async () => {
    const router = createRouterWithInitialPath('/editor/1')
    await router.isReady()

    const wrapper = mount(EditorView, {
      global: {
        plugins: [router],
        stubs: { RouterLink: RouterLinkStub },
      },
    })

    await flushPromises()

    // Modify the title
    const titleInput = wrapper.find('#post-title')
    await titleInput.setValue('Updated Title')
    await wrapper.vm.$nextTick()

    // Click save
    const toolbar = wrapper.findComponent(EditorToolbar)
    toolbar.vm.$emit('save')
    await wrapper.vm.$nextTick()

    // Entry should be updated
    const entry = contentStore.entries.find((e) => e.id === '1')
    expect(entry).toBeDefined()
    expect(entry!.title).toBe('Updated Title')
  })

  it('frontmatter fields are editable', async () => {
    const router = createRouterWithInitialPath('/editor/new')
    await router.isReady()

    const wrapper = mount(EditorView, {
      global: {
        plugins: [router],
        stubs: { RouterLink: RouterLinkStub },
      },
    })

    await flushPromises()

    // Edit title
    const titleInput = wrapper.find('#post-title')
    await titleInput.setValue('Edited Title')
    expect((titleInput.element as HTMLInputElement).value).toBe('Edited Title')

    // Edit tags
    const tagsInput = wrapper.find('#post-tags')
    await tagsInput.setValue('AI, ML, Python')
    expect((tagsInput.element as HTMLInputElement).value).toBe('AI, ML, Python')

    // Toggle platform checkboxes
    const checkboxes = wrapper.findAll('.platform-check input[type="checkbox"]')
    expect(checkboxes.length).toBe(3)

    // Blog should be checked by default
    expect((checkboxes[0].element as HTMLInputElement).checked).toBe(true)

    // WeChat should not be checked by default
    expect((checkboxes[1].element as HTMLInputElement).checked).toBe(false)

    // Toggle WeChat
    await checkboxes[1].trigger('change')
    await wrapper.vm.$nextTick()

    // Verify the toolbar received the platform update
    const toolbar = wrapper.findComponent(EditorToolbar)
    expect(toolbar.props('selectedPlatforms')).toContain('wechat')
  })

  it('MonacoEditor component is rendered', async () => {
    const router = createRouterWithInitialPath('/editor/new')
    await router.isReady()

    const wrapper = mount(EditorView, {
      global: {
        plugins: [router],
        stubs: { RouterLink: RouterLinkStub },
      },
    })

    await flushPromises()

    const monacoEditor = wrapper.findComponent(MonacoEditor)
    expect(monacoEditor.exists()).toBe(true)
    expect(monacoEditor.props('language')).toBe('markdown')
  })

  it('preview toggle shows preview panel', async () => {
    const router = createRouterWithInitialPath('/editor/new')
    await router.isReady()

    const wrapper = mount(EditorView, {
      global: {
        plugins: [router],
        stubs: { RouterLink: RouterLinkStub },
      },
    })

    await flushPromises()

    // Preview panel should not be visible initially
    let previewPanel = wrapper.find('.editor-panel--preview')
    expect(previewPanel.exists()).toBe(false)

    // Click preview button
    const toolbar = wrapper.findComponent(EditorToolbar)
    toolbar.vm.$emit('preview')
    await wrapper.vm.$nextTick()

    // Preview panel should now be visible
    previewPanel = wrapper.find('.editor-panel--preview')
    expect(previewPanel.exists()).toBe(true)

    // Editor panels should have the preview class
    const panels = wrapper.find('.editor-panels')
    expect(panels.classes()).toContain('editor-panels--preview')
  })
})
