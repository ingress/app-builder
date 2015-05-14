'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

exports.concat = concat;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function createAppFunc(start) {
  function appFunc(env) {
    env = env || {};
    var results = [];
    return start.call(this, env, results, appFunc.next).then(function () {
      return Promise.all(results);
    });
  }
}

function isAppFunc(x) {
  return typeof x === 'function' && typeof x.concat === 'function' && x.builder && typeof x.builder.build === 'function';
}

function noop() {
  return Promise.resolve();
}

function concat(a, b) {
  if (isAppFunc(this)) {
    b = a;
    a = this;
  }
  if (!isAppFunc(a) || !isAppFunc(b)) {
    throw new Error('Usage Error: argument must be an AppFunc');
  }
  var current = a.builder.build();
  var initial = current;
  current.next = a.next;
  while (current && current.next) {
    current = current.next;
  }
  current.next = function (env, results) {
    return b.call(this, env).then(function (res) {
      return results.push.apply(results, res);
    });
  };
  return initial;
}

var AppBuilder = (function () {
  function AppBuilder() {
    _classCallCheck(this, AppBuilder);

    this.middleware = [];
  }

  _createClass(AppBuilder, [{
    key: 'use',
    value: function use(mw) {
      if ('function' !== typeof mw) throw new TypeError('Usage Error: middleware must be a function');
      this.middleware.push(mw);
      return this;
    }
  }, {
    key: 'build',
    value: function build() {
      if (!this.middleware.length) throw new Error('Usage error: must have at least one middleware');
      var start = AppBuilder.wrap(this.middleware)[0];
      var appFunc = createAppFunc(start);
      appFunc.builder = this;
      appFunc.concat = concat;
      return appFunc;
    }
  }], [{
    key: 'wrap',
    value: function wrap(mw) {
      return mw = mw.map(function (ware, i) {
        return function (env, results, next) {
          var _this = this;

          env.next = function () {
            return (mw[i + 1] || next || noop).call(_this, env, results, next);
          };
          return results[i] = Promise.resolve(ware.call(this, env));
        };
      });
    }
  }]);

  return AppBuilder;
})();

exports.AppBuilder = AppBuilder;

exports['default'] = function () {
  return new AppBuilder();
};
