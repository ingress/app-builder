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

export function functionList<T = any>(
  list: Func | Iterable<Func>,
  ...args: any[]
): Middleware<T>[] {
  const arrayList = Symbol.iterator in list ? Array.from(list as Func[]) : [list as Func]
  return arrayList.map((x) => {
    return (_: any, next: any) => Promise.resolve(x(...args)).then(next)
  })
}

class Executor<T = any> {
  constructor(private mw: Middleware<T>, private continuation: ContinuationMiddleware<T>) {}
  tryInvokeMiddleware<T>(
    context: T,
    middleware: Middleware<T>,
    next: ContinuationMiddleware<T> = noop
  ) {
    try {
      const resolved = middleware ? middleware(context, next) : context
      return Promise.resolve(resolved)
    } catch (error) {
      return Promise.reject(error)
    }
  }
  get middleware() {
    return (context: T, next: ContinuationMiddleware<T>) => {
      return this.tryInvokeMiddleware(context, this.mw, this.continuation.bind(null, context, next))
    }
  }
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
          `${x}, must be a middleware function accepting (context, next) arguments`
        )
      }
      return x as any
    })
    .reduceRight((composed: ContinuationMiddleware<T>, mw: Middleware<T>) => {
      return new Executor<T>(mw, composed).middleware as ContinuationMiddleware<T>
    }, Executor.prototype.tryInvokeMiddleware as ContinuationMiddleware<T>)
}
