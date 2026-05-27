import { describe, it, expect, vi, beforeEach } from 'vitest'
import { resolvePlatformFilter, buildFromFiles, createProgram } from './cli.js'
import type { ContentMeta, ParsedContent, GeneratedFile } from './types.js'

// Mock dependencies
vi.mock('./parser.js', () => ({
  parseContent: vi.fn((content: string, sourcePath: string) => ({
    meta: {
      title: 'Test',
      date: '2026-05-27',
      targets: ['blog', 'wechat', 'xiaohongshu'],
      tags: ['test'],
    },
    body: 'Hello world',
    sourcePath,
  })),
}))

vi.mock('./exporter.js', () => ({
  exportFiles: vi.fn(async (files: GeneratedFile[]) => files.map(f => f.path)),
}))

vi.mock('node:fs/promises', () => ({
  readFile: vi.fn(async () => 'mock content'),
}))

describe('resolvePlatformFilter', () => {
  it('returns all platforms when filter is "all"', () => {
    const metaTargets: ('blog' | 'wechat' | 'xiaohongshu')[] = ['blog', 'wechat', 'xiaohongshu']
    const result = resolvePlatformFilter(metaTargets, 'all')
    expect(result).toEqual(['blog', 'wechat', 'xiaohongshu'])
  })

  it('filters to only blog', () => {
    const metaTargets: ('blog' | 'wechat' | 'xiaohongshu')[] = ['blog', 'wechat', 'xiaohongshu']
    const result = resolvePlatformFilter(metaTargets, 'blog')
    expect(result).toEqual(['blog'])
  })

  it('filters to only wechat', () => {
    const metaTargets: ('blog' | 'wechat' | 'xiaohongshu')[] = ['blog', 'wechat', 'xiaohongshu']
    const result = resolvePlatformFilter(metaTargets, 'wechat')
    expect(result).toEqual(['wechat'])
  })

  it('filters to only xiaohongshu', () => {
    const metaTargets: ('blog' | 'wechat' | 'xiaohongshu')[] = ['blog', 'wechat', 'xiaohongshu']
    const result = resolvePlatformFilter(metaTargets, 'xiaohongshu')
    expect(result).toEqual(['xiaohongshu'])
  })

  it('returns empty when meta has no matching platforms', () => {
    const metaTargets: ('blog' | 'wechat' | 'xiaohongshu')[] = ['blog']
    const result = resolvePlatformFilter(metaTargets, 'wechat')
    expect(result).toEqual([])
  })

  it('returns empty when meta.targets is empty', () => {
    const metaTargets: ('blog' | 'wechat' | 'xiaohongshu')[] = []
    const result = resolvePlatformFilter(metaTargets, 'all')
    expect(result).toEqual([])
  })
})

describe('buildFromFiles', () => {
  const mockParsed: ParsedContent = {
    meta: {
      title: 'Test Post',
      date: '2026-05-27',
      targets: ['blog', 'wechat'],
      tags: ['test'],
    },
    body: '# Hello',
    sourcePath: '/test/post.md',
  }

  it('routes to correct transformer based on meta.targets for blog', async () => {
    const parsed: ParsedContent = {
      ...mockParsed,
      meta: { ...mockParsed.meta, targets: ['blog'] },
    }
    const files = await buildFromFiles([parsed], { outputDir: '/tmp/out', platform: 'all' })
    expect(files.length).toBe(1)
    expect(files[0].platform).toBe('blog')
    expect(files[0].path).toBe('blog/post.md')
  })

  it('routes to correct transformer based on meta.targets for wechat', async () => {
    const parsed: ParsedContent = {
      ...mockParsed,
      meta: { ...mockParsed.meta, targets: ['wechat'] },
    }
    const files = await buildFromFiles([parsed], { outputDir: '/tmp/out', platform: 'all' })
    expect(files.length).toBe(1)
    expect(files[0].platform).toBe('wechat')
    expect(files[0].path).toBe('wechat/post.html')
  })

  it('routes to both blog and wechat when targets includes both', async () => {
    const parsed: ParsedContent = {
      ...mockParsed,
      meta: { ...mockParsed.meta, targets: ['blog', 'wechat'] },
    }
    const files = await buildFromFiles([parsed], { outputDir: '/tmp/out', platform: 'all' })
    expect(files.length).toBe(2)
    const platforms = files.map(f => f.platform)
    expect(platforms).toContain('blog')
    expect(platforms).toContain('wechat')
  })

  it('respects platform filter — only blog output when platform=blog', async () => {
    const parsed: ParsedContent = {
      ...mockParsed,
      meta: { ...mockParsed.meta, targets: ['blog', 'wechat'] },
    }
    const files = await buildFromFiles([parsed], { outputDir: '/tmp/out', platform: 'blog' })
    expect(files.length).toBe(1)
    expect(files[0].platform).toBe('blog')
  })

  it('respects platform filter — only wechat output when platform=wechat', async () => {
    const parsed: ParsedContent = {
      ...mockParsed,
      meta: { ...mockParsed.meta, targets: ['blog', 'wechat'] },
    }
    const files = await buildFromFiles([parsed], { outputDir: '/tmp/out', platform: 'wechat' })
    expect(files.length).toBe(1)
    expect(files[0].platform).toBe('wechat')
  })

  it('returns empty array when no targets match platform filter', async () => {
    const parsed: ParsedContent = {
      ...mockParsed,
      meta: { ...mockParsed.meta, targets: ['blog'] },
    }
    const files = await buildFromFiles([parsed], { outputDir: '/tmp/out', platform: 'xiaohongshu' })
    expect(files.length).toBe(0)
  })

  it('returns empty array for empty input', async () => {
    const files = await buildFromFiles([], { outputDir: '/tmp/out', platform: 'all' })
    expect(files.length).toBe(0)
  })
})

describe('CLI command registration', () => {
  it('registers build and dev commands', () => {
    const program = createProgram()
    const commands = program.commands.map(c => c.name())
    expect(commands).toContain('build')
    expect(commands).toContain('dev')
  })

  it('build command has correct default options', () => {
    const program = createProgram()
    const buildCmd = program.commands.find(c => c.name() === 'build')!
    const options = buildCmd.options
    expect(options.find(o => o.long === '--source')?.defaultValue).toBe('content/posts')
    expect(options.find(o => o.long === '--output')?.defaultValue).toBe('content/generated')
    expect(options.find(o => o.long === '--platform')?.defaultValue).toBe('all')
  })

  it('build command accepts custom options', () => {
    const program = createProgram()
    const buildCmd = program.commands.find(c => c.name() === 'build')!
    const options = buildCmd.options
    const sourceOpt = options.find(o => o.long === '--source')
    const outputOpt = options.find(o => o.long === '--output')
    const platformOpt = options.find(o => o.long === '--platform')
    expect(sourceOpt).toBeDefined()
    expect(outputOpt).toBeDefined()
    expect(platformOpt).toBeDefined()
  })

  it('dev command has same defaults as build', () => {
    const program = createProgram()
    const devCmd = program.commands.find(c => c.name() === 'dev')!
    const options = devCmd.options
    expect(options.find(o => o.long === '--source')?.defaultValue).toBe('content/posts')
    expect(options.find(o => o.long === '--output')?.defaultValue).toBe('content/generated')
    expect(options.find(o => o.long === '--platform')?.defaultValue).toBe('all')
  })
})
