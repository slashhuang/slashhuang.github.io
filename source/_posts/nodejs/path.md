---
title: node核心模块之path
date: 2016-07-20 13:49:08
tags:
- nodejs
---

# 引言
> path模块在nodejs中属于核心模块，目前状态是stable。  
> path模块提供了文件、目录等的使用机制。

### Windows vs POSIX
> 在Windows和posix[例如*nix等的可移植操作系统接口实现平台]中可以轻松使用同一套API来操作文件和目录。  
> 由于windows和POSIX使用不同的系统文件分隔符[一个是`\`,一个是`/`]。  
> 因此nodejs提供了path.win32[方法名称]和path.posix[方法名称]来处理不同开发环境对任何操作系统的路径兼容  

### 方法名列举
- basename[path[,ext]]  ===> 返回路径中的最后一块【和*nix系统中的basename命令基本保持一致】
- delimiter====> 返回不同操作系统中对于环境变量`process.env.PATH`的分隔符
- dirname(path) ===>  返回目录名称【和*nix系统的dirname命令基本一致】
- extname(path) ===> 返回参数的basename从末尾到最后一个`.`出现的值
- format(pathObject) ===> 参数是一个对象，就是将路径拆解了而已
- isAbsolute(path) ===> 返回一个boolean值，来表示是否参数为绝对路径形式
- join([path[,...]]) ===> 用系统路径分隔符来连接所有的参数，然后normalize返回的结果
- normalize(path) ===> 处理路径中存在的`\`、`/`、`..`、`.`等，和`cd`命令基本一致
- parse(path) ===> 处理路径为format的形式
- relative(from,to) ===> 返回从from到to需要resolve的相对路径
- resolve([path[,...]]) ===> 处理路径命令【类似cd】
- sep ==> 返回系统路径分隔符

