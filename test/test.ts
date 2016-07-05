import { expect } from 'chai'
import appBuilder, { compose, AppBuilder } from '../lib/app-builder'

describe('app-builder', () => {
  let builder: any

  beforeEach(() => {
    builder = new AppBuilder
  })

  describe('appBuilder default export', () =>
    it('gets an instance', () =>
      expect(appBuilder()).to.be.an.instanceOf(AppBuilder)))

  describe('use', () => {
    it('adds middleware to the builder', () => {
      expect(builder.middleware.length).to.equal(0)
      let mw1: any, mw2: any
      builder.use(mw1 = () => Promise.resolve()).use(mw2 = () => Promise.resolve());
      expect(builder.middleware.length).to.equal(2)
      expect(builder.middleware[0]).to.equal(mw1)
      expect(builder.middleware[1]).to.equal(mw2)
    })

    it('expects a function', () => {
      expect(builder.use.bind(builder, {})).to.throw(Error)
    })
  })

  describe('build', () => {
    it('throws when no mw are present', () => {
      expect(() => builder.build()).to.throw(Error)
    })
    it('returns a function', () => {
      builder.use(() => Promise.resolve())
      expect(builder.build()).to.be.a('function')
    })
    it('throws when a middleware is not a function', () => {
      builder.middleware.push({})
      expect(builder.build.bind(builder)).to.throw(Error)
    })

  })

  describe('composed function', () => {
    it('can short circuit', async () => {
      let m = {count: 0}
      await builder.use(
        async (x:any) => {
          x.count++
        }
      ).use(
        async (x: any) => {
          x.count++
        }
      ).build()(m)
      expect(m.count).to.equal(1)
    })

    it('works', async () => {
      let str = ''
      await builder.use(
        async (x: any, next: any) => {
          str += 1
          await next()
          str += 3
        }
      ).use(
        async (x: any, next: any) => {
          await next()
          str += 2
        }
      ).build()({})
      expect(str).to.equal('123')
    })

    it('is valid middleware', async () => {
      const context = { str: '' }
      await compose([
        compose([
        async (x, next) => {
          x.str += 1
          await next()
          x.str += 5
        }
      ]),
        compose([
        async (x, next) => {
          x.str += 2
          await next()
        }
      ]),
        async (x, next) => {
          await next()
          x.str += 4
        }
      ])(context,
        async (x: any, next: any) => {
          x.str += 3
          return next()
        })
      expect(context.str).to.equal('12345')
    })

    it('throws when next is invoked multiple times', async () => {
      try {
        await compose([
          async (x: any, next: Function) => {
            await next()
            await next()
          }
        ])()
        throw new Error('failed')
      } catch (error) {
        expect(error.message).to.equal('Cannot call next more than once')
      }
    })

    it('propagates errors from middleware', async () => {
      const someError = new Error(Math.random().toString())
      function doThrow () {
        throw someError
      }
      let didError = false
      try {
        await compose(() => {
          doThrow()
          return Promise.resolve();
        })()
      } catch(error) {
        didError = true
        expect(error).to.equal(someError)
      }
      expect(didError).to.be.true
    })
  })
})
