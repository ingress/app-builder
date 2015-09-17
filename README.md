# app-builder

Create a promise based middleware pipeline.

`npm install app-builder`

## Example 

```javascript
import { AppBuilder } from 'app-builder'

const builder = new AppBuilder()

builder
  .use(async function (env, next) {
    env.value += 1
    await next()
    env.value += 4
  })
  .use(async function (env) {
    env.value += 2
    await env.next()
    env.value += 3
  });

const app = builder.build()
const context = { value: '' }
app(context).then(() => console.log(context.value)) //'1234'

```

### AppBuilder#use(Function) : AppBuilder 

Adds a pipeline function to the builder. The function can accept two arguments,
`environment` and a `next` method The environment's `next` property is also set to the
`next` method which must be invoked to continue the pipeline. If the middleware function returns
a promise the pipeline will end only after all returned promises have been resolved.

### AppBuilder#build : AppFunc

Get a function (AppFunc) that executes the pipeline