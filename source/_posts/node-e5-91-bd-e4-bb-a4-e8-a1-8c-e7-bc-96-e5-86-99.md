---
title: node命令行编写
id: 352
categories:
  - Javascript
  - 技术及生活日记
date: 2016-02-25 15:20:17
tags:
---

nodejs在前端构建工具的使用中是非常普遍的，今天学习了下node的命令行编写形式，逻辑上来说还是很直观的，这个对创建自己的构建工具很有好处。
<pre>#!/usr/bin/env node //表明是node可执行文件,/usr/bin/env为二进制文件
声明了这个头之后，就可以直接使用nodejs支持的语法，进行所有你想要的操作了。相当简单。
如果要写构建工具的话，还需要了解node的I/O及file system操作机制。

如果不是unix系统的话，可以创建cmd后缀名的文件，node file%1的形式，%1代表cmd窗口命令行，其实也就是变个法子调用node进行代码执行而已</pre>
命令行编写颜色的原理 http://blog.soulserv.net/terminal-friendly-application-with-node-js/