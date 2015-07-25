export default function factory () {
  return new AppBuilder
}

function noop () { return Promise.resolve() }

/**
 * Create a function to invoke all passed middleware functions
 * with a single argument and context
 * @param {...Array<Function>} middleware, groups of middleware functions
 * @return {Function} start the flattened middleware pipeline
 */
export function compose (...middleware: Array<Function>): Function {
  return [].concat(...middleware) //flatten arguments
    .reduceRight((next, mw) => {  //close each mw over the context, environment and the next function in the pipeline
      return function (env): Promise<any> {
        env.next = () => next.call(this, env)
        return Promise.resolve(mw.call(this, env, env.next))
      }
    }, noop) // seed with noop
}

export class AppBuilder {

  middleware: Array<Function> = []

  build () {
    if (!this.middleware.length) {
      throw new Error('Usage error: must have at least one middleware')
    }
    return compose(this.middleware)
  }

  use (mw: Function) {
    if ('function' !== typeof mw) {
      throw new TypeError('Usage Error: middleware must be a function')
    }
    this.middleware.push(mw)
    return this
  }
}