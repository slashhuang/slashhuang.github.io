---
title: requirejs代码解析路径
tags:
  - requirejs
id: 104
categories:
  - Javascript
date: 2015-07-25 06:24:19
---

这两天学习了下requirejs，还是通过

*   研究部分源码
*   研究内存变量
[![内存变量](http://120.26.69.71/wp-content/uploads/2015/07/内存变量-300x128.png)](http://120.26.69.71/wp-content/uploads/2015/07/内存变量.png)

可以看到无论代码多么简单，内存中都回存在filename和dirname变量，这是程序解析代码文件路径始终存在的变量。

在解析require依赖的模块路径时，如果没有设置baseurl,则baseurl默认值为html所在文件的dirname;这一点是基础。然后requirejs按照baseurl+path的方式寻找依赖模块，进行后续加载

&nbsp;