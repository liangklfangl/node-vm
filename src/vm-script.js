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
 // sandBox将做为global的变量传入code内,从而内部可以直接访问这些变量，但不存在global变量
  // script.runInContext(contextifiedSandbox[, options])
  script.runInContext(context);
}
console.log(util.inspect(sandbox));
// { animal: 'cat', count: 12, name: 'kitty' }