---
title: react-native学习心得
date: 2016-03-21 14:27:39
tags: 
- react-native
---

## 开始学习react-native
做个大致的学习路线安排(各1天)
1. 路由系统及调试方式
2. Ajax系统
3. 表单系统
4. 列表界面

##### 端口占用
```
 sudo lsof -n -i4TCP:8081 | grep LISTEN &&  sudo kill pid
 
```

### 组件映射表
```bash
   ActivityIndicatorIOS=>animation
   DatePickerIOS=>日期组件
   Modal=>遮罩层
   Picker=>select
   RefreshControl=>刷新组件
   SliderIOS=>类似input volume
   StatusBar=>顶部状态栏
   Switch=>开关控件
   TabBarIOS=>底部导航栏

```

#### [中文文档](http://reactnative.cn/docs/0.21/getting-started.html)
