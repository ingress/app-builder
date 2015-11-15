'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.compose = compose;
function throwIfHasBeenCalled(fn) {
  if (fn._called) {
    throw new Error('Cannot call next more than once');
  }
  return fn._called = true;
}

function throwIfNotFunction(x) {
  if ('function' !== typeof x) {
    throw new TypeError(x + ', middleware must be a function');
  }
  return x;
}

function tryInvokeMiddleware(context, middleware) {
  var next = arguments.length <= 2 || arguments[2] === undefined ? function () {
    return Promise.resolve();
  } : arguments[2];

  try {
    return middleware ? Promise.resolve(middleware(context, next)) : Promise.resolve(context);
  } catch (error) {
    return Promise.reject(error);
  }
}

function middlewareReducer(composed, mw) {
  return function (context, nextFn) {
    var next = function next() {
      return throwIfHasBeenCalled(next) && composed(context, nextFn);
    };
    return tryInvokeMiddleware(context, mw, next);
  };
}

/**
 * Create a function to invoke all passed middleware functions
 * with a single argument and context
 * @param {...Array<Function>} middleware, groups of middleware functions
 * @return {Function} Invoke the middleware pipeline
 */

function compose() {
  var _ref;

  return (_ref = []).concat.apply(_ref, arguments).filter(throwIfNotFunction).reduceRight(middlewareReducer, tryInvokeMiddleware);
}