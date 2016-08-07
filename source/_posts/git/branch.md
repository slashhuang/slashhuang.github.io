---
title: 使用git修改fetch的默认行为
date: 2016-08-07 23:08:41
tags:
- git
---

### 引言

> 去年这个时候,大概的把git的官方英文文档看过一遍,但也只是理解了整个命令体系的原理。
> 对于具体的命令使用形式,却还是存在一些不全面的地方。

### git修改fetch默认行为

```
   git config --get remote.origin.fetch
   git config remote.origin.fetch "+refs/heads/*:refs/remotes/origin/*"
```


      

    
