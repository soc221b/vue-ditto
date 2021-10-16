import {
  reactive,
  ref,
  toRef,
  watch,
  Ref,
  WatchOptions,
  WatchStopHandle,
} from "vue-demi";
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

export interface Ditto<T> {}

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

  const pathToWatchStopHandles = new Map();
  watch(
    () => original.value,
    () => {
      if (
        Array.isArray(original.value) !==
        Array.isArray((ditto.value as any)[metaSymbol].model)
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
          pathToWatchStopHandles,
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
    pathToWatchStopHandles,
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
  pathToWatchStopHandles,
}: {
  original: Ref<T>;
  path: Path;
  metaKeys: Key[];
  flush?: WatchOptions["flush"];
  onCreated: DittoCallback;
  onChildrenCreated: DittoCallback;
  onUpdated: DittoCallback;
  onChildrenUpdated: DittoCallback;
  pathToWatchStopHandles: Map<string, WatchStopHandle[]>;
}) => {
  tearDownWatchStopHandlers({ path, pathToWatchStopHandles });

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
    (ditto as any)[metaSymbol].id = (original.value as any)?.id;
  }

  removeOldProperties({
    original,
    ditto,
    path,
    metaKeys,
    flush,
    pathToWatchStopHandles,
  });
  const watchStopHandle = watch(
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
        pathToWatchStopHandles,
      });

      onChildrenUpdated({ ditto, path, original });
    },
    { flush }
  );
  setUpWatchStopHandlers({
    path,
    pathToWatchStopHandles,
    watchStopHandle,
  });
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
    pathToWatchStopHandles,
  });

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
    pathToWatchStopHandles,
  });
  onChildrenCreated({ ditto, path, original });

  return ditto;
};

const setUpWatchStopHandlers = ({
  path,
  pathToWatchStopHandles,
  watchStopHandle,
}: {
  path: Path;
  pathToWatchStopHandles: Map<string, WatchStopHandle[]>;
  watchStopHandle: WatchStopHandle;
}) => {
  const stringifiedPath = JSON.stringify(path);
  if (pathToWatchStopHandles.has(stringifiedPath) === false) {
    pathToWatchStopHandles.set(stringifiedPath, []);
  }
  pathToWatchStopHandles.set(
    stringifiedPath,
    pathToWatchStopHandles.get(stringifiedPath)!.concat(watchStopHandle)
  );
};
const tearDownWatchStopHandlers = ({
  path,
  pathToWatchStopHandles,
}: {
  path: Path;
  pathToWatchStopHandles: Map<string, WatchStopHandle[]>;
}) => {
  const stringifiedPath = JSON.stringify(path);
  if (pathToWatchStopHandles.has(stringifiedPath)) {
    pathToWatchStopHandles.get(stringifiedPath)!.forEach((fn) => fn());
    pathToWatchStopHandles.delete(stringifiedPath);
  }
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
  pathToWatchStopHandles,
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
  pathToWatchStopHandles: Map<string, WatchStopHandle[]>;
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
        pathToWatchStopHandles,
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
        pathToWatchStopHandles,
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
  pathToWatchStopHandles,
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
  pathToWatchStopHandles: Map<string, WatchStopHandle[]>;
}) => {
  const watchStopHandle = shallowWatch(
    original,
    () => {
      if (
        isPlainObject(original.value) &&
        isPlainObject((ditto as any)[metaSymbol].model)
      ) {
        for (const key of getOwnKeys(original.value)) {
          try {
            if (Object.prototype.hasOwnProperty.call(ditto, key) === false) {
              (ditto as any)[key] = createDitto({
                original: toRef(original.value, key),
                path: path.concat(key),
                metaKeys,
                flush,
                onCreated,
                onChildrenCreated,
                onUpdated,
                onChildrenUpdated,
                pathToWatchStopHandles,
              });
            }
          } catch {}
        }
      } else if (Array.isArray(original.value) && Array.isArray(ditto)) {
        const originalIds = original.value.map((item) => item.id);

        const idToDittoIndex = ditto.reduce(
          (acc, item, index) =>
            Object.assign(acc, {
              [(item as any)[metaSymbol].id]: index,
            }),
          {} as Record<Key, number>
        );

        // TODO: improve diff algorithm
        for (const index of originalIds.keys()) {
          const id = originalIds[index];
          // ignore sparse item
          if (id === undefined) continue;
          if (idToDittoIndex[id] !== undefined) continue;

          ditto[index] = createDitto({
            original: toRef(original.value, index),
            path: path.concat(index),
            metaKeys,
            flush,
            onCreated,
            onChildrenCreated,
            onUpdated,
            onChildrenUpdated,
            pathToWatchStopHandles,
          });
        }

        ditto.length = original.value.length;
      }
    },
    { flush }
  );

  setUpWatchStopHandlers({
    path,
    pathToWatchStopHandles,
    watchStopHandle,
  });
};

const removeOldProperties = <T>({
  original,
  ditto,
  path,
  metaKeys,
  flush,
  pathToWatchStopHandles,
}: {
  original: Ref<T>;
  ditto: NestedDitto<T>;
  path: Path;
  metaKeys: Key[];
  flush: WatchOptions["flush"];
  pathToWatchStopHandles: Map<string, WatchStopHandle[]>;
}) => {
  const watchStopHandle = shallowWatch(
    original,
    () => {
      if (
        isPlainObject(original.value) &&
        isPlainObject((ditto as any)[metaSymbol].model)
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
        const idToOriginalIndex = original.value.reduce(
          (acc, item, index) => Object.assign(acc, { [item.id]: index }),
          {} as Record<Key, number>
        );

        const idToDittoIndex = ditto.reduce(
          (acc, item, index) =>
            Object.assign(acc, {
              [(item as any)[metaSymbol].id]: index,
            }),
          {} as Record<Key, number>
        );

        for (const id of getOwnKeys(idToDittoIndex)) {
          if (idToDittoIndex[id] === idToOriginalIndex[id]) continue;

          delete ditto[idToDittoIndex[id]];
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

  setUpWatchStopHandlers({
    path,
    pathToWatchStopHandles,
    watchStopHandle,
  });
};
