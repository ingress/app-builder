import appBuilder, { compose, AppBuilder, functionList } from './app-builder'

describe('app-builder', () => {
  let builder: any

  beforeEach(() => {
    builder = new AppBuilder()
  })

  describe('appBuilder default export', () => {
    it('gets an instance', () => expect(appBuilder()).toBeInstanceOf(AppBuilder))
  })

  describe('use', () => {
    it('adds middleware to the builder', () => {
      expect(builder.middleware.length).toEqual(0)
      let mw1: any, mw2: any
      builder.use((mw1 = () => Promise.resolve())).use((mw2 = () => Promise.resolve()))
      expect(builder.middleware.length).toEqual(2)
      expect(builder.middleware[0]).toEqual(mw1)
      expect(builder.middleware[1]).toEqual(mw2)
    })

    it('expects a function', () => {
      expect(builder.use.bind(builder, {})).toThrow(Error)
    })
  })

  describe('build', () => {
    it('throws when no mw are present', () => {
      expect(() => builder.build()).toThrow(Error)
    })
    it('returns a function', () => {
      builder.use(() => Promise.resolve())
      expect(typeof builder.build()).toEqual('function')
    })
    it('throws when a middleware is not a function', () => {
      builder.middleware.push({})
      expect(builder.build.bind(builder)).toThrow(Error)
    })
  })

  describe('funcitonList', () => {
    it('should execute a list of provided functions in order', async () => {
      const output = { str: '' }
      await compose(
        functionList([
          () => (output.str += 1),
          () => (output.str += 2),
          async () => {
            output.str += await Promise.resolve(3)
          },
          () => (output.str += 4),
        ])
      )()
      expect(output.str).toEqual('1234')
    })
  })

  describe('composed function', () => {
    it('can short circuit', async () => {
      const m = { count: 0 }
      await builder
        .use(async (x: any) => {
          x.count++
        })
        .use(async (x: any) => {
          x.count++
        })
        .build()(m)
      expect(m.count).toEqual(1)
    })

    it('works', async () => {
      let str = ''
      await builder
        .use(async (x: any, next: any) => {
          str += 1
          await next()
          str += 3
        })
        .use(async (x: any, next: any) => {
          await next()
          str += 2
        })
        .build()({})
      expect(str).toEqual('123')
    })

    it('can run concurrently', async () => {
      let first = true
      const composed = await builder
        .use(async (x: any, next: any) => {
          if (first) {
            first = false
            await new Promise((resolve) => setTimeout(resolve, 5))
          }
          await next()
        })
        .build()
      await Promise.all([composed(), composed()])
    })

    it('is valid middleware', async () => {
      const context = { str: '' }

      const func = compose<typeof context>([
        async function (ctx, next) {
          ctx.str += 1
          await next()
          ctx.str += 5
        },
        async function (ctx, next) {
          ctx.str += 2
          await next()
          ctx.str += 4
        },
      ])

      await func(context, (ctx, next) => {
        ctx.str += 3
        return next()
      })

      expect(context.str).toEqual('12345')
    })

    it('propagates errors from middleware', async () => {
      const someError = new Error(Math.random().toString())
      function doThrow() {
        throw someError
      }
      let didError = false
      try {
        await compose(() => {
          doThrow()
          return Promise.resolve()
        })()
      } catch (error) {
        didError = true
        expect(error).toEqual(someError)
      }
      expect(didError).toBeTruthy
    })
  })
})
