---
title: JS 的closure闭包理解
id: 92
categories:
  - Javascript
date: 2015-07-23 07:31:05
tags:
---

在JavaScript当中存在大量的异步函数应用场景。尤其在操作DOM树的时候，挂载到相应事件的函数往往都是匿名函数（直接就是function（）{}）；由于匿名函数一经调用立即执行的特性，函数体内部的变量并不分配独立的内存空间，而是指向当前函数体所在环境的变量引用。

例如FOR循环当中：

例子一：
<pre>var arr =[];
(function(){
    for(var i= 0;i&lt;5;i++){
        arr[arr.length] = (function(<span style="color: #ff6600;">i</span>){
            return function () {
                    <span style="text-decoration: underline;">return i</span>
                }
        })(i)
    }
})();

console.log(arr[3]())</pre>
如上所示的代码最后的结果是3,最后下滑线标注的return i所指向的内存地址是橙色变量开辟的。

例子二：
<pre>var arr =[];
(function(){
    for(var i= 0;i&lt;5;i++){
        arr[arr.length] = (function(i){
            return function (i) {
                return i
            }
        })(i)
    }
})();

console.log(arr[3]())</pre>
上例的结果是undefined；因为匿名函数中的参数i，创建了暂时的内存区域并没有赋值。

例子三：
<pre>var arr =[];
(function(){
    for(var i= 0;i&lt;5;i++){
        arr[arr.length] = function(){
            return function () {
                return i
            }
        }
    }
})();

console.log(arr[3]()())</pre>
代码运行的结果是5。原因是函数运行结束后，由于匿名函数指向的变量i来自它所处的环境，本身匿名函数并没有新开辟存储空间，所以在循环结束后，return的i值依旧是5。

例子四：

闭包的另外一种形式，是显式的定义函数
<pre>var arr =[];
(function(){
    var fun =function(j){
        return j
    }
    for(var i= 0;i&lt;5;i++){
        arr[arr.length] = fun(i)
    }
})();

console.log(arr[3])</pre>
代码运行结果是3，因为fun(i),形参开辟了临时内存存储变量i的值，而不是指向i的实际内存地址。