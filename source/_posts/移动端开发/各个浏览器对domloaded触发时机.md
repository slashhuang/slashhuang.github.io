---
title: 移动端很容易忽略的东西
date: 2016-05-31 00:00:14
tags:
- 浏览器
- 移动端
---

## 引言
>1. 熟悉jquery的同学一定对ready函数非常熟悉，然而又有多少人对这个ready有个很好的认识呢。
什么才算DOMContentLoaded？
>2. 现在webpack流行，打包css为一个bundle有什么缺点？
为什么css文件必须要放在html头上，放在尾部会有什么后果

### 举几个例子
1. >setTimeout(()=>{},0)
>上面的这个函数肯定会在DOMContentLoaded之后触发
>重新摘录MDN对DOMContentLoaded事件的解释:
> The DOMContentLoaded event is fired when the initial HTML document has been completely loaded and parsed, 
> without waiting for stylesheets, images, and subframes to finish loading. 
> 重新摘录MDN对lLoad事件的解释:
> A very different event - load - should be used only to detect a fully-loaded page.

2. >第二个问题着实让我很头大。因为最近写了slide-swipe移动端手势库，
>发现如果采用webpack方案会让offsetWidth在ios模拟器里面取值出错，chrome和火狐浏览器是不会报错的。
> 这个很小的bug最后的解决方案是把css提取出来放在html头部。

### 再思考
1. 毕竟前端代码很多时候脱离不了浏览器，所以理解浏览器运行机制必不可少。
> 之前我翻译过浏览器的运行机制文章。正如文章所说: 渲染首屏页面依赖于cssOM和DOM两块，
> 如果没有css信息，最典型的一点就是没有layout布局。
> 有的浏览器是可以在加载外部css文件的时候触发重绘重排的，但是有的则要在下个循环做这件事。
> 虽然在js执行的过程中，如果对DOM执行setter和getter会触发重绘重排，但是这样得到的数据往往只是中间值。
> 比如element.offsetWidth等等，它的值是不精确的。

2. 针对上述问题，最好的方式莫过于把css放在头部，保证dom的layout信息比较完备，已经适合js来获取相关信息了。
> 这个问题实在是比较纠结，最好的方式还是看浏览器的渲染执行线。


### 学习过程中顺便发现的资料
[css优化策略](https://developers.google.com/speed/docs/insights/OptimizeCSSDelivery)

