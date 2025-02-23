import comp from "/Users/huangxiaogang/work/slashhuang.github.io/docs/.vuepress/.temp/pages/index.html.vue"
const data = JSON.parse("{\"path\":\"/\",\"title\":\"Home\",\"lang\":\"en-US\",\"frontmatter\":{\"home\":true,\"title\":\"Home\",\"heroImage\":\"https://vuejs.press/images/hero.png\",\"actions\":[{\"text\":\"Ai工具\",\"link\":\"/deepseek.html\",\"type\":\"primary\"},{\"text\":\"Introduction\",\"link\":\"https://vuejs.press/guide/introduction.html\",\"type\":\"secondary\"}],\"features\":[{\"title\":\"Ai应用工具指南与云服务\",\"details\":\"如何利用Ai帮助你的工作与生活.\"},{\"title\":\"Ai开发学习\",\"details\":\"Ai的技术原理，包括大模型(LLM)、微调(Fine-tuning)等\"},{\"title\":\"Ai工具建设\",\"details\":\"围绕DeepSeek等的配套工具建设.\"}],\"footer\":\"Copyright © 2025-present slashhuang，公众号 slashhuang\"},\"headers\":[],\"git\":{},\"filePathRelative\":\"README.md\"}")
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
