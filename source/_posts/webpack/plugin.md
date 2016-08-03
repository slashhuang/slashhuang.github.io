---
title: webpack少用的插件
date: 2016-08-03 23:00:14
tags:
- webpack
---


### 前言
> 之前捣腾angular2和typescript发现一些用的少,但是蛮犀利的webpack插件

### html-webpack-plugin
> 它可以将webpackConfig的数据,作为元数据渲染进html模板,借助这一点,可以做一些开发、生产环境的配置

### definePlugin
> 在全局环境中配置,自定义变量。一般在写框架或者组件的时候用的比较多

### providePlugin
> 提供动态require组件的便利性,也是神器

### webpack配置容易踩坑点
> resolve.alias记住要用path.resolve写成绝对路径啊,不然引用的时候加上一些莫名其妙的__dirname就纠结了。
> entry对象中,不要存在循环嵌套,不然webpack编译的时候,分分钟死循环啊

### process.cwd()
> 这个是个神器,用好了node的启动目录,就不必放心思在文件路径上了
