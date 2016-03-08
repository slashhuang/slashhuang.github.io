---
title: React设计思想研究(2)--data-reactid及key
id: 292
categories:
  - reactJS
date: 2016-02-04 09:29:39
tags:
---

上一篇我们大概分析了react的虚拟dom和render及createElement该做的事情。现在把格局放大一点，考虑到之后数据模型修改，页面必须能够动态渲染，我们建立路标系统data-reactid与Dom进行mapping, 同时我们对react每个元素的props.children增加自定义key的权限。

上述做法的好处有以下几点:

1.  更新DOM节点: 在选择父元素等的时候直接拿data-reactid进行标示查找
2.  更新Dom的children元素:利用key可以保存相关dom节点的信息，避免在更新操作时，丢失原有数据。
React的view层面大概讲解到这边，具体的实现细节在上一篇文章中：虚拟DOM&gt;真实DOM信息这一点已经体现出来了。React真正的难点是它的DOM diff算法，之后我会针对dom diff进行更新