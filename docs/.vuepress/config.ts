import process from 'node:process'
import { viteBundler } from '@vuepress/bundler-vite'
import { webpackBundler } from '@vuepress/bundler-webpack'
import { getModulePath } from '@vuepress/helper'
import type { DefaultThemePageData } from '@vuepress/theme-default'
import type { Page } from 'vuepress'
import { defineUserConfig } from 'vuepress'
import { getDirname, path } from 'vuepress/utils'
import { head, plugins } from './configs/index'
import theme from './theme'

const __dirname = import.meta.dirname || getDirname(import.meta.url)

export default defineUserConfig({
  // set site base to default value
  base: (process.env.BASE as '/' | `/${string}/` | undefined) || '/',

  // extra tags in `<head>`
  head,

  lang: 'zh-CN',
  title: ' ',
  description: 'Ai与玩法',

  // site-level locales config
  locales: {
    '/': {
      lang: 'zh-CN',
      title: ' ',
      description: 'Ai与玩法',
    },
    '/zh/': {
      lang: 'zh-CN',
      title: ' ',
      description: 'Ai与玩法',
    },
  },

  // specify bundler via environment variable
  bundler:
    process.env.DOCS_BUNDLER === 'webpack' ? webpackBundler() : viteBundler(),

  // configure markdown
  markdown: {
    toc: {
      level: [1, 2, 3, 4],
      // includeLevel: [1, 2, 3, 4],
      shouldAllowNested:  true
    },
    importCode: {
      handleImportPath: (importPath) => {
        // handle @vuepress packages import path
        if (importPath.startsWith('@vuepress/')) {
          const packageName = importPath.match(/^(@vuepress\/[^/]*)/)![1]
          const realPath = importPath.replace(
            packageName,
            path.dirname(
              getModulePath(`${packageName}/package.json`, import.meta),
            ),
          )

          return realPath
        }
        return importPath
      },
    },
  },

  // configure default theme
  theme,

  // use plugins
  plugins,

  pagePatterns: ['**/*.md', '!**/*.snippet.md', '!.vuepress', '!node_modules'],

  alias: {
    '@theme/VPAutoLink.vue': path.resolve(
      __dirname,
      './components/VPAutoLink.vue',
    ),
    '@theme/VPNavbarDropdown.vue': path.resolve(
      __dirname,
      './components/VPNavbarDropdown.vue',
    ),
    '@theme/VPSidebarItem.vue': path.resolve(
      __dirname,
      './components/VPSidebarItem.vue',
    ),
    '@theme/useNavbarRepo': path.resolve(
      __dirname,
      './composables/useNavbarRepo.ts',
    ),
    '@theme/useNavbarSelectLanguage': path.resolve(
      __dirname,
      './composables/useNavbarSelectLanguage.ts',
    ),
    '@theme/resolveAutoLink': path.resolve(
      __dirname,
      './utils/resolveAutoLink.ts',
    ),
  },

  extendsPage: (page: Page<Partial<DefaultThemePageData>>) => {
    const { icon } = page.frontmatter

    // save icon into route meta
    if (icon) {
      page.routeMeta.icon = icon
    }
  },
})
