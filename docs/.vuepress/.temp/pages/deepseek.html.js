import comp from "/Users/huangxiaogang/work/slashhuang.github.io/docs/.vuepress/.temp/pages/deepseek.html.vue"
const data = JSON.parse("{\"path\":\"/deepseek.html\",\"title\":\"deepseek周边工具\",\"lang\":\"en-US\",\"frontmatter\":{},\"headers\":[{\"level\":2,\"title\":\"复制粘贴工具\",\"slug\":\"复制粘贴工具\",\"link\":\"#复制粘贴工具\",\"children\":[]}],\"git\":{},\"filePathRelative\":\"deepseek.md\",\"excerpt\":\"\\n<p>deepseek作为主流的Ai聊天场景的工具，为了便于大家使用，把常见的工具列举如下。</p>\\n<h2><a class=\\\"header-anchor\\\" href=\\\"#复制粘贴工具\\\"><span></span></a><a href=\\\"https://slashhuang.github.io/ai-markdown-format-clipboard/\\\" target=\\\"_blank\\\" rel=\\\"noopener noreferrer\\\">复制粘贴工具</a></h2>\\n<p>由于deepseek复制出来的是markdown格式，导入到类似微信公众号等地方非常不方便，因此就有了如下的工具来解决这个问题。\\n</p>\"}")
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
