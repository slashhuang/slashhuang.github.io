import { getPageExcerpt } from '@vuepress/helper'
import type { App, Page } from 'vuepress/core'

export const setPagesExcerpt = (app: App): void => {
  const { pages, pluginApi } = app
  const isBlogPluginEnabled = pluginApi.plugins.some(
    ({ name }) => name === '@vuepress/plugin-blog',
  )
  const hasExcerpt =
    isBlogPluginEnabled || pages.some((page) => 'excerpt' in page.data)

  if (!hasExcerpt)
    pages.forEach(
      (page: Page<Record<string, unknown> & { excerpt?: string }>) => {
        page.data.excerpt = getPageExcerpt(app, page, {
          length: 300,
        })
      },
    )
}
