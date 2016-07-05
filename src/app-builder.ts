import { compose, Middleware } from './compose'

export class AppBuilder {
  private middleware: Array<Middleware> = []

  build () {
    if (!this.middleware.length) {
      throw new Error('Usage error: must have at least one middleware')
    }
    return compose(this.middleware)
  }

  use (mw: Middleware) {
    if ('function' !== typeof mw) {
      throw new TypeError(`${mw}, middleware must be a function`)
    }
    this.middleware.push(mw)
    return this
  }
}

export default function createAppBuilder () {
  return new AppBuilder()
}

export {
  compose
}
