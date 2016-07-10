---
title: react-native布局及tab导航
date: 2016-03-28 14:27:39
tags: 
- react-native
---

### 坑点
- 布局样式方面
> justifyContent和alignItems根据flexDirection来控制横纵轴布局
> 样式编写要按照组件名进行归类，保证UI的正确渲染

- 组件层面
> 浏览器中原生的input默认会有一定的宽度，但是TextInput是没有的，需要手动添加

- 图片加载方面
> 在xcassets中添加，对图片文件名格式要求有@1x @2x @3x 并会生成JSON文件适配不同屏幕
> 


