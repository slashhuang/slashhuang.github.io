---
title: JS的callback机制研究
id: 140
categories:
  - Javascript
date: 2015-09-06 09:49:58
tags:
---

针对JS的callback机制，今天写了下代码模拟，应该可以代表callback的部分层面
<pre>var callback =function(test){
    if(typeof test == 'function'){
       var  args=['test']
        test.apply(this,args)
    }
};
var testCallback =function(res){
    console.log(res);
};

callback(testCallback)

</pre>

##### 上面运行的结果就是  ‘test’。

callback的应用场景很多，在Ajax中尤其如此。参数设定的形式应该是采用apply的方式。