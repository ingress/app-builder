import {expect} from 'chai'
import appBuilder, { AppBuilder } from '../index'

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

    it('works', async () => {
      let str = ''
      await builder.use(async (x) => {
        str += 1
        await x.next()
        str += 3
      }).use(async (x) => {
        str += 2
      }).build()({})
      expect(str).to.equal('123')
    })

    it(`sequential executions don't overwrite contexts`, async () => {
      let count = 0;
      let firstArgThrough = false
      const func = builder.use(async (x) => {
        count++;
        await new Promise(setTimeout)
        await x.next()
      }).use(async (x) => {
        if (x.num === 1) {
          firstArgThrough = true
        }
        expect(count).to.equal(2)
      }).build()

      let res = func({num:1})
      await func({num:2})
      await res
      expect(firstArgThrough).to.be.true
    })


  })
})