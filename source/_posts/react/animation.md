---
title: react-native动画
date: 2016-03-29 17:27:39
tags: 
- react-native
---

### 主要观点
> RN提供了Animated组件来提供易于构建和维护的动画效果
> 学习曲线完全可以参照css3的transform和@keyframes方式

### 代码流程
- 只有声明可动画化的组件Animated.Image,Animated.Image,Animated.View等关联动画
- 初始化实例变量,最常见的就是 var s= Animated.Value(0);
- 将实例变量绑定组件的style属性,例如:{opacity:s}
- 在Animated.sequence里面定义动画队列数组,每个动画序列可以采用Animated.timing或者Animated.decay等定义时长或者延迟效果
- 在style属性中定义transform数组，每个数组都是个key(属性),value(利用interpolate更新的值)

###  talk is cheap ,show me the code,具体实现请看[demo](https://github.com/slashhuang/react-native-demo)
### [RN动画中文文档](http://reactnative.cn/docs/0.21/animations.html)



