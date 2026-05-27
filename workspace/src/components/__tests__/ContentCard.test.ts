import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ContentCard from '../ContentCard.vue'

describe('ContentCard', () => {
  it('renders title and date from props', () => {
    const wrapper = mount(ContentCard, {
      props: {
        title: 'Test Article',
        date: '2026-05-27',
      },
    })

    expect(wrapper.find('.content-card-title').text()).toBe('Test Article')
    expect(wrapper.find('.content-card-date').text()).toBe('2026-05-27')
  })

  it('renders platform badges when platforms are provided', () => {
    const wrapper = mount(ContentCard, {
      props: {
        title: 'Test',
        date: '2026-05-27',
        platforms: ['blog', 'wechat', 'xiaohongshu'],
      },
    })

    const badges = wrapper.findAllComponents({ name: 'PlatformBadge' })
    expect(badges.length).toBe(3)
  })

  it('renders tags when provided', () => {
    const wrapper = mount(ContentCard, {
      props: {
        title: 'Test',
        date: '2026-05-27',
        tags: ['AI', 'Tools', 'Vue'],
      },
    })

    const tagElements = wrapper.findAll('.content-card-tag')
    expect(tagElements.length).toBe(3)
    expect(tagElements[0].text()).toBe('AI')
    expect(tagElements[1].text()).toBe('Tools')
  })

  it('shows draft status by default', () => {
    const wrapper = mount(ContentCard, {
      props: {
        title: 'Test',
        date: '2026-05-27',
      },
    })

    const status = wrapper.find('.content-card-status')
    expect(status.text()).toBe('Draft')
    expect(status.classes()).toContain('content-card-status--draft')
  })

  it('shows published status when set', () => {
    const wrapper = mount(ContentCard, {
      props: {
        title: 'Test',
        date: '2026-05-27',
        status: 'published',
      },
    })

    const status = wrapper.find('.content-card-status')
    expect(status.text()).toBe('Published')
    expect(status.classes()).toContain('content-card-status--published')
  })
})
