import { Command } from 'commander'
import { readdir, readFile } from 'node:fs/promises'
import { join, extname } from 'node:path'
import { parseContent } from './parser.js'
import { transformBlog } from './transformers/blog.js'
import { transformWechat } from './transformers/wechat.js'
import { transformXiaohongshu } from './transformers/xiaohongshu.js'
import { exportFiles } from './exporter.js'
import type { ParsedContent, GeneratedFile } from './types.js'

type PlatformOption = 'blog' | 'wechat' | 'xiaohongshu' | 'all'

interface BuildOptions {
  source: string
  output: string
  platform: PlatformOption
}

/**
 * Resolve which platforms to generate for a given post,
 * intersecting meta.targets with the CLI platform filter.
 */
export function resolvePlatformFilter(
  metaTargets: ('blog' | 'wechat' | 'xiaohongshu')[],
  cliPlatform: PlatformOption,
): ('blog' | 'wechat' | 'xiaohongshu')[] {
  if (metaTargets.length === 0) return []
  if (cliPlatform === 'all') return metaTargets
  return metaTargets.filter(t => t === cliPlatform)
}

/**
 * Core build logic: given parsed posts and build options,
 * route to transformers and return GeneratedFile[].
 */
export async function buildFromFiles(
  parsedFiles: ParsedContent[],
  options: { outputDir: string; platform: PlatformOption },
): Promise<GeneratedFile[]> {
  const allFiles: GeneratedFile[] = []

  for (const parsed of parsedFiles) {
    const targets = resolvePlatformFilter(parsed.meta.targets, options.platform)

    for (const target of targets) {
      let generated: GeneratedFile | GeneratedFile[]
      switch (target) {
        case 'blog':
          generated = transformBlog(parsed)
          allFiles.push(generated)
          break
        case 'wechat':
          generated = transformWechat(parsed)
          allFiles.push(generated)
          break
        case 'xiaohongshu':
          generated = transformXiaohongshu(parsed)
          allFiles.push(...generated)
          break
      }
    }
  }

  if (allFiles.length > 0) {
    await exportFiles(allFiles, options.outputDir)
  }

  return allFiles
}

/**
 * Discover and parse all .md files in a directory.
 */
async function discoverAndParse(sourceDir: string): Promise<ParsedContent[]> {
  const entries = await readdir(sourceDir, { withFileTypes: true })
  const parsed: ParsedContent[] = []

  for (const entry of entries) {
    if (entry.isFile() && extname(entry.name) === '.md') {
      const fullPath = join(sourceDir, entry.name)
      const content = await readFile(fullPath, 'utf-8')
      parsed.push(parseContent(content, fullPath))
    }
  }

  return parsed
}

/**
 * Run a single build cycle.
 */
async function runBuild(opts: BuildOptions): Promise<void> {
  console.log(`Building from ${opts.source} -> ${opts.output} (platform: ${opts.platform})`)
  const parsed = await discoverAndParse(opts.source)
  if (parsed.length === 0) {
    console.log('No .md files found.')
    return
  }
  console.log(`Found ${parsed.length} file(s).`)
  const files = await buildFromFiles(parsed, { outputDir: opts.output, platform: opts.platform })
  console.log(`Generated ${files.length} file(s).`)
}

/**
 * Watch mode: watch source dir and rebuild on changes with debounce.
 */
async function runDev(opts: BuildOptions): Promise<void> {
  const chokidar = await import('chokidar')

  console.log(`Watching ${opts.source} for changes...`)
  await runBuild(opts)

  let debounceTimer: ReturnType<typeof setTimeout> | null = null
  const DEBOUNCE_MS = 500

  const watcher = chokidar.watch(opts.source, {
    ignored: /(^|[\/\\])\../,
    persistent: true,
    ignoreInitial: true, // Initial build already handled above
  })

  const scheduleRebuild = (event: string, path: string) => {
    console.log(`\n[${event}] ${path} — rebuilding...`)
    if (debounceTimer) clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => {
      runBuild(opts).catch(err => console.error('Build error:', err))
    }, DEBOUNCE_MS)
  }

  watcher
    .on('add', (path) => scheduleRebuild('add', path))
    .on('change', (path) => scheduleRebuild('change', path))
    .on('unlink', (path) => scheduleRebuild('unlink', path))

  process.on('SIGINT', () => {
    console.log('\nStopping watcher.')
    void watcher.close()
    process.exit(0)
  })
}

export function createProgram(): Command {
  const program = new Command()

  program
    .name('transform')
    .description('Content transformation engine CLI')
    .version('0.0.1')

  program
    .command('build')
    .description('Build platform-specific output from content files')
    .option('--source <dir>', 'Source directory', 'content/posts')
    .option('--output <dir>', 'Output directory', 'content/generated')
    .option('--platform <type>', 'Target platform', 'all')
    .action((opts: { source: string; output: string; platform: PlatformOption }) => {
      runBuild(opts).catch(err => {
        console.error('Build failed:', err)
        process.exit(1)
      })
    })

  program
    .command('dev')
    .description('Watch mode — rebuild on file changes')
    .option('--source <dir>', 'Source directory', 'content/posts')
    .option('--output <dir>', 'Output directory', 'content/generated')
    .option('--platform <type>', 'Target platform', 'all')
    .action((opts: { source: string; output: string; platform: PlatformOption }) => {
      runDev(opts).catch(err => {
        console.error('Dev server failed:', err)
        process.exit(1)
      })
    })

  return program
}

// Entry point when run directly
if (process.argv[1]?.endsWith('cli.js') || process.argv[1]?.endsWith('cli.ts')) {
  createProgram().parse()
}
