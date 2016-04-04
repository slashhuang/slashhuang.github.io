---
title: git 命令汇总
id: 132
categories:
  - Javascript
date: 2015-08-15 15:51:13
tags:
---

今天写程序git用的有点疑惑，重新温习下常用命令：

1.  git config --edit   修改git配置文件
2.  git config --list     列表输出git配置文件
3.  `git clone 的ssh 方式      git``@server:path/to/repo.git`
4.  git status --short 简要列出当前状态
5.  .gitignore文件支持正则表达式。#为注释，！为取消特定文件
6.  git commit  -a -m "message" -a作用是update
7.  git log -p -[num]     显示最近num次commit的diff
8.  git config --global alias.[arg] [cmd[arg]] 为git命令指定别名
9.  git branch -d(-D) [branchName]   删除本地分支
10.  git push origin --delete [远程分支] 删除远程分支