import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import ListView from '../ListView.vue'
import ContentCard from '@/components/ContentCard.vue'
import { contentStore, useContentStore } from '@/stores/content'

function createRouterMock() {
  const router = createRouter({
    history: createWebHistory('/workspace/'),
    routes: [
      { path: '/', component: { template: '<div>home</div>' }, name: 'home' },
      { path: '/list', component: { template: '<div>list</div>' }, name: 'list' },
      { path: '/editor/:id?', component: { template: '<div>editor</div>' }, name: 'editor' },
    ],
  })
  return router
}

describe('ListView', () => {
  beforeEach(() => {
    const store = useContentStore()
    store.platformFilter.value = 'all'
    store.statusFilter.value = 'all'
  })

  it('renders a ContentCard for each mock entry', async () => {
    const router = createRouterMock()
    const wrapper = mount(ListView, {
      global: {
        plugins: [router],
      },
    })
    await router.isReady()

    const cards = wrapper.findAllComponents(ContentCard)
    expect(cards.length).toBe(contentStore.entries.length)
  })

  it('platform filter works correctly', async () => {
    const router = createRouterMock()
    const wrapper = mount(ListView, {
      global: {
        plugins: [router],
      },
    })
    await router.isReady()

    // Click the "Blog" filter chip
    const chips = wrapper.findAll('.filter-chip')
    const blogChip = chips.find((c) => c.text() === 'Blog')!
    await blogChip.trigger('click')
    await wrapper.vm.$nextTick()

    const cards = wrapper.findAllComponents(ContentCard)
    const blogEntries = contentStore.entries.filter((e) => e.targets.includes('blog'))
    expect(cards.length).toBe(blogEntries.length)

    // Each card should have blog in its targets
    cards.forEach((card) => {
      const platforms = card.props('platforms') as string[]
      expect(platforms).toContain('blog')
    })
  })

  it('status filter works correctly', async () => {
    const router = createRouterMock()
    const wrapper = mount(ListView, {
      global: {
        plugins: [router],
      },
    })
    await router.isReady()

    // Click the "Draft" status filter chip
    const chips = wrapper.findAll('.filter-chip')
    const draftChip = chips.find((c) => c.text() === 'Draft')!
    await draftChip.trigger('click')
    await wrapper.vm.$nextTick()

    const cards = wrapper.findAllComponents(ContentCard)
    const draftEntries = contentStore.entries.filter((e) => e.status === 'draft')
    expect(cards.length).toBe(draftEntries.length)

    cards.forEach((card) => {
      expect(card.props('status')).toBe('draft')
    })
  })

  it('"New Post" button navigates to editor', async () => {
    const router = createRouterMock()
    const pushSpy = vi.spyOn(router, 'push')

    const wrapper = mount(ListView, {
      global: {
        plugins: [router],
      },
    })
    await router.isReady()

    const btn = wrapper.find('.btn-new')
    expect(btn.exists()).toBe(true)
    expect(btn.text()).toContain('New Post')

    await btn.trigger('click')
    expect(pushSpy).toHaveBeenCalledWith('/editor/new')
  })

  it('empty state shows when no matches', async () => {
    const router = createRouterMock()

    // Temporarily clear entries to test empty state rendering
    const saved = [...contentStore.entries]
    contentStore.entries = []

    const wrapper = mount(ListView, {
      global: {
        plugins: [router],
      },
    })
    await router.isReady()

    const cards = wrapper.findAllComponents(ContentCard)
    expect(cards.length).toBe(0)

    const emptyState = wrapper.find('.empty-state')
    expect(emptyState.exists()).toBe(true)
    expect(wrapper.find('.empty-state-text').text()).toBe('No content matches the current filters.')

    // Restore entries
    contentStore.entries = saved
  })
})
