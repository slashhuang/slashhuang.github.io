---
title: css-ellipsis高性能
date: 2016-04-08 11:36:51
tags:
- css
- ellipsis
---

### 前言
> 做前端的同学大部分都用过ellipsis，一般用于对字符串进行展示并添加'...'以进行展示
```css
    white-space:nowrap; //文本不会换行，文本会在在同一行上继续，直到遇到 <br> 
    text-overflow:ellipsis;
    overflow:hidden
```

> 以上代码的局限性在于仅仅对一行文本做这种处理，不能处理多行文本。

### 解决方案
> 笔者经过网上资料的查找，发现webkit-line-clamp在webkit内核浏览器中，非常适合对多行文本进行处理。  
> 设置方式如下
``` css
     text-overflow: ellipsis;
     display: -webkit-box;
     -webkit-line-clamp: 2;
     -webkit-box-orient: vertical;
```
