---
title: CSS选择器排序（specificity）
tags:
  - css3
id: 83
categories:
  - Javascript
date: 2015-07-20 03:29:58
---

### Selector Types

The following list of selector types is by increasing specificity:

*   Universal selectors (e.g., `*`)
*   Type selectors (e.g., `h1`)
*   Class selectors (e.g., `.example`)
*   Attributes selectors (e.g., `[type="radio"]`)
*   Pseudo-classes (e.g., `:hover`)
*   ID selectors (e.g., `#example`)
*   Inline style (e.g., `style="font-weight:bold"`)
以上选择器优先级从弱到强

### !important

When an _**<span style="text-decoration: underline;">!important</span>**_ rule is used on a style declaration, this declaration overrides any other declaration made in the CSS, wherever it is in the declaration list. Although, !important has nothing to do with specificity.

<span style="text-decoration: underline;">_**!important**_</span>并不提供精确匹配，但此声明覆盖之前所有selector

# <span class="color_h1">@font-face</span> Rule

usage:

In the new @font-face rule you must first define a name for the font , and then point to the font file. The URL must be in lowercase