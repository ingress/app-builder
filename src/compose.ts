export interface Middleware<T> {
  (context?: T, next?: Middleware<T>) : any
}

function noop () {
  return Promise.resolve()
}

function throwIfHasBeenCalled (fn : any) {
  if (fn._called) {
    throw new Error('Cannot call next more than once')
  }
  return fn._called = true
}

function throwIfNotFunction (x : any) {
  if ('function' !== typeof x) {
    throw new TypeError(`${x}, middleware must be a function`)
  }
  return x
}

function tryInvokeMiddleware <T>(context:T, middleware: Middleware<T>, next: Middleware<T> = noop) {
  try {
    return middleware
      ? Promise.resolve(middleware(context, next))
      : Promise.resolve(context)
  } catch(error) {
    return Promise.reject(error)
  }
}

function middlewareReducer<T> (composed: Middleware<T>, mw: Middleware<T>): Middleware<T> {
  return function (context: T, nextFn: Middleware<T>) {
    const next = () => throwIfHasBeenCalled(next) && composed(context, nextFn)
    return tryInvokeMiddleware(context, mw, next)
  }
}

/**
 * Create a function to invoke all passed middleware functions
 * with a single argument <T>context
 * @param {...Array<Array<Middleware<T>>|Middleware<T>>} middleware, groups of middleware functions
 * @return {Middleware<T>} a fully qualified middleware
 */
export function compose<T> (...middleware: Array<Array<Middleware<T>> | Middleware<T>>) {
  return <Middleware<T>>[].concat(...middleware)
    .filter(throwIfNotFunction)
    .reduceRight(middlewareReducer, tryInvokeMiddleware)
}
