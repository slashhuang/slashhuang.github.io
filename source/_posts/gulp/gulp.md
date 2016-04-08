---
title: gulp再研究
date: 2016-04-07 17:08:41
tags:
- gulp
---

### gulp再研究

- 术语
    - glob模式: shell 所使用的简化了的正则表达式。可以参考npm的glob模块
    
- api
    - gulp.src(globs[, options]) 按照globs规则定义输入数据流
    - gulp.dest(path[, options]) 定义输出流
    - gulp.task(name[, deps], fn) 定义任务
    - gulp.watch(glob[, opts, cb]) 添加事件监听
    
- 管道
    - pipe(gulp的每个操作返回一个stream)，调用node的fs模块方法，进行IO操作
    
    
      

    
