import MarkdownIt from 'markdown-it'

const md = new MarkdownIt({ html: true, linkify: true, typographer: true })

/**
 * Render a Markdown string to HTML.
 */
export function renderMarkdown(text: string): string {
  return md.render(text)
}

/**
 * Remove YAML frontmatter (--- ... ---) from a Markdown string.
 */
export function stripFrontmatter(md: string): string {
  return md.replace(/^---\s*\n[\s\S]*?\n---\s*\n?/, '').trim()
}

/**
 * Generate WeChat-article-styled HTML from title, body (plain or markdown), and author.
 */
export function generateWeChatHtml(
  title: string,
  body: string,
  author: string,
): string {
  const renderedBody = renderMarkdown(body)
  return `
    <div class="wechat-article">
      <h1 class="wechat-title">${title}</h1>
      <div class="wechat-meta">
        <span class="wechat-author">${author}</span>
      </div>
      <hr class="wechat-divider" />
      <div class="wechat-body">${renderedBody}</div>
    </div>
  `
}

/**
 * Generate a Xiaohongshu-style card preview HTML.
 */
export function generateXiaohongshuCard(
  title: string,
  body: string,
  hashtags: string[],
): string {
  const renderedBody = renderMarkdown(body)
  const tags = hashtags.map((t) => `<span class="xhs-tag">#${t}</span>`).join('')
  return `
    <div class="xhs-card">
      <h2 class="xhs-title">${title}</h2>
      <div class="xhs-body">${renderedBody}</div>
      <div class="xhs-tags">${tags}</div>
    </div>
  `
}
