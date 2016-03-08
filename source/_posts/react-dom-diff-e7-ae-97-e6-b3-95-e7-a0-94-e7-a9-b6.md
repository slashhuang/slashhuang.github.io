---
title: react-dom-diff算法研究
id: 188
categories:
  - Javascript
date: 2015-11-25 02:56:12
tags:
---

dom-diff算法改变的深度，顾名思义仅仅局限于dom层面，对于数据修改的css等dom属性层面，react并不会去检查，并根据数据重新进行渲染。

相比于将检查深度加深至dom的样式或者data-标签等，react采取这样的算法的好处是可以充分利用react的虚拟dom-diff算法：仅仅在dom发生改变的时候才会去渲染改变的dom节点。并且这种操作也仅仅限于改变dom的父节点以下，对于以上节点，react会默认不去做任何变动，即使以上节点的样式或者data-标签的数据和整个model有关联关系。   了解了这一点之后，在react写应用的时候应该充分利用dom-diff,尽量将dom写的一致,充分利用react改变dom的性能，在样式操作的时候采用原生js进行配合使用。

测试代码：参见我的github地址：[https://github.com/slashhuang/react-dom-algorithm](https://github.com/slashhuang/react-dom-re-render)

&nbsp;