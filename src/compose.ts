export interface Middleware<T> {
  (context: T, next: ContinuationMiddleware<T>): any
}
export interface ContinuationMiddleware<T> {
  (context?: T, next?: Middleware<T>): any
}
export type Func<T = any> = (...args: any[]) => T

const flatten = <T>(values: Array<T | Array<T>>) => ([] as any).concat(...values) as T[],
  noop = function noop() {
    return Promise.resolve()
  }

function throwIfHasBeenCalled(fn: any) {
  if (fn.__appbuildercalled) {
    throw new Error('Cannot call next more than once')
  }
  return (fn.__appbuildercalled = true)
}

function tryInvokeMiddleware<T>(
  context: T,
  middleware: Middleware<T>,
  next: ContinuationMiddleware<T> = noop
) {
  try {
    return Promise.resolve(middleware ? middleware(context, next) : context)
  } catch (error) {
    return Promise.reject(error)
  }
}

export function functionList<T = any>(list: Func | Func[], ...args: any[]): Middleware<T>[] {
  const arrayList = Symbol.iterator in list ? Array.from(list as Func[]) : [list as Func]
  return arrayList.map((x) => {
    return (_: any, next: any) => Promise.resolve(x(...args)).then(next)
  })
}

/**
 * Create a function to invoke all passed middleware functions
 * with a single argument <T>context
 * @param middleware
 */
export function compose<T = any>(
  ...middleware: (Middleware<T> | Middleware<T>[])[]
): ContinuationMiddleware<T> {
  return flatten(middleware)
    .filter((x) => {
      if ('function' !== typeof x) {
        throw new TypeError(
          `${x}, must be a middleware function accpeting (context, next) arguments`
        )
      }
      return x
    })
    .reduceRight((composed: Middleware<T>, mw: Middleware<T>) => {
      return function (context: T, nextFn: ContinuationMiddleware<T>) {
        const next = () => throwIfHasBeenCalled(next) && composed(context, nextFn)
        return tryInvokeMiddleware(context, mw, next)
      }
    }, tryInvokeMiddleware) as ContinuationMiddleware<T>
}
