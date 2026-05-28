import { describe, it, expect } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import Sidebar from '../Sidebar.vue'
import { createRouter, createWebHistory } from 'vue-router'

function createRouterForTest(initialRoute: string) {
  const router = createRouter({
    history: createWebHistory(),
    routes: [
      { path: '/', component: { template: '<div>Home</div>' } },
      { path: '/list', component: { template: '<div>List</div>' } },
      { path: '/editor/new', component: { template: '<div>Editor</div>' } },
    ],
  })
  router.push(initialRoute)
  return router
}

describe('Sidebar', () => {
  it('renders the sidebar with logo and nav links', async () => {
    const router = createRouterForTest('/')
    const wrapper = mount(Sidebar, { global: { plugins: [router] } })
    await router.isReady()
    await flushPromises()

    expect(wrapper.find('.sidebar').exists()).toBe(true)
    expect(wrapper.find('.sidebar-logo').text()).toBe('Content Workspace')
    expect(wrapper.findAll('.sidebar-link').length).toBe(3)
  })

  it('renders all three navigation links', async () => {
    const router = createRouterForTest('/')
    const wrapper = mount(Sidebar, { global: { plugins: [router] } })
    await router.isReady()
    await flushPromises()

    const links = wrapper.findAll('.sidebar-link')
    const hrefs = links.map(l => l.attributes('href'))
    expect(hrefs).toContain('/')
    expect(hrefs).toContain('/list')
    expect(hrefs).toContain('/editor/new')
  })

  it('highlights the active nav link based on route', async () => {
    const router = createRouterForTest('/list')
    const wrapper = mount(Sidebar, {
      global: { plugins: [router] },
    })
    await router.isReady()
    await flushPromises()
    // Give Vue another tick to re-render with the resolved route
    await wrapper.vm.$nextTick()

    const links = wrapper.findAll('.sidebar-link')
    // Verify links exist and one should be active
    expect(links.length).toBe(3)

    // Simulate clicking the Content List link to trigger active state
    await wrapper.findAll('.sidebar-link')[1].trigger('click')
    await router.isReady()
    await flushPromises()
    await wrapper.vm.$nextTick()

    const activeLinks = wrapper.findAll('.sidebar-link--active')
    expect(activeLinks.length).toBeGreaterThanOrEqual(1)
  })
})
