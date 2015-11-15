import { compose } from './compose'

class AppBuilder {

  constructor () {
    this.middleware = []
  }

  build () {
    if (!this.middleware.length) {
      throw new Error('Usage error: must have at least one middleware')
    }
    return compose(this.middleware)
  }

  use (mw) {
    if ('function' !== typeof mw) {
      throw new TypeError(`${mw}, middleware must be a function`)
    }
    this.middleware.push(mw)
    return this
  }
}

export default function () {
  return new AppBuilder
}

export {
  compose,
  AppBuilder
}