export default class AppBuilder {

  static create () {
    return new AppBuilder
  }

  constructor () {
    this.middleware = []
  }

  use (mw) {
    if ('function' !== typeof mw)
      throw new TypeError('Usage Error: middleware must be a function')
    this.middleware.push(mw)
    return this
  }

  static wrap (mw) {
    return mw = mw.map((ware, i) => {
      return function (env, results, next) {
        env.next = () => (mw[i + 1] || next || noop).call(this, env, results, next)
        return results[i] = Promise.resolve(ware.call(this, env))
      }
    })
  }

  build () {
    if (!this.middleware.length)
      throw new Error('Usage error: must have at least one middleware')
    let start = AppBuilder.wrap(this.middleware)[0]
    function func (env) {
      env = env || {}
      let results = []
      return start.call(this, env, results, func.next)
        .then(() => Promise.all(results))
    }
    func.builder = this
    func.concat = doConcat;
    return func;
  }
}

export function concat (a, b) {
  return doConcat.call(a, b);
}

function noop () {
  return Promise.resolve()
}

function doConcat (func) {
  let current = this.builder.build();
  let initial = current;
  current.next = this.next;
  while (current && current.next) {
    current = current.next;
  }
  current.next = function (env, results) {
    return func.call(this, env)
      .then(res => results.push.apply(results, res))
  };
  return initial;
}