export interface NextFn {
  (): any
  _called?: Boolean
}

export interface MiddlewareFn {
  (context: any, next: NextFn) : Promise<any>
}


function throwIfHasBeenCalled (fn : NextFn) {
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

function tryInvokeMiddleware (context: any, middleware: MiddlewareFn, next: NextFn = () => Promise.resolve()) {
  try {
    return middleware
      ? Promise.resolve(middleware(context, next))
      : Promise.resolve(context)
  } catch(error) {
    return Promise.reject(error)
  }
}

function middlewareReducer (composed: MiddlewareFn, mw: MiddlewareFn): MiddlewareFn {
  return function (context: any, nextFn: MiddlewareFn) {
    const next: NextFn = () => throwIfHasBeenCalled(next) && composed(context, <NextFn>nextFn)
    return tryInvokeMiddleware(context, mw, next)
  }
}

/**
 * Create a function to invoke all passed middleware functions
 * with a single argument and context
 * @param {...Array<Array<MiddlewareFn>|MiddlewareFn>} middleware, groups of middleware functions
 * @return {MiddlewareFn} fully qualified middleware
 */
export function compose (...middleware : Array<Array<MiddlewareFn>|MiddlewareFn>) {
  return [].concat(...middleware)
    .filter(throwIfNotFunction)
    .reduceRight(middlewareReducer, tryInvokeMiddleware)
}
