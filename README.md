# app-builder

Create a promise based middleware pipeline.

`npm install app-builder`

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

### AppBuilder#use(Function) : AppBuilder 

Adds a pipeline function to the builder. The function can accept two arguments,
`context` and a `next` method The `next` method must be invoked to continue the pipeline. If
the middleware function returns a promise the pipeline will end only after all
returned promises have been resolved.

### AppBuilder#build : AppFunc

Get a valid middleware function that executes all built middleware