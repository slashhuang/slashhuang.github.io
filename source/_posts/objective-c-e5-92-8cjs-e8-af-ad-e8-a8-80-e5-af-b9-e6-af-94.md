---
title: objective-c和JS语言对比
id: 346
categories:
  - Javascript
date: 2016-02-18 10:22:14
tags:
---

1、语言类型:
OC:和其他强类型语言一样，会在执行前对所有代码进行编译。(compileTime + runTime)
JS 是脚本语言。浏览器会在读取代码时，逐行地执行脚本代码。(runTime)
2、数据类型:
OC:基本数据类型声明方式更细(stack)+引用数据类型(heap)
JS:基本数据类型(stack):Undefined、Null、Boolean、Number 和 String。
引用数据类型(heap)
**注意点:**
> 和OC类语言不同的是，string在ES中实现成了原始类型(primitive type)-typeof  null会返回 "Object"。这是 JavaScript最初实现中的一个错误，然后被 ECMAScript沿用了，解读成对象占位符。number类型(存储的时候总是64位的float)既可以表示 32 位的整数，还可以表示 64 位的浮点数。**对于浮点字面量的有趣之处在于，用它进行计算前，真正存储的是字符串。String 类型的独特之处在于，它是唯一没有固定大小的原始类型。同时，每个基本数据类型都对应一个引用类型，实际上在声明的时候是调用了对应的构造函数。例如：1.toFixed(2)是会报错的。而new Number(1).toFixed(2)是完全正确的**
3、数据类型声明方式:
OC:按照类型声明，并分配存储空间;
JS:var声明所有类型(同一个 var 语句定义的变量不必具有相同的类型)
还有个有趣的点，就是JS中的变量声明不是必须的。解释程序会查找变量是否声明，如果没有声明，就在全局作用域下声明变量。这个仅仅可以发生在预执行的阶段，在runtime如果这么做，会抛出异常的。
4、关键字:
OC会涉及到内存管理和多线程的一些关键字
JS中的关键词列举如下:(保留字就不列出了)
break case catch continue default delete do else finally for function if
in instanceof new return switch this throw try typeof var void while with。