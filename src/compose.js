function throwIfHasBeenCalled(fn) {
    if (fn._called) {
        throw new Error('Cannot call next more than once');
    }
    return fn._called = true;
}
function throwIfNotFunction(x) {
    if ('function' !== typeof x) {
        throw new TypeError(`${x}, middleware must be a function`);
    }
    return x;
}
function tryInvokeMiddleware(context, middleware, next = () => Promise.resolve()) {
    try {
        return middleware
            ? Promise.resolve(middleware(context, next))
            : Promise.resolve(context);
    }
    catch (error) {
        return Promise.reject(error);
    }
}
function middlewareReducer(composed, mw) {
    return function (context, nextFn) {
        const next = () => throwIfHasBeenCalled(next) && composed(context, nextFn);
        return tryInvokeMiddleware(context, mw, next);
    };
}
function compose(...middleware) {
    return [].concat(...middleware)
        .filter(throwIfNotFunction)
        .reduceRight(middlewareReducer, tryInvokeMiddleware);
}
exports.compose = compose;
//# sourceMappingURL=compose.js.map