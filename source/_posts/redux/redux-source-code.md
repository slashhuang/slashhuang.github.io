---
title: redux源码拆解
date: 2016-03-14 15:23:30
tags: redux
---

## redux源码拆解分析
## 对于初学者比较纠结的有2点
>1. 函数式API
>2. flux数据流的多个概念
---

###  redux的数据流思想
- action  ==> store数据的唯一来源
- dispatch  ===> 分发数据到reducers 
- reducer  ===> 指明应用如何更新数据至Store

###  redux主要暴露给外界的函数式API
```javascript
    {
        dispatch,//更新操作函数
        subscribe,//推送监听到观察者列表
        getState,//获取数据模型
        replaceReducer//重置store
    }
```


## 函数式API的处理
>redux中使用了很多函数式的API，这类API的一个特点就是使用闭包将逻辑封闭在黑盒子里面。  
>redux暴露的四个API是setter和getter的变体

#### 下面针对redux的源码配置进行函数式API的说明

```javascript

    //引入redux库
    import { createStore, combineReducers, applyMiddleware } from 'redux'
    //添加中间件logger和crashReporter
    let createStoreWithMiddleware = applyMiddleware(logger, crashReporter)(createStore)
    //封装reducers
    let todoApp = combineReducers(reducers)
    //创建redux的store
    let store = createStoreWithMiddleware(todoApp)
```
>上述代码不像类似react或者angular/vue之类的前端UI框架更多的关注UI逻辑，API也比较易懂   
>redux的函数式API体现着数据的流向，利用层层闭包将所有的信息最后集成在return的结果里面
>每个函数都是一个工厂，提供着数据整合的功能

#### 函数式编程还是看源码会比较清楚，之后在更新~~

[我写了个redux的源码注释，提取出了比较精华的部分，欢迎fork](https://github.com/slashhuang/redux-annotation)
