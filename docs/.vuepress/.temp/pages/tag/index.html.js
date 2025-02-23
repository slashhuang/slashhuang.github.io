import comp from "/Users/huangxiaogang/work/slashhuang.github.io/docs/.vuepress/.temp/pages/tag/index.html.vue"
const data = JSON.parse("{\"path\":\"/tag/\",\"title\":\"Tags\",\"lang\":\"en-US\",\"frontmatter\":{\"title\":\"Tags\",\"sidebar\":false,\"blog\":{\"type\":\"category\",\"key\":\"tag\"},\"layout\":\"Tag\"},\"headers\":[],\"git\":{},\"filePathRelative\":null,\"excerpt\":\"\"}")
export { comp, data }

if (import.meta.webpackHot) {
  import.meta.webpackHot.accept()
  if (__VUE_HMR_RUNTIME__.updatePageData) {
    __VUE_HMR_RUNTIME__.updatePageData(data)
  }
}

if (import.meta.hot) {
  import.meta.hot.accept(({ data }) => {
    __VUE_HMR_RUNTIME__.updatePageData(data)
  })
}
