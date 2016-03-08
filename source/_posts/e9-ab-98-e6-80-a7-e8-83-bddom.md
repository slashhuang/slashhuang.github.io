---
title: 高性能dom
id: 216
categories:
  - Javascript
date: 2015-12-18 16:07:52
tags:
---

前几天翻译了一下谷歌关于浏览器工作原理的英文文献，今天看了高性能javascript一书，稍微记录点新的知识点。内容整体比较粗糙：

最大的原则：

*   JS和html的交互是性能昂贵的；
*   触发浏览器重绘重排也是性能损耗大的。
解决方案：

1.  使用document的createDocumentFragment()方法，创建文档片段，只触发一次重排和访问一次实时dom.
2.  缓存dom数据
3.  api 尽量选择querySelectorAll()，避免其它类似getElementById对应实时html结构的api操作
4.  行内样式选择ele.style.cssText一次写入，充分利用浏览器自身以渲染队列处理dom重绘的性质，避免操作的时候又进行类似ele.style.color等的读取操作。
5.  选择冒泡的方式进行全局处理事件代理，减少监听大量事件回调函数带来的任务队列性能损耗，只是这时多一层对e.target||e.srcElement的检测而已。主流的react,angular框架都多少采用了这种处理方式。
6.  在大量操作dom的时候，临时隐藏目标dom。避免重排reflow和repaint带来的性能损耗
7.  采用javascript创建虚拟dom