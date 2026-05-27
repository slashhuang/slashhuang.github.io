import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import PlatformBadge from '../PlatformBadge.vue'

describe('PlatformBadge', () => {
  it('shows "Blog" label for blog platform', () => {
    const wrapper = mount(PlatformBadge, {
      props: { platform: 'blog' },
    })

    expect(wrapper.text()).toContain('Blog')
    expect(wrapper.classes()).toContain('platform-badge--blog')
  })

  it('shows "WeChat" label for wechat platform', () => {
    const wrapper = mount(PlatformBadge, {
      props: { platform: 'wechat' },
    })

    expect(wrapper.text()).toContain('WeChat')
    expect(wrapper.classes()).toContain('platform-badge--wechat')
  })

  it('shows "Xiaohongshu" label for xiaohongshu platform', () => {
    const wrapper = mount(PlatformBadge, {
      props: { platform: 'xiaohongshu' },
    })

    expect(wrapper.text()).toContain('Xiaohongshu')
    expect(wrapper.classes()).toContain('platform-badge--xhs')
  })

  it('renders the platform icon', () => {
    const wrapper = mount(PlatformBadge, {
      props: { platform: 'blog' },
    })

    expect(wrapper.find('.platform-badge-icon').exists()).toBe(true)
  })
})
