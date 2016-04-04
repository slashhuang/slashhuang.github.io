---
title: requireJs学习心得
tags:
  - requirejs
id: 94
categories:
  - Javascript
date: 2015-07-24 04:18:32
---

主要机制

1.  RequireJS的目标是鼓励代码的模块化
2.  它鼓励在使用脚本时以module ID替代URL地址
3.  RequireJS默认假定所有的依赖资源都是js脚本，因此无需在module ID上再加".js"后缀，RequireJS在进行module ID到path的解析时会自动补上后缀
4.  <span class="tag">&lt;<span class="keyword">script</span><span class="attribute"> data-main=<span class="value">"js/app.js"</span></span><span class="attribute"> src=<span class="value">"js/require.js"</span></span>&gt;</span><span class="tag">&lt;/<span class="keyword">script</span>&gt;</span>

5.  data-main主函数入口

### AMD规范全局变量<a name="user-content-global"></a>

本规范保留全局变量"define"以用来实现本规范。包额外信息异步定义编程接口是为将来的CommonJS API保留的。模块加载器**不应**在此函数添加额外的方法或属性。

本规范保留全局变量"require"被模块加载器使用。模块加载器可以在合适的情况下自由地使用该全局变量。它可以使用这个变量或添加任何属性以完成模块加载器的特定功能。它同样也可以选择完全不使用"require"。