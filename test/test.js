var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, Promise, generator) {
    return new Promise(function (resolve, reject) {
        generator = generator.call(thisArg, _arguments);
        function cast(value) { return value instanceof Promise && value.constructor === Promise ? value : new Promise(function (resolve) { resolve(value); }); }
        function onfulfill(value) { try { step("next", value); } catch (e) { reject(e); } }
        function onreject(value) { try { step("throw", value); } catch (e) { reject(e); } }
        function step(verb, value) {
            var result = generator[verb](value);
            result.done ? resolve(result.value) : cast(result.value).then(onfulfill, onreject);
        }
        step("next", void 0);
    });
};
var chai_1 = require('chai');
var app_builder_1 = require('../src/app-builder');
describe('app-builder', () => {
    let builder;
    beforeEach(() => {
        builder = new app_builder_1.AppBuilder;
    });
    describe('appBuilder default export', () => it('gets an instance', () => chai_1.expect(app_builder_1.default()).to.be.an.instanceOf(app_builder_1.AppBuilder)));
    describe('use', () => {
        it('adds middleware to the builder', () => {
            chai_1.expect(builder.middleware.length).to.equal(0);
            let mw1, mw2;
            builder.use(mw1 = () => Promise.resolve()).use(mw2 = () => Promise.resolve());
            chai_1.expect(builder.middleware.length).to.equal(2);
            chai_1.expect(builder.middleware[0]).to.equal(mw1);
            chai_1.expect(builder.middleware[1]).to.equal(mw2);
        });
        it('expects a function', () => {
            chai_1.expect(builder.use.bind(builder, {})).to.throw(Error);
        });
    });
    describe('build', () => {
        it('throws when no mw are present', () => {
            chai_1.expect(() => builder.build()).to.throw(Error);
        });
        it('returns a function', () => {
            builder.use(() => Promise.resolve());
            chai_1.expect(builder.build()).to.be.a('function');
        });
        it('throws when a middleware is not a function', () => {
            builder.middleware.push({});
            chai_1.expect(builder.build.bind(builder)).to.throw(Error);
        });
    });
    describe('composed function', () => {
        it('can short circuit', () => __awaiter(this, void 0, Promise, function* () {
            let m = { count: 0 };
            yield builder.use((x) => __awaiter(this, void 0, Promise, function* () {
                x.count++;
            })).use((x) => __awaiter(this, void 0, Promise, function* () {
                x.count++;
            })).build()(m);
            chai_1.expect(m.count).to.equal(1);
        }));
        it('works', () => __awaiter(this, void 0, Promise, function* () {
            let str = '';
            yield builder.use((x, next) => __awaiter(this, void 0, Promise, function* () {
                str += 1;
                yield next();
                str += 3;
            })).use((x, next) => __awaiter(this, void 0, Promise, function* () {
                yield next();
                str += 2;
            })).build()({});
            chai_1.expect(str).to.equal('123');
        }));
        it('is valid middleware', () => __awaiter(this, void 0, Promise, function* () {
            const context = { str: '' };
            yield app_builder_1.compose([
                app_builder_1.compose([
                        (x, next) => __awaiter(this, void 0, Promise, function* () {
                        x.str += 1;
                        yield next();
                        x.str += 5;
                    })
                ]),
                app_builder_1.compose([
                        (x, next) => __awaiter(this, void 0, Promise, function* () {
                        x.str += 2;
                        yield next();
                    })
                ]),
                    (x, next) => __awaiter(this, void 0, Promise, function* () {
                    yield next();
                    x.str += 4;
                })
            ])(context, (x, next) => __awaiter(this, void 0, Promise, function* () {
                x.str += 3;
                yield next();
            }));
            chai_1.expect(context.str).to.equal('12345');
        }));
        it('throws when next is invoked multiple times', () => __awaiter(this, void 0, Promise, function* () {
            try {
                yield app_builder_1.compose([
                        (x, next) => __awaiter(this, void 0, Promise, function* () {
                        yield next();
                        yield next();
                    })
                ])();
                throw new Error('failed');
            }
            catch (error) {
                chai_1.expect(error.message).to.equal('Cannot call next more than once');
            }
        }));
        it('propagates errors from middleware', () => __awaiter(this, void 0, Promise, function* () {
            const someError = new Error(Math.random().toString());
            let didError = false;
            try {
                yield app_builder_1.compose(() => {
                    throw someError;
                    return Promise.resolve();
                })();
            }
            catch (error) {
                didError = true;
                chai_1.expect(error).to.equal(someError);
            }
            chai_1.expect(didError).to.be.true;
        }));
    });
});
//# sourceMappingURL=test.js.map