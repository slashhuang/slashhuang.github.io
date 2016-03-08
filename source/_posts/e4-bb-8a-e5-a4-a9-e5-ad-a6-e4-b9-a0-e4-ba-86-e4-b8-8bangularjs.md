---
title: 今天学习了下angularjs
tags:
  - angularjs
id: 85
categories:
  - Javascript
date: 2015-07-21 05:26:35
---

今天花了一个上午看完了外文W3C的Angularjs教程,还是比较通俗易懂的。

angular在DOM 和数据即时交互方面确实高人一筹，直接在DOM 加上它自身定义的API 标签，即可实现数据的实时获取，并且存储进一个叫$scope的变量对象。这个$scope有点类似EJS模板中的locals，包容了所有的本地数据，整个语言结构就是个巨大的对象（DOM本身也是个巨大的对象）来实现操作。

它的API还是很友好的，加上前缀“ng-”即可将自定仪的数据转化为$scope变量，其他的function基本和jQuery中的函数很像。

美中不足的是，市面上应用angular的貌似并不多，虽然它的模块Size很大，但是确实是很优秀的框架。anyway，希望今后有机会用到angular吧