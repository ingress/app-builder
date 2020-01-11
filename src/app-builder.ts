import { compose, Middleware, ContinuationMiddleware, functionList } from './compose'

export class AppBuilder<T = any> {
  private middleware: Array<Middleware<T>> = []

  build() {
    if (!this.middleware.length) {
      throw new Error('Usage error: must have at least one middleware')
    }
    return compose(this.middleware)
  }

  use(mw: Middleware<T>) {
    if ('function' !== typeof mw) {
      throw new TypeError(`${mw}, must be a middleware function accpeting (context, next) arguments`)
    }
    this.middleware.push(mw)
    return this
  }
}

export default function createAppBuilder<T = any>() {
  return new AppBuilder<T>()
}

export { compose, functionList, Middleware, ContinuationMiddleware }
