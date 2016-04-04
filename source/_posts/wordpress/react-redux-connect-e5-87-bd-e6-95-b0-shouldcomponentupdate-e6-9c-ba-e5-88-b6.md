---
title: react-redux connect函数 shouldComponentUpdate机制
id: 194
categories:
  - Javascript
date: 2015-11-26 07:55:42
tags:
---

react有了redux简直是如鱼得水，redux可以说是官方Facebook推荐的flux的稍高级版本。

1.  它的插件react-redux的connect修饰器，对store和dispatch函数进行了重新包装，对react的UI层面重新渲染，进行了shallowEqual(参见connect源码)，它的两个参数分别是previousState和nextState,只有两者的value不一致才会触发shouldComponentUpdate函数return true,进而触发react的UI 层面的rerender。
2.  由于javascript对于Object的比较只有reference比对，facebook官方也推崇使用immutableJS对state对象进行保护，增加UI层面的渲染安全性，同时immutableJS也实现了更多的数据结构，用起来也很方便。