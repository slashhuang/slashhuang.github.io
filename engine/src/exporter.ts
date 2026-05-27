import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import type { GeneratedFile } from './types.js'

export async function exportFiles(files: GeneratedFile[], outputDir: string): Promise<string[]> {
  if (files.length === 0) {
    return []
  }

  const resolvedDir = resolve(outputDir)
  const paths: string[] = []

  for (const file of files) {
    const fullPath = resolve(join(resolvedDir, file.path))
    if (!fullPath.startsWith(resolvedDir + '/')) {
      throw new Error(`File path escapes output directory: ${file.path}`)
    }
    await mkdir(dirname(fullPath), { recursive: true })
    await writeFile(fullPath, file.content, 'utf-8')
    paths.push(fullPath)
  }

  return paths
}
