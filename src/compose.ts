export interface Middleware<T> {
  (context?: T, next?: Middleware<T>) : any
}

function noop () {
  return Promise.resolve()
}

function throwIfHasBeenCalled (fn : Function) {
  if ((<any>fn)._called) {
    throw new Error('Cannot call next more than once')
  }
  return (<any>fn)._called = true
}

function throwIfNotFunction (x : any) {
  if ('function' !== typeof x) {
    throw new TypeError(`${x}, middleware must be a function`)
  }
  return x
}

function tryInvokeMiddleware <T>(context: any, middleware: Middleware<T>, next: Middleware<T> = noop) {
  try {
    return middleware
      ? Promise.resolve(middleware(context, next))
      : Promise.resolve(context)
  } catch(error) {
    return Promise.reject(error)
  }
}

function middlewareReducer<T> (composed: Middleware<T>, mw: Middleware<T>): Middleware<T> {
  return function (context: any, nextFn: Middleware<T>) {
    const next = () => throwIfHasBeenCalled(next) && composed(context, nextFn)
    return tryInvokeMiddleware(context, mw, next)
  }
}

/**
 * Create a function to invoke all passed middleware functions
 * with a single argument and context
 * @param {...Array<Array<Middleware>|Middleware>} middleware, groups of middleware functions
 * @return {Middleware} a fully qualified middleware
 */
export function compose<T> (...middleware: Array<Array<Middleware<T>>|Middleware<T>>): Middleware<T> {
  return [].concat(...middleware)
    .filter(throwIfNotFunction)
    .reduceRight(middlewareReducer, tryInvokeMiddleware)
}
