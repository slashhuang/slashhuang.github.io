---
title: 异步加载script脚本说明
id: 201
categories:
  - Javascript
date: 2015-12-04 03:13:56
tags:
---

http://www.cnblogs.com/tiwlin/archive/2011/12/26/2302554.html

任何以appendChild(scriptNode) 的方式引入的js文件都是异步执行的 (scriptNode 需要插入document中，只创建节点和设置 src 是不会加载 js 文件的，这跟 img 的与加载不同 )

摘录一段MDN的官方说明：

[2] Starting in Gecko 2.0 (Firefox 4 / Thunderbird 3.3 / SeaMonkey 2.1), inserting script elements that have been created by calling `document.createElement("script")` into the DOM no longer enforces execution in insertion order.