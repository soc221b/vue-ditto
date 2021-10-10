import { reactive, ref, toRef, watch, Ref, WatchOptions } from "vue-demi";
import {
  isPlainObject,
  getOwnKeys,
  ignore,
  shallowWatch,
  Path,
  Key,
} from "./util";

export interface Meta<T> {
  model: T;
  path: Path;
  id: number;
}

export const dittoSymbol = Symbol("ditto");
export const metaSymbol = Symbol("meta");

export interface Ditto<T> {
  readonly [dittoSymbol]: true;
  readonly [metaSymbol]: Meta<T>;
}

export type NestedDitto<T> = T extends any[]
  ? NestedDitto<T[number]>[] & Ditto<T>
  : T extends object
  ? {
      [P in keyof T]: NestedDitto<T[P]>;
    } & Ditto<T>
  : Ditto<T>;

export type DittoCallback = <T>({
  ditto,
  path,
  original,
}: {
  ditto: NestedDitto<T>;
  path: Path;
  original: Ref<any>;
}) => void;

export const isDitto = (object: any): boolean =>
  typeof object === "object" && object !== null && object[dittoSymbol] === true;

export const dittoRef = <T>({
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
}) => {
  const ditto = ref() as Ref<NestedDitto<T>>;

  shallowWatch(
    original,
    () => {
      if (
        Array.isArray(original.value) !==
        Array.isArray(ditto.value[metaSymbol].model)
      ) {
        ditto.value = createDitto({
          original,
          path: [],
          metaKeys: metaKeys ?? [],
          flush,
          onCreated: onCreated ?? ignore,
          onChildrenCreated: onChildrenCreated ?? ignore,
          onUpdated: onUpdated ?? ignore,
          onChildrenUpdated: onChildrenUpdated ?? ignore,
        });
      }
    },
    { flush }
  );

  ditto.value = createDitto({
    original,
    path: [],
    metaKeys: metaKeys ?? [],
    flush,
    onCreated: onCreated ?? ignore,
    onChildrenCreated: onChildrenCreated ?? ignore,
    onUpdated: onUpdated ?? ignore,
    onChildrenUpdated: onChildrenUpdated ?? ignore,
  });

  return ditto;
};

export const createDitto = <T>({
  original,
  path,
  metaKeys,
  flush,
  onCreated,
  onChildrenCreated,
  onUpdated,
  onChildrenUpdated,
}: {
  original: Ref<T>;
  path: Path;
  metaKeys: Key[];
  flush?: WatchOptions["flush"];
  onCreated: DittoCallback;
  onChildrenCreated: DittoCallback;
  onUpdated: DittoCallback;
  onChildrenUpdated: DittoCallback;
}) => {
  const ditto = reactive(
    Array.isArray(original.value) ? [] : {}
  ) as NestedDitto<T>;
  Object.defineProperty(ditto, dittoSymbol, {
    enumerable: false,
    configurable: true,
    writable: false,
    value: true,
  });

  Object.defineProperty(ditto, metaSymbol, {
    enumerable: false,
    configurable: true,
    writable: false,
    value: {
      path,
      model: original.value,
    },
  });
  if (typeof (original.value as any)?.id === "number") {
    ditto[metaSymbol].id = (original.value as any)?.id;
  }

  onCreated({ ditto, path, original });

  createNestedDitto({
    original,
    ditto,
    path,
    metaKeys,
    flush,
    onCreated,
    onChildrenCreated,
    onUpdated,
    onChildrenUpdated,
  });
  onChildrenCreated({ ditto, path, original });

  // moveProperties({ original, ditto, path, metaKeys, flush });
  removeOldProperties({ original, ditto, path, metaKeys, flush });

  watch(
    () => original.value,
    () => {
      onUpdated({ ditto, path, original });

      createNestedDitto({
        original,
        ditto,
        path,
        metaKeys,
        flush,
        onCreated,
        onChildrenCreated,
        onUpdated,
        onChildrenUpdated,
      });
      onChildrenUpdated({ ditto, path, original });
    },
    { flush }
  );

  addNewProperties({
    original,
    ditto,
    path,
    metaKeys,
    flush,
    onCreated,
    onChildrenCreated,
    onUpdated,
    onChildrenUpdated,
  });

  return ditto;
};

const createNestedDitto = <T>({
  original,
  ditto,
  path,
  metaKeys,
  flush,
  onCreated,
  onChildrenCreated,
  onUpdated,
  onChildrenUpdated,
}: {
  original: Ref<T>;
  ditto: NestedDitto<T>;
  path: Path;
  metaKeys: Key[];
  flush: WatchOptions["flush"];
  onCreated: DittoCallback;
  onChildrenCreated: DittoCallback;
  onUpdated: DittoCallback;
  onChildrenUpdated: DittoCallback;
}) => {
  if (isPlainObject(original.value)) {
    for (const key of getOwnKeys(original.value)) {
      (ditto as any)[key] = createDitto({
        original: toRef(original.value, key),
        path: path.concat(key),
        flush,
        metaKeys,
        onCreated,
        onChildrenCreated,
        onUpdated,
        onChildrenUpdated,
      });
    }
  } else if (Array.isArray(original.value)) {
    for (const index of original.value.keys()) {
      // ignore sparse item
      if (Object.prototype.hasOwnProperty.call(original.value, index) === false)
        continue;

      (ditto as any)[index] = createDitto({
        original: toRef(original.value, index),
        path: path.concat(index),
        flush,
        metaKeys,
        onCreated,
        onChildrenCreated,
        onUpdated,
        onChildrenUpdated,
      });
    }
  }
};

