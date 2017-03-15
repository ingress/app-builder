export interface Resolver {
  resolve<T>(value?: T): PromiseLike<T>
  reject<T>(reason?: any): PromiseLike<T>
}

export const PromiseConfig: {
  constructor: Resolver
} = {
  constructor: Promise
}


