---
title: react 对循环warning提示增加key的研究
id: 254
categories:
  - Javascript
date: 2016-01-22 12:23:19
tags:
---

今天写了个关于react中处理key的测试，代码见我的github:   https://github.com/slashhuang/react-dom-re-render.git 主要的观点有以下几点： react的key关乎到react的dom-diff算法 react中对于dom的操作是根据生成的data-reactid进行绑定的，添加key可以保证dom结构的完整性，而不会根据react自己对dom进行的标记重新分配 。