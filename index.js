"use strict";

var _bluebird = require("bluebird");

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var Promise = _interopRequire(require("bluebird"));

var noop = function () {
  return Promise.resolve();
};

var AppBuilder = (function () {
  function AppBuilder() {
    _classCallCheck(this, AppBuilder);

    this.middleware = [];
    this._app = null;
  }

  _createClass(AppBuilder, {
    app: {

      /**
       * Retrieve a function that will invoke the async pipeline application.
       */

      get: function () {
        return this._app || (this._app = this.build(this.middleware));
      }
    },
    use: {
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

      value: function use(mw) {
        if ("function" !== typeof mw) throw new TypeError("Usage Error: mw must be a function");
        this.middleware.push(mw);
        return this;
      }
    },
    build: {

      /**
       * @api private
       * @returns {Function}
       */

      value: function build() {
        var mw = this.middleware;
        var l = mw.length;
        mw = mw.map(function (ware, i) {
          return function (env) {
            var _this = this;

            env.next = function () {
              return (mw[i + 1] || noop).call(_this, env);
            };
            return env.results[i] = Promise.resolve(ware.call(this, env));
          };
        });
        return _bluebird.coroutine(function* (env) {
          env = env || {};
          env.results = new Array(l);
          yield Promise.resolve(mw[0].call(this, env));
          return Promise.all(env.results);
        });
      }
    }
  }, {
    create: {
      value: function create() {
        return new AppBuilder();
      }
    }
  });

  return AppBuilder;
})();

module.exports = AppBuilder;
