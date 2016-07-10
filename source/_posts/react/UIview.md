---
title: react-native之UI界面
date: 2016-03-23 20:27:39
tags: 
- react-native
---

## 前言
> 今天整理下react-native在UI布局方面的代码心得

## 布局采用flex-box布局以及部分盒模型的异同点
- 横纵轴的布局属性基本保持一致
> justifyContent,alignItems,alignSelf等等
- flexDirection默认为column
- 增加paddingHorizontal和paddingVertical
- 增加marginVertical和marginHorizontal
- 所有的样式属性名都用camelCase的形式
- 颜色的名字采用[ CSS3 specification规范](https://www.w3.org/TR/css3-color/#svg-color)
- 踩坑点:父类元素不需要设置relative
#### 小结:
>由于react-native实际上是对原生UI组件的一个polyFill，所以在选型上选择了操作
 性更好的flex-box布局形式，同时配合盒模型 
 
## 页面路由导航
> Navigator基本就是栈队列的结构,组件提供了丰富的API供外界调用.
> 基本不用自己做特殊的封装
 
## 事件及触摸处理
- 封装了基本所有的触摸情况，不需要二次开发
- 对需要处理的事件的UI都需要包裹事件标签，例如TouchableHighlight等等

> 今天的成果=》模拟网上的项目，做了个首页
<img src='/img/work/react-native-day1.jpg' width='50%'>

==================3月24日更新=============
### 2016.3.24日今天完成了webView和照片浏览插件
> webView中使用了progressBar组件，而slider使用的是react-native-swiper插件

#####  具体实现细节后期更新，界面实现见下图
<div style={width:100%;}}>
<img src='/img/work/imgSlider.jpg' width='50%'>
<img src='/img/work/webview.jpg' width='50%'>
</div>


 
 



