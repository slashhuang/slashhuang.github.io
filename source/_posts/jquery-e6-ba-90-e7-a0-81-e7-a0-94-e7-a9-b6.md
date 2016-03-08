---
title: jQuery源码研究
tags:
  - javascript
id: 96
categories:
  - Javascript
date: 2015-07-24 09:36:12
---

<pre>jQuery.each( ("blur focus focusin focusout load resize scroll unload click dblclick " +
   "mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave " +
   "change select submit keydown keypress keyup error contextmenu").split(" "), function( i, name ) {

   // Handle event binding
   jQuery.fn[ name ] = function( data, fn ) {
      return arguments.length &gt; 0 ?
         this.on( name, null, data, fn ) :
         this.trigger( name );
   };
});</pre>
类似$(document).click(console.log(hello)),实际上并没有将函数挂载成callback机制，不需要data,即可运行，因此控制台输出hello就结束了，事件没有绑定成功。
<pre>document.onclick=function(data){
    console.log(data);
}</pre>
点击浏览器窗口后，data输出MouseEvent 对象进一步说明callback机制。

写到这，不得不赞叹下JS中存储数据的对象机制，完全的OOP模式有木有。

看样子JS这门语言还是很精妙的

&nbsp;