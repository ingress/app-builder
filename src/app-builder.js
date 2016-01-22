var compose_1 = require('./compose');
exports.compose = compose_1.compose;
class AppBuilder {
    constructor() {
        this.middleware = [];
    }
    build() {
        if (!this.middleware.length) {
            throw new Error('Usage error: must have at least one middleware');
        }
        return compose_1.compose(this.middleware);
    }
    use(mw) {
        if ('function' !== typeof mw) {
            throw new TypeError(`${mw}, middleware must be a function`);
        }
        this.middleware.push(mw);
        return this;
    }
}
exports.AppBuilder = AppBuilder;
function createAppBuilder() {
    return new AppBuilder;
}
exports.default = createAppBuilder;
//# sourceMappingURL=app-builder.js.map