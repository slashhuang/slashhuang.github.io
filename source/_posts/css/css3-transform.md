---
title: css3-transform高性能
date: 2016-04-08 11:36:51
tags:
- css
- 性能
---

### 前言
> css的性能问题，在前端项目中很少被关注到，这是个很大的遗漏点。
> 实际上如果启动GPU加速，优化main线程和layout线程，可以让页面动画更加顺畅呢！

### 主线程和layout线程
- 主线程主要负责以下工作：
    - 运行JavaScript
    - 计算HTML元素的CSS样式
    - 布局页面
    - 把页面元素绘制成一个或多个位图
    - 把这些位图移交给排版线程
    
- 排版线程主要负责以下工作：
    - 通过GPU渲染位图，并显示在屏幕上
    - 向主线程请求更新位图的可见部分或即将可见的部分
    - 判断出当前页面处于可见的部分
    - 判断出即将通过页面滚动而可见的部分
    - 随着用户滚动页面来移动这些部分（译者注：可见部分的和即将可见的部分）
    
    
### 线程如何合作
> 当用户滚动的时候，layout线程向主线程请求更新显示部分位图.
> 当页面变化时，layout线程尝试以每秒60帧的速度重绘页面。

### GPU
> GPU定义: 图形处理器(graphics processing unit)，是显卡的处理器

### 处理transition
``` css 

    div {
        height: 100px;
        transition: height 1s linear;
    }
      
    div:hover {
        height: 200px;
    }
```

### 启用transform
``` css 

   div {
       transform: scale(0.5);
       transition: transform 1s linear;
   }
     
   div:hover {
       transform: scale(1.0);
   }

```

### 图解浏览器对css动画的处理过程
- transition处理过程
<img width=300px src='/img/css/transition线程.png'>


- transform处理过程
<img width=300px src='/img/css/transform线程.png'>
    
