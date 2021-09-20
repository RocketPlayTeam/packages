# @rocketplay/cache
A dead simple ioredis wrapper for caching

## Installing
`yarn add @rocketplay/cache` or `npm i @rocketplay/cache`

## Initializing
```typescript
import { initCache } from '@rocketplay/cache';

initCache({
  prefix: 'mysupercache'
});
```

## Wrapper function

Introduced in 1.1.0, CacheOrRun is a wrapper function that allows you to very simply cache any function while keeping all its types !

Example:

```typescript
import { initCache, CacheOrRun } from '@rocketplay/cache';

async function slowFunction (name: string) {
  await new Promise((resolve) => setTimeout(resolve, 500));
  return `Good day, ${name} !`;
}

const fast = CacheOrRun(slowFunction);

async function MyApp () {
  const myResult = await fast('Nicolas');
  // 500ms delay on the first run
  console.log(myResult);
  const myCachedResult = await fast('Nicolas');
  // Near instantanious result !
  console.log(myCachedResult);
}

MyApp();
```

## Simple example with express

```typescript
import { cacheItem, getCached } from '@rocketplay/cache';

// ... assuming you have a base express app

// Dummy async function
async function getLink () {
  return await new Promise((resolve) => {
    setTimeout(() => {
      resolve('twitch.tv/itsRems');
    }, 1337);
  })
}

app.get('/cached', async function (req, res) {
  const key = "thing_Icached";
  const cached = await getCached(key);
  if (cached) return res.send({ link: cached });
  const link = await getLink();
  await cacheItem(key, link, 15*60); // Cache for 15 minutes
  return res.send({ link });
});

```

moar docs coming soon, feel free to take a look at the source code ;)