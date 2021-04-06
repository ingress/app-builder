const Benchmark = require('benchmark');
const suite = new Benchmark.Suite();
const { compose } = require('.')

const mw = [(context, next) => Promise.resolve(next())]
let count = 49
while(count--) {
  mw.push((context, next) => { return next ()})
}

const fifty = compose(mw)
const ten = compose(mw.slice(0,10))

// add tests
suite.add('50', function() {
  return fifty()
})
.add('50', function() {
  return fifty()
})
.add('10', function() {
  return ten()
})
.add('10', function() {
  return ten()
})
.on('cycle', (event) => {
  console.log(String(event.target))
})
.run({ 'async': true });
