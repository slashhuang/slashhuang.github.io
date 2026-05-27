import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { exportFiles } from './exporter.js'
import { mkdtemp, rm, readdir, readFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

describe('exportFiles', () => {
  let testDir: string

  beforeEach(async () => {
    testDir = await mkdtemp(join(tmpdir(), 'exporter-test-'))
  })

  afterEach(async () => {
    await rm(testDir, { recursive: true, force: true })
  })

  it('returns empty array for empty input', async () => {
    const result = await exportFiles([], testDir)
    expect(result).toEqual([])
  })

  it('writes generated files to disk', async () => {
    const files = [
      { path: 'blog/test.md', content: '# Hello', platform: 'blog' as const },
      { path: 'wechat/test.html', content: '<div>Hi</div>', platform: 'wechat' as const },
    ]

    const paths = await exportFiles(files, testDir)

    expect(paths.length).toBe(2)
    expect(paths[0]).toBe(join(testDir, 'blog', 'test.md'))
    expect(paths[1]).toBe(join(testDir, 'wechat', 'test.html'))

    const dirs = await readdir(testDir)
    expect(dirs).toContain('blog')
    expect(dirs).toContain('wechat')

    const blogContent = await readFile(join(testDir, 'blog', 'test.md'), 'utf-8')
    expect(blogContent).toBe('# Hello')

    const wechatContent = await readFile(join(testDir, 'wechat', 'test.html'), 'utf-8')
    expect(wechatContent).toBe('<div>Hi</div>')
  })

  it('creates nested directories', async () => {
    const files = [
      { path: 'xiaohongshu/cards/post-1.html', content: '<div>card</div>', platform: 'xiaohongshu' as const },
    ]

    const paths = await exportFiles(files, testDir)

    expect(paths.length).toBe(1)
    expect(paths[0]).toBe(join(testDir, 'xiaohongshu', 'cards', 'post-1.html'))

    const content = await readFile(paths[0], 'utf-8')
    expect(content).toBe('<div>card</div>')
  })

  it('returns absolute paths', async () => {
    const files = [
      { path: 'test.txt', content: 'hello', platform: 'blog' as const },
    ]

    const paths = await exportFiles(files, testDir)

    expect(paths[0]).toMatch(/^\//)
  })

  it('throws on path traversal attempts', async () => {
    const files = [
      { path: '../../etc/passwd', content: 'malicious', platform: 'blog' as const },
    ]

    await expect(exportFiles(files, testDir)).rejects.toThrow('escapes output directory')
  })
})
