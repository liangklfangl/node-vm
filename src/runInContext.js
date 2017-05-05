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
// vm.runInContext(code, sandBox); 
// global是undefined
//此方法用于创建一个独立的沙箱运行空间，sandBox将做为global的变量传入code内,从而内部可以直接访问这些变量，但不存在global变量
//sandBox要求是vm.createContext()方法创建的sandBox
console.log(window.p);
// 被改变为3
console.log(util.inspect(window));
//p被修改为3，其他vm,console,require不变