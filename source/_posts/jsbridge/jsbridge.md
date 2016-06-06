---
title: 安卓和IOS的jsbridge实现机理梳理
date: 2016-06-06 20:20:33
tags:
- jsbridge
---

## 引言
> jsbride在hybrid中是应用非常广泛的，它的实现机理也很简单   
> ===> 调用native提供的可以阅读到window对象的UI类，按照协议规范进行发出请求。
> ===> 在window对象利用sub/pub设计模式，代理随机callbackId对象来承载回调函数，
> ===> 发出请求【具体的有iframe方法】(ios中用的多)，或者通用事件【window.prompt劫持】来实现通信。
> ===> 当然各家有各家的方式。

### 1、安卓java中的实现
>   native调用js:    WebView.loadUrl(“JavaScript:function()”)
>   js调用native：   WebView有一个方法，叫setWebChromeClient。它的
onJsAlert,onJsConfirm,onJsPrompt方法将会在js调用window对象的对应的方法alert、confirm、prompt时候被触发。

### 看码分析
####  1、h5代码
``` javascript
    <button onclick="JSBridge._call('bridge','showToast',
                    {'msg':'Hello JSBridge'},
                    function(res){alert(JSON.stringify(res))})">
                    测试showToast
                </button>
```
#### 2、js代码 
``` javascript 
    var Util = {
             getUri:function(obj, method, params, port){
                 params = this.getParam(params);
                 var uri = 'JSBridge' + '://' + obj + ':' + port + '/' + method + '?' + params;
                 return uri;
             },
             getParam:function(obj){
                 if (obj && typeof obj === 'object') {
                     return JSON.stringify(obj);
                 } else {
                     return obj || '';
                 }
             }
         };             
   var JSBridge={};
   JSBridge.callbacks={};
   JSBridge._call=function (obj, method, params, callback) {
                              var port = Math.random();
                              this.callbacks[port] = callback;
                              var uri=Util.getUri(obj,method,params,port);
                              window.prompt(uri, "");
                          };
```
 ---
> 至此，前端层面层面代码结束，下面开始native层面的代码。
                       
##### 3、native部分将js传来的uri获取到[编写一个WebChromeClient子类]                          
```java
    public class JSBridgeWebChromeClient extends WebChromeClient {
    @Override
    public boolean onJsPrompt(WebView view, String url, String message, String defaultValue, JsPromptResult result) {
        result.confirm(JSBridge.callJava(view, message));
        return true;
    }
    }                       
```
##### 4、native部分将该对象设置给WebView
```java
    WebView mWebView = (WebView) findViewById(R.id.webview);
    WebSettings settings = mWebView.getSettings();
    settings.setJavaScriptEnabled(true);
    mWebView.setWebChromeClient(new JSBridgeWebChromeClient());
    mWebView.loadUrl("file:///android_asset/index.html");
```
##### 5、native部分创建事件映射池
```java
    public class JSBridge {/*创建映射池，具体实现不写出来了*/}
    JSBridge.register("jsName",javaClass.class)； //注册方法
    JSBridge.trigger(view,message);//执行方法
```
##### 6、webview和前端参数整合起来，传入要唤醒的native组件


## IOS部分其实也差不多
##### 1、native调用js： stringByEvaluatingJavaScriptFromString
##### 2、js调用native代码:   在UIWebView内发起的所有网络请求，通过delegate函数在Native层得到通知。

## 结尾
> JSbridge是个hybrid应用开发中非常常见的话题，其实也没有什么神秘的。
> 一个好的JSbridge是需要很好的设计模式的，yeap！