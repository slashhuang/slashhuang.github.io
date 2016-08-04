---
title: 使用gulp4
date: 2016-08-04 23:08:41
tags:
- gulp4
- webpack
---

### gulp4研究

> 今天正好写了个自动化打包、编译、上传的gulp脚本,采用的是最新的gulp4。  
> 借写完代码有点成就感的劲,稍微总结下gulp4和gulp3.X系列的使用区别 

### gulp4 vs gulp 3.X

> gulp本身的定位就是stream building system,典型的code-style就是```pipe``` 

> gulp4相比于gulp3.X系列在流式规范上更加的严格。  

### gulp4的api点

```javascript
    gulp.src   - Emit files matching one or more globs
    gulp.dest  - Write files to directories
    gulp.symlink - Write files to symlinks
    gulp.task   - Define tasks
    gulp.parallel   - Run tasks in parallel
    gulp.series   - Run tasks in series
    gulp.watch   - Run tasks in series
    gulp.tree   - Get the tree of tasks
    gulp.registry    - Get or set the task registry
```

> 光看api名字,可以看到多了```symlink,lastRun,parallel,series,tree,registry``` 
 
> 这几个API一看,就知道用了nodeJS的child_process,eventEmitter来处理并发、订阅等  

### gulp4 vs gulp 3.X区别细节
-  gulp3.x系列.

> ```gulp.task('name',[,taskArr],fn)```fn回调函数处理链式调用  

> 这里有个比较纠结的点,```fn/taskArr```等处理并发任务、序列化任务,在gulp3系列,必须包一层task,  
> 才能保证按照你想设定的顺序来执行,最后即使把项目写完了,后期看代码也会非常痛苦。

- gulp4系列

> 心得API点```parallel,series```允许你以树状结构安排并发、同步、异步任务,  
> 它们的实现原理也很简单,就是通常意义上的高阶函数,把任务作为参数,在函数体内重新组织即可。

> gulp4中```gulp.src```的严格要求,必须`return promise,return stream,callback()等`  
> 才能通知下个流执行
    
> gulp4中```gulp.tree```可以打印整个gulp4工作流中由内部算法生成的树状图,也比gulp3系列好很多。

### 总结
> 从```redux```引入高阶函数API开始,这种API设计在各个主流库中的应用真是无处不在   
> ```gulp4```尤甚

### 资料
[gulp插件集合](https://github.com/cssmagic/blog/issues/62)
[gulp任务管理父类](https://github.com/gulpjs/undertaker#custom-registries)
      
      

    
