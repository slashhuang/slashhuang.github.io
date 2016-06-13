---
title: 模板引擎小尝试
date: 2016-06-09 00:19:48
tags:
- template
---

## 引言
> 模板引擎是现在前端框架必须处理的一部分，无论是DOM层面还是V-dom层面，各有各的实现。
> 最近正想尝试下自己写套模板引擎，也在借鉴一些主流的库的写法。
> 这篇博客将会针对模板引擎持续更新研究结果。

## dom层面的模板引擎
##### 1.基本功能规划
1.支持数据填充
2.支持简单的JS表达式
##### 2.功能实现规划
1.利用正则匹配特定的标示，比如<%%>等
2.对于简单的JS表达式，转化为函数形式
3.采用 new Function('identifier',functionString)生成函数

## 代码地址:
1. domString层面的模板引擎处理,点击如下链接
[github开源地址](https://github.com/slashhuang/template-engine/blob/master/js/template.js)

>夜深了，不能搞太晚，后续文档之后补上。mark下代码时间 [16.6.9 01:25]

