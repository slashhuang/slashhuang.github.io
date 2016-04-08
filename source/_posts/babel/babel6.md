---
title: babel6配合webpack-loader多坑点
date: 2016-04-07 16:34:33
tags:
- babel
---
## 前沿
> 前端框架react+webpack在利用ES6/ES7的语法层面，相比于AMD规范借用requireJS 
> 之流，可以避免预先配置脚本依赖等繁琐工作，而更快速的开发网站。
> webpack里面有个重要的loaders对象用来解析相关脚本或者css
> 其中对js的解析用到一个很重要的loader====> babel

### 喜当爹的babel6
>  在半年前，babel还是5开头的版本号，使用起来真是简单方便
> 没想到，babel的开发人员为了js的未来，于15年末将babel推向了6系列。
> 比较坑爹的一点是，babel6和babel5系列，配置方式基本不兼容!!!
> 对于不明真相、用惯babel5系列的同学简直就是坑了个爹

###  babel官网的相关论述
- 本来只需要安装一个babel5的东西被拆分成了babel-cli+ babel-core
- babel6需要根据需求进行插件(plugins)安装和预设(presets)
- 相同的一点是plugins和presets都可以在.babelrc中配置

### babel 组成
- babel6本身就是由一大堆的插件组成体系
- 对于细节化的插件可以通过babel-preset-es2015与babel-preset-react完成
- stage选项被 类似{"presets": ["stage-2"]}代替

### 终极方案.babelrc(with npm install the listed dependencies)
``` bash
{
  "presets": ["es2015",'react']
}
```

### webpack之loader
- 链式(类似gulp使用中的pipe方法，最后一项返回结果)
- 接受query参数，用于传递给相关loader
- Plugins可以带给相关loader更多特性

