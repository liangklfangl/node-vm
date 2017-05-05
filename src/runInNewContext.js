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