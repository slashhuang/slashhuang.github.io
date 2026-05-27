import { describe, it, expect } from 'vitest'
import { transformXiaohongshu } from './xiaohongshu.js'
import { parseContent } from '../parser.js'

describe('transformXiaohongshu', () => {
  it('generates HTML cards for each content segment', () => {
    const md = `---
title: "小红书卡片"
date: 2026-05-27
targets:
  - xiaohongshu
tags: [AI, 效率]
xiaohongshu:
  cardStyle: gradient
  theme: light
---

第一段内容，这是介绍。

第二段内容，这是正文。
`
    const parsed = parseContent(md, '/test.md')
    const cards = transformXiaohongshu(parsed)

    expect(cards.length).toBeGreaterThanOrEqual(1)
    expect(cards[0].content).toContain('xhs-card')
    expect(cards[0].content).toContain('小红书卡片')
    expect(cards[0].path).toContain('xiaohongshu')
  })

  it('defaults to gradient style when not specified', () => {
    const md = `---
title: "Test"
date: 2026-05-27
targets:
  - xiaohongshu
tags: []
---

Content
`
    const parsed = parseContent(md, '/test.md')
    const cards = transformXiaohongshu(parsed)

    expect(cards[0].content).toContain('linear-gradient')
  })

  it('splits long content into multiple cards', () => {
    const longBody = '这是一段很长的内容。'.repeat(50)
    const md = `---
title: "Long Post"
date: 2026-05-27
targets:
  - xiaohongshu
tags: []
---

${longBody}
`
    const parsed = parseContent(md, '/long.md')
    const cards = transformXiaohongshu(parsed)

    expect(cards.length).toBeGreaterThan(1)
  })
})
