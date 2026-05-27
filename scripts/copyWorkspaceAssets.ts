/**
 * Copy workspace dist to VuePress public directory for static serving.
 * Usage: tsx scripts/copyWorkspaceAssets.ts
 */
import { cpSync, existsSync, rmSync } from 'node:fs'
import { resolve } from 'node:path'

const root = resolve(import.meta.dirname, '..')
const src = resolve(root, 'workspace/dist')
const dest = resolve(root, 'docs/.vuepress/public/workspace')

if (!existsSync(src)) {
  console.error('workspace/dist does not exist. Run: pnpm --filter @ai/workspace build')
  process.exit(1)
}

if (existsSync(dest)) {
  rmSync(dest, { recursive: true, force: true })
}

cpSync(src, dest, { recursive: true })
console.log(`Copied workspace/dist -> docs/.vuepress/public/workspace/`)
