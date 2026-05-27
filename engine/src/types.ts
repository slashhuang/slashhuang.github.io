export interface ContentMeta {
  title: string
  date: string
  cover?: string
  targets: ('blog' | 'wechat' | 'xiaohongshu')[]
  tags: string[]
  summary?: string
  wechat?: WechatMeta
  xiaohongshu?: XiaohongshuMeta
  blog?: BlogMeta
}

export interface WechatMeta {
  digest?: string
  author?: string
  original?: boolean
}

export interface XiaohongshuMeta {
  titleOverride?: string
  hashtags?: string[]
  cardStyle?: 'gradient' | 'quote' | 'minimal' | 'code' | 'list'
  theme?: 'light' | 'dark'
  splitMode?: 'auto' | 'manual'
}

export interface BlogMeta {
  category?: string
  pinned?: boolean
}

export interface GeneratedFile {
  path: string
  content: string
  platform: 'blog' | 'wechat' | 'xiaohongshu'
}

export interface ParsedContent {
  meta: ContentMeta
  body: string
  sourcePath: string
}
