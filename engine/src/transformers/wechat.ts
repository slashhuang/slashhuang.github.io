import ejs from 'ejs'
import MarkdownIt from 'markdown-it'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import type { ParsedContent, GeneratedFile } from '../types.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
})

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
    .replace(/<img /g, '<img style="max-width: 100%; border-radius: 8px; margin: 12px 0; display: block; " ')
    .replace(/<a /g, '<a style="color: #2563eb; text-decoration: none; border-bottom: 1px solid rgba(37, 99, 235, 0.3); " ')
    .replace(/<\/h[123]>/g, '</section>')
    .replace(/<\/p>/g, '</section>')
    .replace(/<\/[uo]l>/g, '</section>')
    .replace(/<\/li>/g, '</section>')
    .replace(/<\/blockquote>/g, '</section>')
}

function stripCodeBlocks(text: string): string {
  return text.replace(/```[\s\S]*?```/g, '').replace(/`[^`]+`/g, '')
}

export function transformWechat(parsed: ParsedContent): GeneratedFile {
  const { meta, body } = parsed

  const cleanedBody = stripCodeBlocks(body)
  const bodyHtml = addInlineStyles(md.render(cleanedBody))
  const template = readFileSync(join(__dirname, '../templates/wechat-article.ejs'), 'utf-8')
  const html = ejs.render(template, {
    title: meta.title,
    body: bodyHtml,
    author: meta.wechat?.author,
  })

  const fileName = parsed.sourcePath.split('/').pop()?.replace(/\.md$/, '') || 'post'
  return {
    path: `wechat/${fileName}.html`,
    content: html,
    platform: 'wechat',
  }
}
