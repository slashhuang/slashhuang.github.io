---
title: 利用CSS的border-width画等腰直角三角形
id: 196
categories:
  - Javascript
date: 2015-11-26 15:24:19
tags:
---

1.  <span class="webkit-css-property styles-panel-hovered">border-width</span>: <span class="value">5px 5px 0</span>;
2.  <span class="webkit-css-property">border-style</span>: <span class="value">solid</span>;
3.  border-color:#fff transparent
4.  width:0;
5.  height:0
就这么简单，试下会发现有神奇效果。想了下原理，应该是把border 的四个方向管辖区域单独拿出来，因此对于一个正方形来说，一条border显示自然就是个等腰直角三角形