import { compose, Middleware, ComposedMiddleware, Next } from './compose'
import { PromiseConfig } from './promise'

export class AppBuilder<T> {
  private middleware: Array<Middleware<T>> = []

  build () {
    if (!this.middleware.length) {
      throw new Error('Usage error: must have at least one middleware')
    }
    return compose(this.middleware)
  }

  use (mw: Middleware<T>) {
    if ('function' !== typeof mw) {
      throw new TypeError(`${mw}, middleware must be a function`)
    }
    this.middleware.push(mw)
    return this
  }
}

export default function createAppBuilder<T> () {
  return new AppBuilder<T>()
}

export {
  compose,
  Middleware,
  Next,
  ComposedMiddleware,
  PromiseConfig
}
