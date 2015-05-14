function createAppFunc (start) {
  function appFunc (env) {
    env = env || {}
    const results = []
    return start.call(this, env, results, appFunc.next)
        .then(() => Promise.all(results))
  }
}

function isAppFunc (x) {
  return typeof x === 'function'
    && typeof x.concat === 'function'
    && x.builder
    && typeof x.builder.build === 'function'
}

function noop () {
  return Promise.resolve()
}

export function concat (a, b) {
  if (isAppFunc(this)) {
    b = a
    a = this
  }
  if (!isAppFunc(a) || !isAppFunc(b)) {
    throw new Error("Usage Error: argument must be an AppFunc")
  }
  let current = a.builder.build()
  const initial = current
  current.next = a.next
  while (current && current.next) {
    current = current.next
  }
  current.next = function (env, results) {
    return b.call(this, env)
        .then(res => results.push.apply(results, res))
  }
  return initial
}

export class AppBuilder {

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
    const start = AppBuilder.wrap(this.middleware)[0]
    const appFunc = createAppFunc(start)
    appFunc.builder = this
    appFunc.concat = concat
    return appFunc
  }
}

export default function () {
  return new AppBuilder
}