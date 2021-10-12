import { watch, Ref, ComputedRef, WatchCallback, WatchOptions } from "vue-demi";

const toString = Object.prototype.toString;
export const isPlainObject = (object: any): object is object => {
  return toString.call(object) === "[object Object]";
};

export const isArray = (object: any): boolean => {
  return Array.isArray(object);
};

export function getOwnKeys<T extends object>(value: T): (keyof T)[] {
  return Object.keys(value) as unknown as (keyof T)[];
}

const hasOwnProperty = Object.prototype.hasOwnProperty;
export const hasKey = (
  value: object,
  key: string | symbol | number
): key is keyof typeof value => {
  return hasOwnProperty.call(value, key);
};

export const getByPath = (object: object | any[], path: string[]) => {
  return path.reduce((value: any, key: string) => value[key], object);
};

export const setByPath = (
  object: object | unknown[],
  path: string[],
  value: unknown
) => {
  if (path.length === 0) return;
  path = path.slice();
  const key: string = path.pop() as string;
  getByPath(object, path)[key] = value;
};

export type Key = string | number | symbol;

export type Path = Key[];

export const ignore = (..._: any): any => {};

export const shallowWatch = <T>(
  source: Ref<T> | ComputedRef<T>,
  callback: WatchCallback,
  options: WatchOptions
) => {
  return watch(
    () => {
      if (isPlainObject(source.value)) {
        return getOwnKeys(source.value).reduce(
          (acc, key) => Object.assign(acc, { [key]: source.value[key] }),
          {}
        );
      } else if (Array.isArray(source.value)) {
        return source.value.map((item) => item);
      } else {
        return source.value;
      }
    },
    callback,
    options
  );
};
