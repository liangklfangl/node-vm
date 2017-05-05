## RunInThisContext
此方法用于创建一个独立的沙箱运行空间，code内的代码可以访问外部的global对象，但是`不能访问`其他变量,而且code内部global与外部`共享`。
```js
var vm = require("vm");
var p = 5;
global.p = 11;
//此方法用于创建一个独立的沙箱运行空间，code内的代码可以访问外部的global对象，但是不能访问其他变量
//而且code内部global与外部共享
vm.runInThisContext("console.log('ok', p)");
// 显示global下的11
vm.runInThisContext("console.log(global)"); 
// 显示global
console.log(p);
// 显示5
```
此时Global对象为nodejs中的global对象，只是多了一个p属性。

## runInContext(contextifiedSandbox[, options])
此方法用于创建一个独立的沙箱运行空间，sandBox将做为global的变量传入code内,从而内部可以直接访问这些变量，`但不存在global变量`。sandBox要求是vm.createContext()方法创建的sandBox
```js
var vm = require("vm");
var util = require("util");
var window = {
    p: 2,
    vm: vm,
    console: console,
    require: require
};
var p = 5;
global.p = 11;
vm.createContext(window);
vm.runInContext('p = 3;console.log(typeof global);', window);
console.log(window.p);
// 被改变为3
console.log(util.inspect(window));
//p被修改为3，其他vm,console,require不变
```
此时window对象如下:
```js
{ p: 3,
  vm:
   { Script: [Function: ContextifyScript],
     createScript: [Function],
     createContext: [Function],
     //在RunInContext中创建Context
     runInDebugContext: [Function],
     runInContext: [Function],
     runInNewContext: [Function],
     runInThisContext: [Function],
     isContext: [Function: isContext] },
  console:
   Console {
     log: [Function: bound ],
     info: [Function: bound ],
     warn: [Function: bound ],
     error: [Function: bound ],
     dir: [Function: bound ],
     time: [Function: bound ],
     timeEnd: [Function: bound ],
     trace: [Function: bound trace],
     assert: [Function: bound ],
     Console: [Function: Console] },
  require:
   { [Function: require]
     resolve: [Function: resolve],
     main:
      Module {
        id: '.',
        exports: {},
        parent: null,
        filename: 'C:\\Users\\Administrator\\Desktop\\node-vm\\src\\runInContext.js',
        loaded: false,
        children: [],
        paths: [Object] },
     extensions: { '.js': [Function], '.json': [Function], '.node': [Function] },
     cache: { 'C:\Users\Administrator\Desktop\node-vm\src\runInContext.js': [Object] } } }
```
## RunInNewContext(code[, sandbox][, options])
这个方法应该和runInContext一样，但是少了创建sandBox的步骤。
```js
const util = require('util');
const vm = require('vm');
const sandbox = {
  animal: 'cat',
  count: 2
};
vm.runInNewContext('count += 1; name = "kitty"', sandbox);
// vm.runInNewContext(code[, sandbox][, options])
console.log(util.inspect(sandbox));
// { animal: 'cat', count: 3, name: 'kitty' }
```
盗用参考文献中一张图来说明runInThisContext与runInContext区别:

![](http://alloyteam.github.io/AlloyPhoto/res/aa.png)

对于runInContext的"值传递方式"之所以也是"引用传递，内外共享"是因为我们的沙箱对象穿进去后也能在内部修改，同时**内部修改也会反映到外部**。从上面的例子就可以看到。同时也要注意两者与eval的区别，runInThisContext不能使用外部上下文中的local变量，但是可以使用global变量，而runInContext都是不行的。从上面的例子global打印为undefined你也会知道后者是无法访问外部的global对象的!

## RunInNewContext vs RunInContext
下面的例子中runInNewContext会传入外部的window，但是window有一个global属性，所以typeof global="object"。**但是注意**：runInThisContext无法获取到runInNewContext中的global对象，因为这个runInNewContext里面实际上并不存在global对象被传入
```js
var vm = require("vm");
var util = require("util");
var window = {
    p: 2,
    vm: vm,
    console: console,
    require: require
};
 
window.global = window;
var p = 5;
global.p = 11;
vm.runInNewContext('p = 3;console.log(typeof global);require(\'vm\').runInThisContext("console.log(p)");', window);
//获取到了顶层的global.p=11
```
## new vm.Script(code, options)
```js
const util = require('util');
const vm = require('vm');
const sandbox = {
  animal: 'cat',
  count: 2
};
const script = new vm.Script('count += 1; name = "kitty";');
// new vm.Script(code, options)
const context = new vm.createContext(sandbox);
for (var i = 0; i < 10; ++i) {
 // sandBox将做为global的变量传入code内,从而内部可以直接访问这些变量，
 // 但不存在global变量
 // script.runInContext(contextifiedSandbox[, options])
  script.runInContext(context);
}
console.log(util.inspect(sandbox));
// { animal: 'cat', count: 12, name: 'kitty' }
```
## 用于html-webpack-plugin执行html编译后的结果
```js
HtmlWebpackPlugin.prototype.evaluateCompilationResult = function (compilation, source) {
  if (!source) {
    return Promise.reject('The child compilation didn\'t provide a result');
  }
  // The LibraryTemplatePlugin stores the template result in a local variable.
  // To extract the result during the evaluation this part has to be removed.
  source = source.replace('var HTML_WEBPACK_PLUGIN_RESULT =', '');
  //LibraryTemplatePlugin把template的结果保存在局部变量HTML_WEBPACK_PLUGIN_RESULT中
  var template = this.options.template.replace(/^.+!/, '').replace(/\?.+$/, '');
  //去掉template前面的loader以及查询字符串
  var vmContext = vm.createContext(_.extend({HTML_WEBPACK_PLUGIN: true, require: require}, global));
  //将global对象上封装HTML_WEBPACK_PLUGIN，require属性
  var vmScript = new vm.Script(source, {filename: template});
  // Evaluate code and cast to string
  // source是htmlTemplate处理后得到的结果，filename用于错误的时候指定stack trace
  var newSource;
  try {
    newSource = vmScript.runInContext(vmContext);
    //执行代码~~
  } catch (e) {
    return Promise.reject(e);
  }
  //设置了exports.__esModule = true来标记这是一个ES2015输出的模块，在通过import来引入模块时会判断此属性来执行相应的规则。一般通过babel-plugin-export-default转化会有default属性
  if (typeof newSource === 'object' && newSource.__esModule && newSource.default) {
    newSource = newSource.default;
  }
  //将返回的结果转化为Promise类型
  return typeof newSource === 'string' || typeof newSource === 'function'
    ? Promise.resolve(newSource)
    : Promise.reject('The loader "' + this.options.template + '" didn\'t return html.');
};
```





参考资料:

[详解NodeJs的VM模块](http://www.alloyteam.com/2015/04/xiang-jie-nodejs-di-vm-mo-kuai/)

[nodejs的vm模块](https://nodejs.org/dist/latest-v6.x/docs/api/vm.html#vm_vm_runinnewcontext_code_sandbox_options)

[ES2015 & babel 实战：开发 NPM 模块](https://toutiao.io/posts/yr2exl/preview)

[vm2](https://www.npmjs.com/package/vm2)