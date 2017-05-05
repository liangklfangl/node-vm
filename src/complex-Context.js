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
// vm.runInNewContext(code, sandbox, opt);
vm.runInNewContext('p = 3;console.log(typeof global);require(\'vm\').runInThisContext("console.log(p)");', window);
//runInNewContext会传入外部的window，但是window有一个global属性，所以typeof global="object"
//但是注意：runInThisContext无法获取到global对象，因为这个runInNewContext里面并不存在global对象被传入