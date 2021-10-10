import { getByPath, setByPath } from "../src/util";

test("getByPath", () => {
  const object = {
    key: "value1",
    nested: {
      key: "value2",
    },
  };
  expect(getByPath(object, ["key"])).toBe("value1");
  expect(getByPath(object, ["nested", "key"])).toBe("value2");
});

test("setByPath", () => {
  const object = {};

  setByPath(object, ["key"], "value1");
  expect(object).toStrictEqual({
    key: "value1",
  });

  setByPath(object, ["nested"], {});
  expect(object).toStrictEqual({
    key: "value1",
    nested: {},
  });

  setByPath(object, ["nested", "key"], "value2");
  expect(object).toStrictEqual({
    key: "value1",
    nested: {
      key: "value2",
    },
  });
});
