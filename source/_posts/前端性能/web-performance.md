---
title: web_performance
date: 2016-06-02 00:36:57
tags:
- 性能
---

### 引言
> 关于性能问题一直是现代前端工程必须讨论的话题,这是一篇小总结和资源收集的博客.

### 淘宝、百度、大众点评的方案对比
- 百度: 采用前端架构工具fis，采用hash算法进行文件级别的版本控制，典型的资源URL:http://xxx.a_1232.js
- 淘宝: [虽然我没去过阿里]，采用开发版本号进行代码管理,典型的资源URL:http://g.alicdn.com/tb-page/taobao-home/0.0.62/index.css
- 大众点评: 和淘宝方案类似,采用架构工具cortex进行开发版本层面的代码控制,依赖于cortex.json进行代码发布.url形式和淘宝类似。

### cache-control
> 当然，对比下来，百度的方案是最优的，技术含量上面也可以说最高。
> 主流的大公司都会设置cache-control很长的时间，尽量优化网络请求。
> 淘宝采用了dns-prefetch进行TCP优化[对流量大的电商网站来说，这确实能节约不少时间]

## 总结
- 配置超长时间的本地缓存 —— 节省带宽，提高性能
- 采用内容摘要作为缓存更新依据 —— 精确的缓存控制
- 静态资源CDN部署 —— 优化网络请求
- 更资源发布路径实现非覆盖式发布 —— 平滑升级

#### 参考资料
[百度前端工具架构师](http://www.infoq.com/cn/articles/front-end-engineering-and-performance-optimization-part2)
[百度fis官方网站](http://fis.baidu.com/)