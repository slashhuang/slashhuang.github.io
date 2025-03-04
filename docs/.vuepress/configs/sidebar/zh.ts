import type { SidebarOptions } from '@vuepress/theme-default'

export const sidebarZh: SidebarOptions = {
  '/': [
    {
      text: 'Ai工具',
      link: '/biz/',
    },
    {
      text: 'Ai写代码',
      link: '/code/',
    },
  ],
  '/biz/': [
    'guidelines',
    {
      text: '业务场景',
      icon: 'palette',
      // link: '/biz/guidelines',
      children: [
        'wechat',
      ],
    },
  ],
  '/code/': [
    'guidelines',
    {
      text: '进阶玩法',
      icon: 'palette',
      children: [
        'cursor',
      ],
    },
  ],


  '/zh/plugins/blog/': [
    {
      text: '博客',
      icon: 'la:blog',
      prefix: 'blog/',
      link: 'blog/',
      children: ['guide', 'config'],
    },
    {
      text: '评论',
      icon: 'message-circle-more',
      prefix: 'comment/',
      link: 'comment/',
      children: ['guide', 'giscus/', 'waline/', 'artalk/', 'twikoo/'],
    },
    {
      text: 'Feed',
      icon: 'rss',
      prefix: 'feed/',
      link: 'feed/',
      children: ['guide', 'config', 'frontmatter', 'channel', 'getter'],
    },
  ]
}
