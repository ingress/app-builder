# app-builder

Create composable promise based middleware pipelines.

`npm install app-builder`

[![circle-ci](https://circleci.com/gh/calebboyd/app-builder.png?style=shield)](https://circleci.com/gh/calebboyd/app-builder.png?style=shield)

## Example

```javascript
import { compose } from 'app-builder'

const app = compose([
  async function (ctx, next) {
    ctx.value += 1
    await next()
    ctx.value += 4
  },
  async function (ctx, next) {
    ctx.value += 2
    await next()
    ctx.value += 3
  }
]);

const context = { value: '' }
app(context).then(() => console.log(context.value)) // --> '1234'
```

## Exports (3)

### default - createAppBuilder() : AppBuilder

### compose - Function(...middleware[] : Function[]|Function) : Function

### AppBuilder - Class

---

#### AppBuilder#use(mw: Function) : AppBuilder

Add a middleware function to the builder. A middleware function can accept two arguments;
`context : any` and `next : Function`. `next` must be invoked to continue the pipeline. If
the middleware function returns a promise the pipeline will end only after all
returned promises have been resolved.

#### AppBuilder#build() : Function

Get a function made up of all `use`d middleware functions (returned function is also valid middleware)


#### AppBuilder Usage:

```javascript
import createAppBuilder from 'app-builder'

const builder = createAppBuilder()

async function first (context, next) {
  context.value += 1
  await next()
  context.value += 4
}

async function second (context, next) {
  context.value += 2
  await next()
  context.value += 3
}

builder.use(first)
builder.use(second)

applicationFunction = builder.build()

const context = { value: '' }
applicationFunction(context).then(() => console.log(context.value)) // --> '1234'
```

## Notes

- `next()` must always have a modifier, that is, it must always be `await`ed or `yield`ed or `return`ed.
If it isn't, there is a strong possibility you will encounter race conditions

