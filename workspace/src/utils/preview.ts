import MarkdownIt from 'markdown-it'

const md = new MarkdownIt({ html: true, linkify: true, typographer: true })

export function renderMarkdown(text: string): string {
  return md.render(text)
}

export function stripFrontmatter(md: string): string {
  return md.replace(/^---\s*\n[\s\S]*?\n---\s*\n?/, '').trim()
}

/**
 * Add inline styles to WeChat article HTML, matching the engine transformer.
 */
function addInlineStyles(html: string): string {
  return html
    .replace(/<h1[^>]*>/g, '<section style="font-size: 20px; font-weight: bold; margin: 24px 0 12px; color: #111; padding-left: 12px; border-left: 3px solid #2563eb;">')
    .replace(/<h2[^>]*>/g, '<section style="font-size: 17px; font-weight: 600; margin: 20px 0 10px; color: #111; padding-left: 12px; border-left: 3px solid #8b5cf6;">')
    .replace(/<h3[^>]*>/g, '<section style="font-size: 15px; font-weight: 600; margin: 16px 0 8px; color: #333;">')
    .replace(/<p>/g, '<section style="margin: 12px 0; font-size: 15px; line-height: 1.8; color: #333;">')
    .replace(/<ul>/g, '<section style="margin: 8px 0; padding-left: 20px;">')
    .replace(/<ol>/g, '<section style="margin: 8px 0; padding-left: 20px;">')
    .replace(/<li>/g, '<section style="margin: 4px 0; font-size: 15px; line-height: 1.7; color: #333;">')
    .replace(/<blockquote>/g, '<section style="margin: 16px 0; padding: 12px 16px; border-left: 3px solid #ddd; background: #f9f9f9; font-style: italic; color: #666;">')
    .replace(/<strong>/g, '<strong style="color: #111; font-weight: 700;">')
    .replace(/<em>/g, '<em style="color: #555;">')
    .replace(/<code>/g, '<code style="background: #f5f5f5; padding: 2px 6px; border-radius: 3px; font-family: monospace; font-size: 14px; color: #e83e8c;">')
    .replace(/<img /g, '<img style="max-width: 100%; border-radius: 8px; margin: 12px 0; display: block; " ')
    .replace(/<a /g, '<a style="color: #2563eb; text-decoration: none; border-bottom: 1px solid rgba(37, 99, 235, 0.3); " ')
    .replace(/<\/h[123]>/g, '</section>')
    .replace(/<\/p>/g, '</section>')
    .replace(/<\/[uo]l>/g, '</section>')
    .replace(/<\/li>/g, '</section>')
    .replace(/<\/blockquote>/g, '</section>')
}

export function generateWeChatHtml(
  title: string,
  body: string,
  author: string,
): string {
  const renderedBody = addInlineStyles(md.render(body))
  return `
    <div class="wechat-article">
      <h1 class="wechat-title">${title}</h1>
      <div class="wechat-meta">
        <span class="wechat-author">${author}</span>
      </div>
      <hr class="wechat-divider" />
      <div class="wechat-body">${renderedBody}</div>
      <div class="wechat-end">— END —</div>
    </div>
  `
}

type CardStyle = 'gradient' | 'quote' | 'minimal' | 'code' | 'list'

const cardStyles: Record<CardStyle, { background: string; color: string; accent: string }> = {
  gradient: { background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)', color: '#fff', accent: 'rgba(255,255,255,0.7)' },
  quote: { background: '#f8f4ff', color: '#4c1d95', accent: '#8b5cf6' },
  minimal: { background: '#ffffff', color: '#1e293b', accent: '#64748b' },
  code: { background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', color: '#e2e8f0', accent: '#38bdf8' },
  list: { background: 'linear-gradient(180deg, #fff7ed 0%, #fef3c7 100%)', color: '#78350f', accent: '#d97706' },
}

export function generateXiaohongshuCard(
  title: string,
  body: string,
  hashtags: string[],
  cardStyle: CardStyle = 'gradient',
): string {
  const style = cardStyles[cardStyle] || cardStyles.gradient
  const renderedBody = md.render(body)
  const tags = hashtags.map(t => {
    const tag = t.startsWith('#') ? t : `#${t}`
    return `<span class="xhs-tag">${tag}</span>`
  }).join('')

  return `
    <div class="xhs-card" style="background: ${style.background}; color: ${style.color};">
      <div class="xhs-header">
        <div class="xhs-title">${title}</div>
        <div class="xhs-author">@slashhuang</div>
      </div>
      <div class="xhs-body">${renderedBody}</div>
      <div class="xhs-footer">${tags}</div>
    </div>
  `
}
