# app-builder

Create a promise based middleware pipeline.

`npm install app-builder`

## Example 

```javascript
import appBuilder from 'app-builder'

let builder = appBuilder()
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

let app = builder.build()
app().then(() => console.log(str)) //'1234'  

```

### AppBuilder#use(Function) : AppBuilder 

Adds a pipeline function to the builder. The function accepts one parameter which is provided when the appFunc is invoked. The parameters `next` property is set internally and must be invoked to continue the pipeline. If the function returns a promise the pipeline will continue when it has been resolved.

### AppBuilder#build : AppFunc

Get a function (AppFunc) that executes the pipeline 

### AppFunc#concat(AppFunc) : AppFunc

Every AppFunc from `AppBuilder#build` has a `concat` method. This can be used to append one AppFunc to another.
`concat` is also available as an export with a different signature `var funcAB = concat(funcA, funcB);`

#### Example
```javascript
let str = ''
let builderA = appBuilder().use(async (env) => {
  str += 1  
  await env.next()
  str += 4  
})
let builderB = appBuilder().use(async (env) => {  
  str += 2
  await env.next()
  str += 3    
});
let appFuncA = builderA.build()
let appFuncB = builderB.build()
let appFuncAB = appFuncA.concat(appFuncB)
appFuncAB().then(() => console.log(str)) //'1234'
```

