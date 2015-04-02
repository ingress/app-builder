import Promise from 'bluebird';

const noop = () => Promise.resolve();

export default class AppBuilder {

  static create () {
    return new AppBuilder;
  }

  constructor () {
    this.middleware = [];
    this._app = null;
  }

  /**
   * Retrieve a function that will invoke the async pipeline application.
   */
  get app () {
    return this._app || (this._app = this.build(this.middleware));
  }
  /**
   * Install a middleware.
   *
   * The middleware functions share a context (this) unless bound,
   * and one argument, The single argument has a `.next` property
   * which represents the next function in the pipeline.
   *
   *   // No-op middleware example:
   *     async (pipeline) => {
   *       await pipeline.next();
   *     }
   *
   * Return values from a middleware are recorded in a `.results`
   * array property of the passed argument, at their respective index.
   *
   * @param mw {Function}
   * @returns {AppBuilder}
   */
  use (mw) {
    if ('function' !== typeof mw)
      throw new TypeError('Usage Error: mw must be a function');
    this.middleware.push(mw);
    return this;
  }

  /**
   * @api private
   * @returns {Function}
   */
  build () {
    let mw = this.middleware;
    let l = mw.length;
    mw = mw.map((ware, i) => {
      return function (env) {
        env.next = () => (mw[i + 1] || noop).call(this, env);
        return env.results[i] = Promise.resolve(ware.call(this, env));
      }
    })
    return async function (env) {
      env = env || {};
      env.results = new Array(l);
      await Promise.resolve(mw[0].call(this, env));
      return Promise.all(env.results);
    }
  }
}