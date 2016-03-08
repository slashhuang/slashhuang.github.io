---
title: javascript变量提升及闭包
id: 264
categories:
  - Javascript
date: 2016-01-24 16:00:33
tags:
---

前端工程师在写页面JS的时候很少会关注到编译的情况,更多的是看执行的结果，然后根据相应的报错信息修正代码。在javascript的世界里，scope的作用域概念存在于函数中，当函数运行到某行代码需要查找某个变量时，编译器会在当前函数作用域下查找该变量，如果没有找到则继续往上一层函数作用域查找，这个过程会一直持续到全局作用域，如果没有找到相应变量，则抛出报错信息。

在JS中存在这样的代码，
<pre>console.log(e());//打印e
function e(){
  console.log('e')
}</pre>
这个是很令人费解的，在执行第一行代码的时候，编译解析器并没有执行到funtion哪一行，为何还是能打印出字符呢？ 这个问题的答案在于，JS执行每个函数作用域时，会把所有的变量按照local,global,closure分类声明，同时将以var声明的变量赋值undefined，将所有以funtion func(){}形式定义的函数放在FUNCTIONS里面，function在JS中是一级对象，它们可以拥有属性和方法，无论何时都会返回值，当用new形式加载function时，返回this值，除了显式定义return,其它的情况都是返回undefined。

回到正题，当JS在碰到每个函数作用域时，会先声明完函数作用域的本地变量同时对所有在函数体内引用到的外界变量创建closure。在closure里面存储的变量有个神奇的地方，它会对它以内所有代码检查一遍是否存在引用上下文变量的情况，如果存在则将变量添加进clousure，由此也可以窥见为何递归在JS中容易出现栈溢出的情况。具体的测试，见下方代码
<pre>var ddd='ddd';// t的上下文变量
function e(){//t的上下文变量
  console.log('e')
}
var t= (function foo() {
    debugger//查看执行时候，变量存储形式
    var x = 1;
    var test='test';
    return function () {
        return function(){
            console.log(e)
            console.log(ddd)}
        };
}());</pre>
在debugger区域你可以看到，debugger区域里面的closure已经存储了e和ddd变量(图片支持的不是很好，不贴了，直接把数据结构给出)。

*   local:this
*   closure:ddd='ddd'
Functions:e(){}
*   global
好了，做到这一步，基本可以看清楚javascript函数作用域的一些scope变量存储及作用域提升的细节：闭包就是一个函数创建时候的上下文(context)绑定，而变量提升则是JS在执行前做的一些分类变量类型(global,closure,local,Functions)的声明工作,其实也是比较能够理解和简单的。

在我看来，对于前端工程师来说，充分利用JS函数作用域的特性，采用闭包缓存全局变量加快代码执行速度，利用JS语法的灵活性来更好的规划代码，这是比较好的。