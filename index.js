'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

exports['default'] = factory;
exports.compose = compose;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function factory() {
  return new AppBuilder();
}

var noop = function noop() {
  return Promise.resolve();
};

/**
 * Create a function to invoke all passed middleware functions
 * with a single argument and context
 * @param {...Array<Function>} middleware, groups of middleware functions
 * @return {Function} start the flattened middleware pipeline
 */

function compose() {
  var _ref;

  return (_ref = []).concat.apply(_ref, arguments) //flatten arguments
  .reduceRight(function (next, mw) {
    return function (env) {
      var _this = this;

      env.next = function () {
        return next.call(_this, env);
      };
      return Promise.resolve(mw.call(this, env, env.next));
    };
  }, noop); // seed with noop
}

var AppBuilder = (function () {
  function AppBuilder() {
    _classCallCheck(this, AppBuilder);

    this.middleware = [];
  }

  _createClass(AppBuilder, [{
    key: 'build',
    value: function build() {
      if (!this.middleware.length) {
        throw new Error('Usage error: must have at least one middleware');
      }
      return compose(this.middleware);
    }
  }, {
    key: 'use',
    value: function use(mw) {
      if ('function' !== typeof mw) {
        throw new TypeError('Usage Error: middleware must be a function');
      }
      this.middleware.push(mw);
      return this;
    }
  }]);

  return AppBuilder;
})();

exports.AppBuilder = AppBuilder;
//close each mw over the context, environment and the next function in the pipeline
