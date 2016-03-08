---
title: angular js 源码学习
id: 129
categories:
  - Javascript
date: 2015-08-07 08:42:31
tags:
---

<pre>directive({
    a: htmlAnchorDirective,
    input: inputDirective,
    textarea: inputDirective,
    form: formDirective,
    script: scriptDirective,
    select: selectDirective,
    style: styleDirective,
    option: optionDirective,
    ngBind: ngBindDirective,
    ngBindHtml: ngBindHtmlDirective,
    ngBindTemplate: ngBindTemplateDirective,
    ngClass: ngClassDirective,
    ngClassEven: ngClassEvenDirective,
    ngClassOdd: ngClassOddDirective,
    ngCloak: ngCloakDirective,
    ngController: ngControllerDirective,
    ngForm: ngFormDirective,
    ngHide: ngHideDirective,
    ngIf: ngIfDirective,
    ngInclude: ngIncludeDirective,
    ngInit: ngInitDirective,
    ngNonBindable: ngNonBindableDirective,
    ngPluralize: ngPluralizeDirective,
    ngRepeat: ngRepeatDirective,
    ngShow: ngShowDirective,
    ngStyle: ngStyleDirective,
    ngSwitch: ngSwitchDirective,
    ngSwitchWhen: ngSwitchWhenDirective,
    ngSwitchDefault: ngSwitchDefaultDirective,
    ngOptions: ngOptionsDirective,
    ngTransclude: ngTranscludeDirective,
    ngModel: ngModelDirective,
    ngList: ngListDirective,
    ngChange: ngChangeDirective,
    pattern: patternDirective,
    ngPattern: patternDirective,
    required: requiredDirective,
    ngRequired: requiredDirective,
    minlength: minlengthDirective,
    ngMinlength: minlengthDirective,
    maxlength: maxlengthDirective,
    ngMaxlength: maxlengthDirective,
    ngValue: ngValueDirective,
    ngModelOptions: ngModelOptionsDirective
}).

</pre>
<pre>extend(angular, {
  'bootstrap': bootstrap,
  'copy': copy,
  'extend': extend,
  'merge': merge,
  'equals': equals,
  'element': jqLite,
  'forEach': forEach,
  'injector': createInjector,
  'noop': noop,
  'bind': bind,
  'toJson': toJson,
  'fromJson': fromJson,
  'identity': identity,
  'isUndefined': isUndefined,
  'isDefined': isDefined,
  'isString': isString,
  'isFunction': isFunction,
  'isObject': isObject,
  'isNumber': isNumber,
  'isElement': isElement,
  'isArray': isArray,
  'version': version,
  'isDate': isDate,
  'lowercase': lowercase,
  'uppercase': uppercase,
  'callbacks': {counter: 0},
  'getTestability': getTestability,
  '$$minErr': minErr,
  '$$csp': csp,
  'reloadWithDebugInfo': reloadWithDebugInfo
});

</pre>
<pre>$provide.provider({
  $anchorScroll: $AnchorScrollProvider,
  $animate: $AnimateProvider,
  $$animateQueue: $$CoreAnimateQueueProvider,
  $$AnimateRunner: $$CoreAnimateRunnerProvider,
  $browser: $BrowserProvider,
  $cacheFactory: $CacheFactoryProvider,
  $controller: $ControllerProvider,
  $document: $DocumentProvider,
  $exceptionHandler: $ExceptionHandlerProvider,
  $filter: $FilterProvider,
  $interpolate: $InterpolateProvider,
  $interval: $IntervalProvider,
  $http: $HttpProvider,
  $httpParamSerializer: $HttpParamSerializerProvider,
  $httpParamSerializerJQLike: $HttpParamSerializerJQLikeProvider,
  $httpBackend: $HttpBackendProvider,
  $location: $LocationProvider,
  $log: $LogProvider,
  $parse: $ParseProvider,
  $rootScope: $RootScopeProvider,
  $q: $QProvider,
  $$q: $$QProvider,
  $sce: $SceProvider,
  $sceDelegate: $SceDelegateProvider,
  $sniffer: $SnifferProvider,
  $templateCache: $TemplateCacheProvider,
  $templateRequest: $TemplateRequestProvider,
  $$testability: $$TestabilityProvider,
  $timeout: $TimeoutProvider,
  $window: $WindowProvider,
  $$rAF: $$RAFProvider,
  $$jqLite: $$jqLiteProvider,
  $$HashMap: $$HashMapProvider,
  $$cookieReader: $$CookieReaderProvider
});

</pre>
<pre>* ## Angular's jqLite
* jqLite provides only the following jQuery methods:
*
* - [`addClass()`](http://api.jquery.com/addClass/)
* - [`after()`](http://api.jquery.com/after/)
* - [`append()`](http://api.jquery.com/append/)
* - [`attr()`](http://api.jquery.com/attr/) - Does not support functions as parameters
* - [`bind()`](http://api.jquery.com/bind/) - Does not support namespaces, selectors or eventData
* - [`children()`](http://api.jquery.com/children/) - Does not support selectors
* - [`clone()`](http://api.jquery.com/clone/)
* - [`contents()`](http://api.jquery.com/contents/)
* - [`css()`](http://api.jquery.com/css/) - Only retrieves inline-styles, does not call `getComputedStyle()`. As a setter, does not convert numbers to strings or append 'px'.
* - [`data()`](http://api.jquery.com/data/)
* - [`detach()`](http://api.jquery.com/detach/)
* - [`empty()`](http://api.jquery.com/empty/)
* - [`eq()`](http://api.jquery.com/eq/)
* - [`find()`](http://api.jquery.com/find/) - Limited to lookups by tag name
* - [`hasClass()`](http://api.jquery.com/hasClass/)
* - [`html()`](http://api.jquery.com/html/)
* - [`next()`](http://api.jquery.com/next/) - Does not support selectors
* - [`on()`](http://api.jquery.com/on/) - Does not support namespaces, selectors or eventData
* - [`off()`](http://api.jquery.com/off/) - Does not support namespaces or selectors
* - [`one()`](http://api.jquery.com/one/) - Does not support namespaces or selectors
* - [`parent()`](http://api.jquery.com/parent/) - Does not support selectors
* - [`prepend()`](http://api.jquery.com/prepend/)
* - [`prop()`](http://api.jquery.com/prop/)
* - [`ready()`](http://api.jquery.com/ready/)
* - [`remove()`](http://api.jquery.com/remove/)
* - [`removeAttr()`](http://api.jquery.com/removeAttr/)
* - [`removeClass()`](http://api.jquery.com/removeClass/)
* - [`removeData()`](http://api.jquery.com/removeData/)
* - [`replaceWith()`](http://api.jquery.com/replaceWith/)
* - [`text()`](http://api.jquery.com/text/)
* - [`toggleClass()`](http://api.jquery.com/toggleClass/)
* - [`triggerHandler()`](http://api.jquery.com/triggerHandler/) - Passes a dummy event object to handlers.
* - [`unbind()`](http://api.jquery.com/unbind/) - Does not support namespaces
* - [`val()`](http://api.jquery.com/val/)
* - [`wrap()`](http://api.jquery.com/wrap/)</pre>