const addNewProperties = <T>({
  original,
  ditto,
  path,
  metaKeys,
  flush,
  onCreated,
  onChildrenCreated,
  onUpdated,
  onChildrenUpdated,
}: {
  original: Ref<T>;
  ditto: NestedDitto<T>;
  path: Path;
  metaKeys: Key[];
  flush: WatchOptions["flush"];
  onCreated: DittoCallback;
  onChildrenCreated: DittoCallback;
  onUpdated: DittoCallback;
  onChildrenUpdated: DittoCallback;
}) => {
  shallowWatch(
    original,
    () => {
      if (
        isPlainObject(original.value) &&
        isPlainObject(ditto[metaSymbol].model)
      ) {
        for (const key of getOwnKeys(original.value)) {
          try {
            if (key in ditto === false && key !== "$meta") {
              (ditto as any)[key] = createDitto({
                original: toRef(original.value, key),
                path: path.concat(key),
                metaKeys,
                flush,
                onCreated,
                onChildrenCreated,
                onUpdated,
                onChildrenUpdated,
              });
            }
          } catch {}
        }
      } else if (Array.isArray(original.value) && Array.isArray(ditto)) {
        const idToOriginalItems = original.value.reduce(
          (acc, item, index) =>
            Object.assign(acc, { [item?.id]: { item, index } }),
          {} as Record<Key, { index: number; item: any }>
        );
        const idToDittoItems = ditto.reduce(
          (acc, item, index) =>
            Object.assign(acc, {
              [item[metaSymbol].id]: { item, index },
            }),
          {} as Record<Key, { index: number; item: any }>
        );
        // TODO: improve diff algorithm
        for (const id of getOwnKeys(idToOriginalItems)) {
          if (idToDittoItems[id] !== undefined) continue;

          ditto[idToOriginalItems[id].index] = createDitto({
            original: toRef(original.value, idToOriginalItems[id].index),
            path: path.concat(idToOriginalItems[id].index),
            metaKeys,
            flush,
            onCreated,
            onChildrenCreated,
            onUpdated,
            onChildrenUpdated,
          });
        }
        ditto.length = original.value.length;
      }
    },
    { flush }
  );
};

const removeOldProperties = <T>({
  original,
  ditto,
  path,
  metaKeys,
  flush,
}: {
  original: Ref<T>;
  ditto: NestedDitto<T>;
  path: Path;
  metaKeys: Key[];
  flush: WatchOptions["flush"];
}) => {
  shallowWatch(
    original,
    () => {
      if (
        isPlainObject(original.value) &&
        isPlainObject(ditto[metaSymbol].model)
      ) {
        for (const key of getOwnKeys(ditto)) {
          try {
            if (
              Object.prototype.hasOwnProperty.call(original.value, key) ===
                false &&
              metaKeys.includes(key) === false
            ) {
              delete ditto[key];
            }
          } catch {}
        }
      } else if (Array.isArray(original.value) && Array.isArray(ditto)) {
        const usedIndex = new Set();
        const idToOriginalItems = original.value.reduce((acc, item, index) => {
          usedIndex.add(index);
          return Object.assign(acc, { [item?.id]: { item, index } });
        }, {} as Record<Key, { index: number; item: any }>);
        const idToDittoItems = ditto.reduce(
          (acc, item, index) =>
            Object.assign(acc, {
              [item[metaSymbol].id]: { item, index },
            }),
          {} as Record<Key, { index: number; item: any }>
        );

        for (const id of getOwnKeys(idToDittoItems)) {
          if (Object.prototype.hasOwnProperty.call(idToOriginalItems, id))
            continue;
          if (usedIndex.has(idToDittoItems[id].index)) continue;

          // ignore sparse item
          delete ditto[idToDittoItems[id].index];
        }
      } else {
        for (const key of getOwnKeys(ditto)) {
          try {
            if (metaKeys.includes(key)) continue;
            delete ditto[key];
          } catch {}
        }
      }
    },
    { flush }
  );
};

// const moveProperties = <T>({
//   original,
//   ditto,
//   path,
//   metaKeys,
//   flush,
// }: {
//   original: Ref<T>;
//   ditto: NestedDitto<T>;
//   path: Path;
//   metaKeys: Key[];
//   flush: WatchOptions["flush"];
// }) => {
//   shallowWatch(
//     original,
//     () => {
//       if (Array.isArray(original.value) && Array.isArray(ditto)) {
//         const idToOriginalItems = original.value.reduce((acc, item, index) =>  Object.assign(acc, { [item?.id]: { item, index } })
//         , {} as Record<Key, { index: number; item: any }>);
//         const idToDittoItems = ditto.reduce(
//           (acc, item, index) =>
//             Object.assign(acc, {
//               [item[metaSymbol].id]: { item, index },
//             }),
//           {} as Record<Key, { index: number; item: any }>
//         );

//         for (const id of getOwnKeys(idToOriginalItems)) {
//           if (
//             Object.prototype.hasOwnProperty.call(idToDittoItems, id) === false
//           )
//             continue;
//           if (idToDittoItems[id].index === idToOriginalItems[id].index)
//             continue;

//           ditto[idToOriginalItems[id].index] = idToDittoItems[id].item;
//         }
//       }
//     },
//     { flush }
//   );
// };
