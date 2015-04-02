# app-builder

Create a promise based middleware-like application. 

```javascript
import AppBuilder from 'app-builder';

let somethingAsync = () => new Promise(res => setTimeout(res, 500));

let builder = AppBuilder.create();

builder.use(async (pipeline) => {
  // 1
  await somethingAsync();
  // 2
  await pipeline.next();
  // 5
})
.use(async (pipeline) => {
  // 3
  await pipeline.next();
  await somethingAsync();
  // 4
});

let appFunc = builder.app
appFunc.call({context:"I'm this"}, {state: 1});
```