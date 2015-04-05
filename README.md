# app-builder

Create a promise based middleware-like application. 

```javascript
import AppBuilder from 'app-builder'

let somethingAsync = () => new Promise(res => setTimeout(res, 500))

let builder = AppBuilder.create()

builder.use(async (pipeline) => {
  // 1
  await somethingAsync()
  // 2
  pipeline.state++
  await pipeline.next()
  // 5
})
.use(async (pipeline) => {
  // 3
  pipeline.state++
  await pipeline.next()  
  await somethingAsync()
  // 4
});

let app = builder.build()
let env = {state: 0}
  
let builder2 = AppBuilder.create()
//compose different apps
let app2and1 = builder2.use(async (pipeline) => {
  //first
  env.state++
  await pipeline.next() //steps 1 2 3 4 5 
  //last
})
.build()
.concat(app)

app2and1(env)
  .then(() => console.log(env.state)) //3  
```