---
title: 前端框架探讨
date: 2016-04-15 17:41:07
tags:
- design-patterns
- 框架
---

## 前言
> 前端框架这两年迭代速度很快，其中的React以虚拟dom的开发思想在各大公司得到应用推广。
> AngularJS 和 Vue也紧跟不舍，有着自己的社区与粉丝群。
> 这篇文章就简单的探讨下这几个框架的架构思想与发展

## 架构模式的几个概念
- MVVM : model view viewModel
- MVC : model view controller
- MVP : model view presenter

## 传统前端架构
-  script标签引入脚本:以jquery为典型,
-  配合amd规范进行包的管理: 以require.js和sea.js为典型
#### 这种前端架构方式有以下这几个特点
* 一个html页面对应一个脚本文件
* view层就是html
* model和controller未分离
* 没有数据流的概念，开发人员往往不敢去修改之前的代码
###### 小结
> 传统的开发方式，model的概念存在于controller之中，没有进行分离
> js脚本的各个function也没有明确的角色定位
> 只有dom操作，没有


