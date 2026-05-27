import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises, RouterLinkStub } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import PreviewView from '../PreviewView.vue'
import { contentStore, useContentStore } from '@/stores/content'
import { renderMarkdown, stripFrontmatter } from '@/utils/preview'

function createRouterWithInitialPath(path: string) {
  const router = createRouter({
    history: createMemoryHistory('/workspace/'),
    routes: [
      { path: '/', component: { template: '<div>home</div>' }, name: 'home' },
      { path: '/list', component: { template: '<div>list</div>' }, name: 'list' },
      { path: '/preview/:id', component: PreviewView, name: 'preview' },
    ],
  })
  router.push(path)
  return router
}

describe('PreviewView', () => {
  beforeEach(() => {
    const store = useContentStore()
    store.platformFilter.value = 'all'
    store.statusFilter.value = 'all'
  })

  it('loads content and shows blog preview', async () => {
    const router = createRouterWithInitialPath('/preview/1')
    await router.isReady()

    const wrapper = mount(PreviewView, {
      global: {
        plugins: [router],
        stubs: { RouterLink: RouterLinkStub },
      },
    })

    await flushPromises()

    expect(wrapper.find('.preview-title').text()).toBe('Getting Started with Vue 3 Composition API')
    expect(wrapper.find('.preview-status--published').text()).toBe('Published')
    expect(wrapper.find('.preview-meta').text()).toContain('2026-05-20')
    expect(wrapper.find('.preview-panel--blog').exists()).toBe(true)
    // Blog preview should contain rendered markdown
    expect(wrapper.find('.blog-content').html()).toContain('Vue 3 Composition API')
  })

  it('switching platforms changes the preview content', async () => {
    // Entry 5 targets all three platforms: blog, wechat, xiaohongshu
    const router = createRouterWithInitialPath('/preview/5')
    await router.isReady()

    const wrapper = mount(PreviewView, {
      global: {
        plugins: [router],
        stubs: { RouterLink: RouterLinkStub },
      },
    })

    await flushPromises()

    // Should start on blog (first target)
    expect(wrapper.find('.preview-panel--blog').exists()).toBe(true)
    expect(wrapper.find('.preview-panel--wechat').exists()).toBe(false)
    expect(wrapper.find('.preview-panel--xhs').exists()).toBe(false)

    // Click WeChat tab
    const tabs = wrapper.findAll('.platform-tab')
    const wechatTab = tabs.find((t) => t.text().includes('WeChat'))
    expect(wechatTab).toBeDefined()
    await wechatTab!.trigger('click')
    await wrapper.vm.$nextTick()
    await flushPromises()

    expect(wrapper.find('.preview-panel--blog').exists()).toBe(false)
    expect(wrapper.find('.preview-panel--wechat').exists()).toBe(true)
    expect(wrapper.find('.preview-panel--xhs').exists()).toBe(false)

    // Verify WeChat content is rendered
    expect(wrapper.find('.wechat-article').exists()).toBe(true)
    expect(wrapper.find('.wechat-article').html()).toContain('TypeScript')

    // Click Xiaohongshu tab
    const xhsTab = tabs.find((t) => t.text().includes('Xiaohongshu'))
    expect(xhsTab).toBeDefined()
    await xhsTab!.trigger('click')
    await wrapper.vm.$nextTick()
    await flushPromises()

    expect(wrapper.find('.preview-panel--blog').exists()).toBe(false)
    expect(wrapper.find('.preview-panel--wechat').exists()).toBe(false)
    expect(wrapper.find('.preview-panel--xhs').exists()).toBe(true)

    // Verify XHS card is rendered
    expect(wrapper.find('.xhs-card-preview').exists()).toBe(true)
  })

  it('shows error when content not found', async () => {
    const router = createRouterWithInitialPath('/preview/999')
    await router.isReady()

    const wrapper = mount(PreviewView, {
      global: {
        plugins: [router],
        stubs: { RouterLink: RouterLinkStub },
      },
    })

    await flushPromises()

    expect(wrapper.find('.preview-error').exists()).toBe(true)
    expect(wrapper.find('.preview-error').text()).toContain('Content not found')
    expect(wrapper.find('.preview-error').text()).toContain('999')
    // No preview panels should be shown
    expect(wrapper.find('.preview-panel').exists()).toBe(false)
    expect(wrapper.find('.platform-tabs').exists()).toBe(false)
  })

  it('disables tabs for platforms the entry does not target', async () => {
    // Entry 1 only targets blog
    const router = createRouterWithInitialPath('/preview/1')
    await router.isReady()

    const wrapper = mount(PreviewView, {
      global: {
        plugins: [router],
        stubs: { RouterLink: RouterLinkStub },
      },
    })

    await flushPromises()

    const tabs = wrapper.findAll('.platform-tab')
    expect(tabs.length).toBe(3)

    // Blog tab should be enabled and active
    expect(tabs[0].classes()).toContain('platform-tab--active')
    expect(tabs[0].classes()).not.toContain('platform-tab--disabled')

    // WeChat tab should be disabled
    expect(tabs[1].classes()).toContain('platform-tab--disabled')

    // Xiaohongshu tab should be disabled
    expect(tabs[2].classes()).toContain('platform-tab--disabled')
  })
})

describe('preview utilities', () => {
  describe('stripFrontmatter', () => {
    it('removes YAML frontmatter block', () => {
      const input = `---
title: Hello World
tags: [test]
status: draft
---

This is the body content.`
      const result = stripFrontmatter(input)
      expect(result).toBe('This is the body content.')
    })

    it('returns empty string for frontmatter-only content', () => {
      const input = `---
title: No Body
---
`
      const result = stripFrontmatter(input)
      expect(result).toBe('')
    })

    it('returns unchanged string when no frontmatter', () => {
      const input = 'Just plain text, no frontmatter.'
      const result = stripFrontmatter(input)
      expect(result).toBe('Just plain text, no frontmatter.')
    })

    it('handles frontmatter with extra whitespace', () => {
      const input = `---
key: value
---

Body here`
      const result = stripFrontmatter(input)
      expect(result).toBe('Body here')
    })
  })

  describe('renderMarkdown', () => {
    it('renders headings', () => {
      const result = renderMarkdown('# Hello\n\n## World')
      expect(result).toContain('<h1>Hello</h1>')
      expect(result).toContain('<h2>World</h2>')
    })

    it('renders bold and italic', () => {
      const result = renderMarkdown('**bold** and *italic*')
      expect(result).toContain('<strong>bold</strong>')
      expect(result).toContain('<em>italic</em>')
    })

    it('renders code blocks', () => {
      const result = renderMarkdown('`inline code`')
      expect(result).toContain('<code>inline code</code>')
    })

    it('renders lists', () => {
      const result = renderMarkdown('- item 1\n- item 2')
      expect(result).toContain('<li>item 1</li>')
      expect(result).toContain('<li>item 2</li>')
    })

    it('renders links', () => {
      const result = renderMarkdown('[link](https://example.com)')
      expect(result).toContain('<a href="https://example.com">link</a>')
    })

    it('renders paragraphs', () => {
      const result = renderMarkdown('First para\n\nSecond para')
      expect(result).toContain('<p>First para</p>')
      expect(result).toContain('<p>Second para</p>')
    })
  })
})
