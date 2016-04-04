---
title: ReactJS 学习心得
id: 150
categories:
  - Javascript
date: 2015-09-26 17:04:10
tags:
---

react的模板语法为JSX。

1.  它可以使用HTML的&lt;&gt;tags
2.  它可以利用{}调用javascript语法
3.  v0.14的版本前, React 使用 `JSTransform.js` 解析type=text/jsx的react模板现在则需要使用&lt;script type="text/babel"&gt;的形式定义模板，并引入browser.js来解析。
4.  react 中的render方法，将jsx解析成HTML并挂在至相关dom，render按照字符串的形式操作对{}作为分界符的string，添加span标签.render内容必须以&lt;开头，&gt;结尾。
5.  数组。模板在解析时会调用数组的concat方法转换成字符串,并按照key/value为单位优先调用span标签包裹
定义组件

1.  react调用React.createClass创建组件类，并采用HTML的tag&lt;&gt;形式实例化类，组件可以拥有属性[attributes],用法和HTMLtag类似,并在createClass中调用this.props['attribute']使用它们_<u>（这点实在像javascript的构造函数this.prototype）。</u>_
2.  react使用this.props.children,可以获得当前this的各个子节点
3.  在react.createClass中的React.propTypes可以定义当前模板的<u>必须</u>字段及类型。这个用法和prototype【继承】非常类似。因此如果在实例中定义相应字段将会产生override的现象
4.  一般情况下this.state 描述组件的状态,因交互而改变【这点实在太像angular】而 this.props一般是静态的属性名称，=—=类似dom【props】和var【state】的绑定
查找组件中的dom节点

1.  调用React.findDOMNode(this.refs['refName']),即可找到对应的dom节点,可以采用原生JS的方法操作它。注意！！只有dom中已经挂载了对应dom才可操作，不然得到null的结果,因此该方法一般放在eventHandler里面。
2.  每次调用函数后，react会重新render数据，这点实在像是angular里面的scope，两种语言的设计方面还真是很相似。
3.  经过测试这个refs['refName'],对应的value只是单个dom引用，没有数组的方法。【可能有坑，待证实】

* * *

元素生命周期【关于这一点姑且贴段代码吧】

*   componentWillMount()
*   componentDidMount()
*   componentWillUpdate(object nextProps, object nextState)
*   componentDidUpdate(object prevProps, object prevState)
*   componentWillUnmount()
*   componentWillReceiveProps(object nextProps): invoked when a mounted component receives new props.
*   shouldComponentUpdate(object nextProps, object nextState): invoked when a component decides whether any changes warrant an update to the DOM.
AJAX渲染

1.  `this.setState()` 触发 UI的重新渲染
只是写了部分react的内容~

* * *