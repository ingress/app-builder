# app-builder

Create a promise based middleware pipeline.

`npm install app-builder`

## Example 

```javascript
import appBuilder from 'app-builder'

const builder = appBuilder()
let str = ''

builder
.use(async (env) => {
  str += 1  
  await env.next()
  str += 4  
})
.use(async (env) => {  
  str += 2
  await env.next()
  str += 3    
});

const app = builder.build()
app().then(() => console.log(str)) //'1234'  

```

### AppBuilder#use(Function) : AppBuilder 

Adds a pipeline function to the builder. The function accepts one parameter which is provided
when the appFunc is invoked. The parameters `next` property is set internally and must be
invoked to continue the pipeline. If the function returns a promise the pipeline
will continue when it has been resolved.

### AppBuilder#build : AppFunc

Get a function (AppFunc) that executes the pipeline