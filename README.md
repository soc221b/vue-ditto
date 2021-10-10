# vue-ditto

![Ditto Pokemon](./ditto.svg)

**Vue-ditto** will create a _Ditto ref_ for the _original ref_, you can add any metadata to it, even if the _original ref_ changes, these metadata will be retained.

[![npm version](https://badge.fury.io/js/vue-ditto.svg)](https://badge.fury.io/js/vue-ditto)
[![CI](https://github.com/iendeavor/vue-ditto/workflows/CI/badge.svg)](https://github.com/iendeavor/vue-ditto/actions)
[![Coverage Status](https://coveralls.io/repos/github/iendeavor/vue-ditto/badge.svg?branch=develop)](https://coveralls.io/github/iendeavor/vue-ditto?branch=develop)
[![gzip](https://badgen.net/bundlephobia/minzip/vue-ditto)](https://bundlephobia.com/result?p=vue-ditto)

## Features

- Support primitive, plain object, and array types
- Support the complete operation method of array, namely `push`, `pop`, `unshift`, `shift`, `reverse`, `sort`, `lookup set`, `delete`, `length` and sparse array are all supported.

## Getting Started

> It works for Vue 2 & 3 by the power of [Vue Demi](https://github.com/vueuse/vue-demi)!

### Installation

#### NPM

```shell
$ npm i vue-ditto # yarn add vue-ditto
```

```ts
import { dittoRef } from "vue-ditto";
```

#### CDN

```html
<script src="https://unpkg.com/vue-ditto"></script>
```

```ts
const dittoRef = VueDitto.dittoRef;
```

### Usage

To create a Ditto, you just need to pass ref to `dittoRef`:

```ts
const original = ref("foo");
console.log(dittoRef({ original }).value);
// {}
```

It also works with nesting plain objects and arrays:

```ts
const original = ref({ foo: 42 });
console.log(dittoRef({ original }).value);
// { foo: {} }
```

For arrays, each item must be a plain object, and the object must contain a unique `id` property to hint **Vue-ditto** to diff the new item against the old item.

```ts
const original = ref([{ id: 0, foo: 42 }]);
console.log(dittoRef({ original }).value);
// [ { id: {}, foo: {} } ]
```

There are several callbacks that can be used to track creation and updates:

```ts
const original = ref({ foo: 42 });
const ditto = dittoRef({
  original,
  onCreated: ({ ditto, path, original }) => {
    console.log(`${["$"].concat(path as string[]).join(".")} is created`);
    // $ is created
    // $.foo is created
  },
});
```

You can add any metadata for each Ditto in these callbacks, and you must also provide `metaKeys` to preserve these metadata during the operation.

```ts
const original = ref({ foo: 42 });
const ditto = dittoRef({
  original,
  metaKeys: ["$original"],
  onCreated: ({ ditto, path, original }) => {
    ditto.$original = original.value;
  },
});

console.log(ditto.value);
// { '$original': { foo: 42 }, foo: { '$original': 42 } }
```

This also applies to the array itself:

```ts
const original = ref([
  { id: 1, value: "foo" },
  { id: 2, value: "bar" },
]);
const ditto = dittoRef({
  original,
  metaKeys: ["$original"],
  onCreated: ({ ditto, path, original }) => {
    ditto.$original = original.value;
  },
});

console.log(ditto.value);
/*
  [
    {
      '$original': { id: 1, value: 'foo' },
      id: { '$original': 1 },
      value: { '$original': 'foo' }
    },
    {
      '$original': { id: 2, value: 'bar' },
      id: { '$original': 2 },
      value: { '$original': 'bar' }
    },
    '$original': [ { id: 1, value: 'foo' }, { id: 2, value: 'bar' } ]
  ]
*/
```

When the original ref changes, the corresponding callback will be called, which gives you the opportunity to update the metadata:

```ts
const original = ref<{ foo: number }>({ foo: 42 });
const ditto = dittoRef({
  original,
  metaKeys: ["$updateCount"],
  flush: "sync",
  onCreated: ({ ditto, path, original }) => {
    ditto.$updateCount = 0;
  },
  onUpdated: ({ ditto, path, original }) => {
    ditto.$updateCount++;
  },
});

console.log(ditto.value);
// { '$updateCount': 0, foo: { '$updateCount': 0 } }

original.value.foo++;
console.log(ditto.value);
// { '$updateCount': 0, foo: { '$updateCount': 1 } }
```

For TypeScript, you must extend the type for the Ditto interface:

```ts
declare module "vue-ditto" {
  interface Ditto<T> {
    $meta: {
      path: Path;
      original: any;
    };
  }
}
```

## API Reference

```ts
function dittoRef<T>({
  original,
  metaKeys,
  flush,
  onCreated,
  onChildrenCreated,
  onUpdated,
  onChildrenUpdated,
}: {
  original: Ref<T>;
  metaKeys?: Key[];
  flush?: WatchOptions["flush"];
  onCreated?: DittoCallback;
  onChildrenCreated?: DittoCallback;
  onUpdated?: DittoCallback;
  onChildrenUpdated?: DittoCallback;
}): Ref<NestedDitto<T>>;

type NestedDitto<T> = T extends any[]
  ? NestedDitto<T[number]>[] & Ditto<T>
  : T extends object
  ? {
      [P in keyof T]: NestedDitto<T[P]>;
    } & Ditto<T>
  : Ditto<T>;

interface Ditto<T> {}

type DittoCallback = <T>({
  ditto,
  path,
  original,
}: {
  ditto: NestedDitto<T>;
  path: Path;
  original: Ref<any>;
}) => void;

type Key = string | number | symbol;

type Path = Key[];
```

## Contributing

Please read [CONTRIBUTING.md](/CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull
requests to us.

## Versioning

This project use [SemVer](https://semver.org/) for versioning. For the versions available, see the tags on this repository.

## License

This project is licensed under the MIT License - see the [LICENSE](/LICENSE) file for details
