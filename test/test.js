import {expect} from 'chai'
import appBuilder, {AppBuilder} from '../index.src'

describe('app-builder', () => {
  let builder, spy1, spy2

  beforeEach(() => {
    builder = new AppBuilder
  })

  describe('appBuilder default export', () =>
    it('gets an instance', () =>
      expect(appBuilder()).to.be.an.instanceOf(AppBuilder)))

  describe('use', () => {
    it('adds middleware to the builder', () => {
      expect(builder.middleware.length).to.equal(0)
      let mw1, mw2;
      builder.use(mw1 = () => void 0).use(mw2 = () => void 0);
      expect(builder.middleware.length).to.equal(2)
      expect(builder.middleware[0]).to.equal(mw1)
      expect(builder.middleware[1]).to.equal(mw2)
    })
  })

  describe('build', () => {
    it('throws when no mw are present', () => {
      expect(builder.build.bind(builder)).to.throw(Error)
    })
    it('returns a function', () => {
      builder.use(() => void 0)
      expect(builder.build()).to.be.a('function')
    })
  })

  describe('AppFunc function', () => {
    it('short circuit', async () => {
      let m = {count: 0}
      await builder.use(async (x) => {
        x.count++
      }).use(async (x) => {
        x.count++
      }).build()(m)
      expect(m.count).to.equal(1)
    })

    it('composed with .concat', async () => {
      let anotherBuilder = appBuilder();
      let res = ''
      await builder.use( async (env) => {
        res += 1
        await env.next()
        res += 4
      }).build().concat(
        anotherBuilder.use(async (env) => {
          res += 2
          await env.next()
          res += 3
      }).build())()
      expect(res).to.equal('1234')
    })

    it('return values', async () => {
      expect(await builder.use( async (env) => {
        await env.next()
        return 42
      }).use(async (env) => {
        await env.next()
        return 24
      }).build()()).to.eql([42,24])
    })
  })
})