import { compose, Middleware, ContinuationMiddleware, functionList } from './compose.js'

export class AppBuilder<T = any> {
  private middleware: Array<Middleware<T>> = []

  build(): Middleware<T> {
    if (!this.middleware.length) {
      throw new Error('Usage error: must have at least one middleware')
    }
    return compose(this.middleware)
  }

  use(mw: Middleware<T>): AppBuilder<T> {
    if ('function' !== typeof mw) {
      throw new TypeError(
        `${mw}, must be a middleware function accpeting (context, next) arguments`
      )
    }
    this.middleware.push(mw)
    return this
  }
}

export default function createAppBuilder<T = any>(): AppBuilder<T> {
  return new AppBuilder<T>()
}

export { compose, functionList, Middleware, ContinuationMiddleware }
