---
title: react高性能研究
id: 190
categories:
  - Javascript
date: 2015-11-25 16:40:44
tags:
---

避免重复渲染DOM结构

1.  通过构建虚拟DOM,当有不同的时候选择运行效率最高的路线渲染需要被改变的dom节点
2.  提供加载周期的`shouldComponentUpdate函数，` 它会在 re-rendering   (虚拟dom比较和渲染)之前执行，提供给了开发者新的接口加速整个过程。【默认情况下shouldComponentUpdate返回为true】