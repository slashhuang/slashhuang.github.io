---
title: redux 学习笔记
id: 163
categories:
  - Javascript
date: 2015-10-04 09:00:50
tags:
---

react-redux:

Provider：作用是把store和视图绑定在了一起，这里的Store就是那个唯一的State树

reducer：handling actions

    <span class="token punctuation">(</span>previousState<span class="token punctuation">,</span> action<span class="token punctuation">)</span> <span class="token operator">=</span><span class="token operator">&gt;</span> newState 在reducer进行操作的时候，使用babel插件解析object.assign(this,args),此方法还未被大多数浏览器支持`</pre>
    combineReducers
    <pre>`<span class="token keyword">import</span> <span class="token punctuation">{</span> combineReducers <span class="token punctuation">}</span> from <span class="token string">'redux'</span><span class="token punctuation">;</span>

    <span class="token keyword">const</span> todoApp <span class="token operator">=</span> <span class="token function">combineReducers</span><span class="token punctuation">(</span><span class="token punctuation">{</span>
      visibilityFilter<span class="token punctuation">,</span>
      todos
    <span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

    <span class="token keyword">export</span> <span class="token keyword">default</span> todoApp<span class="token punctuation">;
    </span>`</pre>
    <pre>`<span class="token keyword">export</span> <span class="token keyword">default</span> <span class="token keyword">function</span> <span class="token function">todoApp</span><span class="token punctuation">(</span>state<span class="token punctuation">,</span> action<span class="token punctuation">)</span> <span class="token punctuation">{</span>
      <span class="token keyword">return</span> <span class="token punctuation">{</span>
        visibilityFilter<span class="token punctuation">:</span> <span class="token function">visibilityFilter</span><span class="token punctuation">(</span>state<span class="token punctuation">.</span>visibilityFilter<span class="token punctuation">,</span> action<span class="token punctuation">)</span><span class="token punctuation">,</span>
        todos<span class="token punctuation">:</span> <span class="token function">todos</span><span class="token punctuation">(</span>state<span class="token punctuation">.</span>todos<span class="token punctuation">,</span> action<span class="token punctuation">)</span>
      <span class="token punctuation">}</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>`</pre>
    以上两段代码的作用是一样的，combineReducers并没有什么特殊之处

    actionc =======reducer=======state

    触发一个action，对应的rootreducer会将参数传入每一个split的reducer进行匹配。将结果的state tree合并返回

    When you emit an action, `todoApp` returned by `combineReducers` will call both reducers:
    <pre>` <span class="token keyword">let</span> nextTodos <span class="token operator">=</span> <span class="token function">todos</span><span class="token punctuation">(</span>state<span class="token punctuation">.</span>todos<span class="token punctuation">,</span> action<span class="token punctuation">)</span><span class="token punctuation">;</span>
     <span class="token keyword">let</span> nextVisibleTodoFilter <span class="token operator">=</span> <span class="token function">visibleTodoFilter</span><span class="token punctuation">(</span>state<span class="token punctuation">.</span>visibleTodoFilter<span class="token punctuation">,</span> action<span class="token punctuation">)</span><span class="token punctuation">;</span>

采用connect将dispatch和state注入render的组件，下面列出connect的参数
<pre>function connect(mapStateToProps, mapDispatchToProps, mergeProps) {</pre>
//...
<pre>return function wrapWithConnect(WrappedComponent)</pre>
这些参数还是得熟悉的