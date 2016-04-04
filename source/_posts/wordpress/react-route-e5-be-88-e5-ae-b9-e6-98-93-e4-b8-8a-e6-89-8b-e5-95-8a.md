---
title: react-route很容易上手啊
id: 169
categories:
  - Javascript
date: 2015-10-09 08:51:13
tags:
---

react,angular,nodejs的路由方式如出一辙，写几点自己的体会把

1.  react对应路由的控制器是对应的component，而angular对应的就是各个模块下的controller，express框架直接使用对应的express实例的路由方法即可。
2.  react的路由还能够体现层级关系，通过this.props.children建立父子组件的联系，这一点不仅可以体现dom结构（react的虚拟dom实在不能忍），还能实现快速加载，当上级路由请求下级路有时，只需要加载对应的component即可。
3.  react-route官方教程代码出了点小bug，在选择路由方式的时候，需要手动引入history或者hash文件，并用new history()的方式创造实例。（这一点可能是我自己没有完全领会api所致）
4.  获取路由参数：通过this.props.params可以获取路径参数":params"的形式，对于query请求，则可以通过this.props.location.query获取query对象。
总体感觉react的路由和angular、express都挺像的.

坑集合：

1.  IndexRoute木有找到！！！？
2.  absolutePath木有用？
3.  Redirect from to 也木有用（写到这里可能是和配置路由方式有关？？？）