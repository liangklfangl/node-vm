var vm = require("vm");
var p = 5;
global.p = 11;
//此方法用于创建一个独立的沙箱运行空间，code内的代码可以访问外部的global对象，但是不能访问其他变量
//而且code内部global与外部共享
vm.runInThisContext("console.log('ok', p)");
// 显示global下的11
vm.runInThisContext("console.log(global)"); // 显示global
console.log(p);// 显示5