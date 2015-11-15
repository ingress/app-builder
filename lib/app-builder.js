'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _compose = require('./compose');

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
      return (0, _compose.compose)(this.middleware);
    }
  }, {
    key: 'use',
    value: function use(mw) {
      if ('function' !== typeof mw) {
        throw new TypeError(mw + ', middleware must be a function');
      }
      this.middleware.push(mw);
      return this;
    }
  }]);

  return AppBuilder;
})();

exports['default'] = function () {
  return new AppBuilder();
};

exports.compose = _compose.compose;
exports.AppBuilder = AppBuilder;