import ejs from 'ejs'
import { readFileSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import type { ParsedContent, GeneratedFile } from '../types.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const TEMPLATES_DIR = join(__dirname, '../templates')
const MAX_CHARS_PER_CARD = 400

interface CardTemplate {
  name: string
  template: string
}

const templates: Record<string, string> = {}

function loadTemplates() {
  if (Object.keys(templates).length > 0) return
  const files = readdirSync(TEMPLATES_DIR).filter(f => f.startsWith('xhs-card-') && f.endsWith('.ejs'))
  for (const file of files) {
    const name = file.replace('xhs-card-', '').replace('.ejs', '')
    templates[name] = readFileSync(join(TEMPLATES_DIR, file), 'utf-8')
  }
}

function splitContent(body: string, maxChars: number): string[] {
  const paragraphs = body.split('\n\n').filter(p => p.trim())
  const segments: string[] = []
  let current = ''

  for (const para of paragraphs) {
    if ((current + '\n\n' + para).trim().length > maxChars && current) {
      segments.push(current.trim())
      current = para
    } else {
      current = current ? current + '\n\n' + para : para
    }
  }
  if (current.trim()) {
    segments.push(current.trim())
  }

  // Further split any segments still exceeding maxChars
  const result = segments.flatMap(seg => {
    if (seg.length <= maxChars) return [seg]
    const chunks: string[] = []
    for (let i = 0; i < seg.length; i += maxChars) {
      chunks.push(seg.substring(i, i + maxChars))
    }
    return chunks
  })
  return result.length ? result : [body.trim().substring(0, maxChars)]
}

function renderHtml(templateStr: string, data: { title: string; body: string; tags: string[]; author: string }): string {
  return ejs.render(templateStr, {
    title: data.title,
    body: data.body.replace(/\n/g, '<br/>'),
    tags: data.tags.map(t => t.startsWith('#') ? t : `#${t}`),
    author: data.author,
  })
}

export function transformXiaohongshu(parsed: ParsedContent): GeneratedFile[] {
  loadTemplates()

  const { meta, body } = parsed
  const style = meta.xiaohongshu?.cardStyle || 'gradient'
  const title = meta.xiaohongshu?.titleOverride || meta.title
  const author = meta.wechat?.author || 'slashhuang'

  const segments = splitContent(body, MAX_CHARS_PER_CARD)
  const templateStr = templates[style] || templates.gradient

  return segments.map((segment, i) => {
    const html = renderHtml(templateStr, {
      title,
      body: segment,
      tags: meta.xiaohongshu?.hashtags || meta.tags,
      author,
    })

    return {
      path: `xiaohongshu/cards/${parsed.sourcePath.split('/').pop()?.replace(/\.md$/, '') || 'post'}-${i + 1}.html`,
      content: html,
      platform: 'xiaohongshu',
    }
  })
}
