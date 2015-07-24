export default function factory () {
  return new AppBuilder
}

const noop = () => Promise.resolve()

/**
 * Create a function to invoke all passed middleware functions
 * with a single argument and context
 * @param {...Array<Function>} middleware, groups of middleware functions
 * @return {Function} start the flattened middleware pipeline
 */
export function compose (...middleware: Array<Function>): Function {
  let ctx, env
  return [].concat(...middleware)    //flatten arguments     
    .reduceRight((next, mw, i) => {  //close each mw over the context, environment and the next function in the pipeline
      return function (environment): Promise<any> {
        if (i === 0) { // capture context and environment when reduced method is invoked.
          ctx = this
          env = environment
        }
        return Promise.resolve(mw.call(ctx, env, env.next = next))
      }
      // seed with noop
    }, noop)
}

export class AppBuilder {

  static get compose() { return compose }

  middleware: Array<Function> = []

  build () {
    if (!this.middleware.length) {
      throw new Error('Usage error: must have at least one middleware')
    }
    return AppBuilder.compose(this.middleware)
  }

  use (mw: Function) {
    if ('function' !== typeof mw) {
      throw new TypeError('Usage Error: middleware must be a function')
    }
    this.middleware.push(mw)
    return this
  }
}