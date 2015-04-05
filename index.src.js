import Promise from 'bluebird'

export default class AppBuilder {

  static create () {
    return new AppBuilder
  }

  constructor () {
    this.middleware = []
  }

  use (mw) {
    if ('function' !== typeof mw)
      throw new TypeError('Usage Error: mw must be a function')
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
    let mw = AppBuilder.wrap(this.middleware)
    async function func (env) {
      env = env || {}
      let results = new Array(mw.length)
      await mw[0].call(this, env, results, func.next)
      return Promise.all(results)
    }
    func.builder = this
    func.concat = concat;
    return func;
  }
}

function noop () {
  return Promise.resolve()
}

function concat (func) {
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