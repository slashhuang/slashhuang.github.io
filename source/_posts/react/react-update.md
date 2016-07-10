---
title: react-update
date: 2016-06-25 01:44:45
tags:
- react 
- 算法
---
```javascript
    function enqueueUpdate(component) {
    ensureInjected();
        // Various parts of our code (such as ReactCompositeComponent's
        // _renderValidatedComponent) assume that calls to render aren't nested;
        // verify that that's the case. (This is called by each top-level update
        // function, like setProps, setState, forceUpdate, etc.; creation and
        // destruction of top-level components is guarded in ReactMount.)
        if (!batchingStrategy.isBatchingUpdates) {
            batchingStrategy.batchedUpdates(enqueueUpdate, component);
            return;
        }
        dirtyComponents.push(component);
        }
```
###  源码的结论
- react在执行top-level事件的时候，在整个冒泡及生命周期中会有个更新策略，等到所有的脏元素准备就绪的时候(在settimeout之前，在冒泡结束节点)，统一执行setState。 
- react在执行非top-level事件的时候，会执行batchUpdate，进行局部的state的更新。完成dom树的patch
