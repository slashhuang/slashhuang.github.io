---
title: webpack打包react机制研究
id: 250
categories:
  - Javascript
  - reactJS
date: 2016-01-14 12:50:15
tags:
---

用webpack打包react，涉及到原型链的时候，需要注意的几个问题。webpack执行顺序是先声明每个原型挂载在prototype上的方法。

`var Test2 = (function (_Test1) {
_inherits(Test2, _Test1);//匿名函数立即执行，挂载所有的prototype方法
function Test2(props, context) {//构造函数方法，在实例化的时候执行
_classCallCheck(this, _Test2);
**__Test1.call(this, props, context);_**//不断挂载在this对象上，继承
this.renderDisplay = this.renderDisplay.bind(this);
this.state = {
thumbNailIndex: 0
};}
var _Test2 = Test2;
Test2 = _utilsClassNameMixin2['default'](Test2) || Test2;
return Test2;})(_test1Js2['default']);
}
`
`针对_classCallCheck进行说明,这是ES6语法的检测，保证super函数调用在this之前，不对原型做任何操作！
"function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }"
`
`下面引一段react关于生成实例的源码
备注：这里只是引部分代码，inst为经历了各种继承关系(call)最后生成的this值.
// These should be set up in the constructor, but as a convenience for
// simpler class abstractions, we set them up after the fact.
inst.props = publicProps;
inst.context = publicContext;
inst.refs = emptyObject;
inst.updater = ReactUpdateQueue;
可以看到react在最后处理阶段，无论你在继承关系中做了什么，还是会把props,refs,context修正回来。至于其他的例如state等属性，则没有做最后修改，所以在extends的关系中，可以做的事情是state而不是props
`

*   重要的原型！！
*   在实例化构造函数的时候，所有的继承关系是通过apply，call的形式传递this值的，而不是通过new function的形式。
*   整个过程分为3步骤：

    *   生成所有的prototype构造函数
    *   生成所有的实例(this)继承关系
    *   由react接手最后的this，修改props,updater等保护属性，返回页面应用实例