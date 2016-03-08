---
title: nodejs 核心模块fs及path方法实例
id: 206
categories:
  - Javascript
date: 2015-12-08 09:47:25
tags:
---

fs模块提供了node和本地资源交互的I/O接口,具体的列举如下

1.  readFile(path,callback)： 读取本地文件，Unit8Array的形式存取数据，toString()方法即可将其转换成普通字符串。
2.  mkdir(filepath,callback):创建本地目录，支持'.''../'类似这样的相对路径创建
3.  unlink(path,callback):删除本地文件.
4.  **createReadStream write<b>ReadStream等方法**</b>
path模块提供了获取目录及文件的多种信息，具体如下

1.  basename(),dirname(),extname()都接收一个路径作为参数，分别返回对应的文件名，目录名，后缀名
2.  resolve(rel-path),relative(path)分别接收相对路径和路径作为参数，resolve相当于linux里面shell的cd命令，realtive返回相对路径
formidable(非核心)模块提供了处理文件上传form-data数据类型的方法。

1.  通过设置uploadDir和调用parse的回调方法，存取目录，默认通过设置随机数+'upload_'的形式设置文件名，可以通过fs.rename(oldpath,newpath)进行重命名。