'use strict';

var _bluebird2 = require('bluebird');

var _interopRequireWildcard = function (obj) { return obj && obj.__esModule ? obj : { 'default': obj }; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _Promise = _interopRequireWildcard(_bluebird2);

var AppBuilder = (function () {
  function AppBuilder() {
    _classCallCheck(this, AppBuilder);

    this.middleware = [];
  }

  _createClass(AppBuilder, [{
    key: 'use',
    value: function use(mw) {
      if ('function' !== typeof mw) throw new TypeError('Usage Error: mw must be a function');
      this.middleware.push(mw);
      return this;
    }
  }, {
    key: 'build',
    value: function build() {
      var func = _bluebird2.coroutine(function* (env) {
        env = env || {};
        var results = new Array(mw.length);
        yield mw[0].call(this, env, results, func.next);
        return _Promise['default'].all(results);
      });

      if (!this.middleware.length) throw new Error('Usage error: must have at least one middleware');
      var mw = AppBuilder.wrap(this.middleware);

      func.builder = this;
      func.concat = concat;
      return func;
    }
  }], [{
    key: 'create',
    value: function create() {
      return new AppBuilder();
    }
  }, {
    key: 'wrap',
    value: function wrap(mw) {
      return mw = mw.map(function (ware, i) {
        return function (env, results, next) {
          var _this = this;

          env.next = function () {
            return (mw[i + 1] || next || noop).call(_this, env, results, next);
          };
          return results[i] = _Promise['default'].resolve(ware.call(this, env));
        };
      });
    }
  }]);

  return AppBuilder;
})();

exports['default'] = AppBuilder;

function noop() {
  return _Promise['default'].resolve();
}

function concat(func) {
  var current = this.builder.build();
  var initial = current;
  current.next = this.next;
  while (current && current.next) {
    current = current.next;
  }
  current.next = function (env, results) {
    return func.call(this, env).then(function (res) {
      return results.push.apply(results, res);
    });
  };
  return initial;
}
module.exports = exports['default'];
