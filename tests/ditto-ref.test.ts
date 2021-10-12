import { nextTick, ref, isRef, Ref } from "vue-demi";
import { dittoRef, Path } from "../src";

declare module "../src/ditto-ref" {
  interface Ditto<T> {
    $meta: {
      path: Path;
      original: any;
      order: number;
    };
    $count: number;
  }
}

let order = 1;
beforeEach(() => {
  order = 1;
});

const commonDittoRef = <T>(original: Ref<T>) => {
  return dittoRef({
    original,
    metaKeys: ["$meta"],
    onChildrenCreated: ({ ditto, path, original }) => {
      ditto.$meta = ditto.$meta ?? {};
      ditto.$meta.path = path;
      ditto.$meta.original = original;
      ditto.$meta.order = order++;
    },
    onChildrenUpdated: ({ ditto }) => {
      ditto.$meta.order = order++;
    },
  });
};

describe("dittoRef", () => {
  test("ditto is a ref", () => {
    const original = ref("foo");
    const ditto = dittoRef({ original });

    expect(isRef(ditto)).toBe(true);
  });

  test("it should retain metaKeys", () => {
    const original = ref<{ foo: number; bar: [{ id: Number; baz: number }] }>({
      foo: 42,
      bar: [{ id: 1, baz: 42 }],
    });
    const ditto = dittoRef({
      original,
      metaKeys: ["$count"],
      flush: "sync",
      onCreated: ({ ditto }) => {
        ditto.$count = 0;
      },
      onUpdated: ({ ditto }) => {
        ditto.$count++;
      },
    });

    expect(ditto.value.$count).toBe(0);
    expect(ditto.value.foo.$count).toBe(0);
    expect(ditto.value.bar.$count).toBe(0);
    expect(ditto.value.bar[0].$count).toBe(0);
    expect(ditto.value.bar[0].baz.$count).toBe(0);

    original.value = { foo: 43, bar: [{ id: 1, baz: 42 }] };
    expect(ditto.value.$count).toBe(1);
    expect(ditto.value.foo.$count).toBe(0);
    expect(ditto.value.bar.$count).toBe(0);
    expect(ditto.value.bar[0].$count).toBe(0);
    expect(ditto.value.bar[0].baz.$count).toBe(0);

    original.value = { foo: 44, bar: [{ id: 1, baz: 42 }] };
    expect(ditto.value.$count).toBe(2);
    expect(ditto.value.foo.$count).toBe(0);
    expect(ditto.value.bar.$count).toBe(0);
    expect(ditto.value.bar[0].$count).toBe(0);
    expect(ditto.value.bar[0].baz.$count).toBe(0);

    original.value.foo = 45;
    expect(ditto.value.$count).toBe(2);
    expect(ditto.value.foo.$count).toBe(1);
    expect(ditto.value.bar.$count).toBe(0);
    expect(ditto.value.bar[0].$count).toBe(0);
    expect(ditto.value.bar[0].baz.$count).toBe(0);

    original.value.foo = 46;
    expect(ditto.value.$count).toBe(2);
    expect(ditto.value.foo.$count).toBe(2);
    expect(ditto.value.bar.$count).toBe(0);
    expect(ditto.value.bar[0].$count).toBe(0);
    expect(ditto.value.bar[0].baz.$count).toBe(0);

    original.value.bar = [{ id: 1, baz: 43 }];
    expect(ditto.value.$count).toBe(2);
    expect(ditto.value.foo.$count).toBe(2);
    expect(ditto.value.bar.$count).toBe(1);
    expect(ditto.value.bar[0].$count).toBe(0);
    expect(ditto.value.bar[0].baz.$count).toBe(0);

    original.value.bar = [{ id: 1, baz: 44 }];
    expect(ditto.value.$count).toBe(2);
    expect(ditto.value.foo.$count).toBe(2);
    expect(ditto.value.bar.$count).toBe(2);
    expect(ditto.value.bar[0].$count).toBe(0);
    expect(ditto.value.bar[0].baz.$count).toBe(0);

    original.value.bar[0] = { id: 1, baz: 45 };
    expect(ditto.value.$count).toBe(2);
    expect(ditto.value.foo.$count).toBe(2);
    expect(ditto.value.bar.$count).toBe(2);
    expect(ditto.value.bar[0].$count).toBe(1);
    expect(ditto.value.bar[0].baz.$count).toBe(0);

    original.value.bar[0] = { id: 1, baz: 46 };
    expect(ditto.value.$count).toBe(2);
    expect(ditto.value.foo.$count).toBe(2);
    expect(ditto.value.bar.$count).toBe(2);
    expect(ditto.value.bar[0].$count).toBe(2);
    expect(ditto.value.bar[0].baz.$count).toBe(0);

    original.value.bar[0].baz = 47;
    expect(ditto.value.$count).toBe(2);
    expect(ditto.value.foo.$count).toBe(2);
    expect(ditto.value.bar.$count).toBe(2);
    expect(ditto.value.bar[0].$count).toBe(2);
    expect(ditto.value.bar[0].baz.$count).toBe(1);

    original.value.bar[0].baz = 48;
    expect(ditto.value.$count).toBe(2);
    expect(ditto.value.foo.$count).toBe(2);
    expect(ditto.value.bar.$count).toBe(2);
    expect(ditto.value.bar[0].$count).toBe(2);
    expect(ditto.value.bar[0].baz.$count).toBe(2);

    original.value.bar[0] = { id: 1, baz: 49 };
    expect(ditto.value.$count).toBe(2);
    expect(ditto.value.foo.$count).toBe(2);
    expect(ditto.value.bar.$count).toBe(2);
    expect(ditto.value.bar[0].$count).toBe(3);
    expect(ditto.value.bar[0].baz.$count).toBe(0);

    original.value.bar = [{ id: 1, baz: 50 }];
    expect(ditto.value.$count).toBe(2);
    expect(ditto.value.foo.$count).toBe(2);
    expect(ditto.value.bar.$count).toBe(3);
    expect(ditto.value.bar[0].$count).toBe(0);
    expect(ditto.value.bar[0].baz.$count).toBe(0);

    original.value = { foo: 45, bar: [{ id: 1, baz: 51 }] };
    expect(ditto.value.$count).toBe(3);
    expect(ditto.value.foo.$count).toBe(0);
    expect(ditto.value.bar.$count).toBe(0);
    expect(ditto.value.bar[0].$count).toBe(0);
    expect(ditto.value.bar[0].baz.$count).toBe(0);
  });

  describe("structure", () => {
    test("primitive", () => {
      const original = ref("foo");
      const ditto = commonDittoRef(original);

      expect(ditto.value).toMatchInlineSnapshot(`
        Object {
          "$meta": Object {
            "order": 1,
            "original": "foo",
            "path": Array [],
          },
        }
      `);
    });

    test("plain object", () => {
      const original = ref({ a: "foo", b: { c: "bar" } });
      const ditto = commonDittoRef(original);

      expect(ditto.value).toMatchInlineSnapshot(`
        Object {
          "$meta": Object {
            "order": 4,
            "original": Object {
              "a": "foo",
              "b": Object {
                "c": "bar",
              },
            },
            "path": Array [],
          },
          "a": Object {
            "$meta": Object {
              "order": 1,
              "original": "foo",
              "path": Array [
                "a",
              ],
            },
          },
          "b": Object {
            "$meta": Object {
              "order": 3,
              "original": Object {
                "c": "bar",
              },
              "path": Array [
                "b",
              ],
            },
            "c": Object {
              "$meta": Object {
                "order": 2,
                "original": "bar",
                "path": Array [
                  "b",
                  "c",
                ],
              },
            },
          },
        }
      `);
    });

    test("array 1", () => {
      const original = ref<
        [
          { id: number; value: string },
          { id: number; value: { id: number; value: string }[] }
        ]
      >([
        { id: 0, value: "foo" },
        { id: 1, value: [{ id: 0, value: "bar" }] },
      ]);
      const ditto = commonDittoRef(original);

      expect(ditto.value).toMatchInlineSnapshot(`
        Array [
          Object {
            "$meta": Object {
              "order": 3,
              "original": Object {
                "id": 0,
                "value": "foo",
              },
              "path": Array [
                0,
              ],
            },
            "id": Object {
              "$meta": Object {
                "order": 1,
                "original": 0,
                "path": Array [
                  0,
                  "id",
                ],
              },
            },
            "value": Object {
              "$meta": Object {
                "order": 2,
                "original": "foo",
                "path": Array [
                  0,
                  "value",
                ],
              },
            },
          },
          Object {
            "$meta": Object {
              "order": 9,
              "original": Object {
                "id": 1,
                "value": Array [
                  Object {
                    "id": 0,
                    "value": "bar",
                  },
                ],
              },
              "path": Array [
                1,
              ],
            },
            "id": Object {
              "$meta": Object {
                "order": 4,
                "original": 1,
                "path": Array [
                  1,
                  "id",
                ],
              },
            },
            "value": Array [
              Object {
                "$meta": Object {
                  "order": 7,
                  "original": Object {
                    "id": 0,
                    "value": "bar",
                  },
                  "path": Array [
                    1,
                    "value",
                    0,
                  ],
                },
                "id": Object {
                  "$meta": Object {
                    "order": 5,
                    "original": 0,
                    "path": Array [
                      1,
                      "value",
                      0,
                      "id",
                    ],
                  },
                },
                "value": Object {
                  "$meta": Object {
                    "order": 6,
                    "original": "bar",
                    "path": Array [
                      1,
                      "value",
                      0,
                      "value",
                    ],
                  },
                },
              },
            ],
          },
        ]
      `);
      expect(ditto.value[1].value.$meta).toMatchInlineSnapshot(`
        Object {
          "order": 8,
          "original": Array [
            Object {
              "id": 0,
              "value": "bar",
            },
          ],
          "path": Array [
            1,
            "value",
          ],
        }
      `);
      expect(ditto.value.$meta).toMatchInlineSnapshot(`
        Object {
          "order": 10,
          "original": Array [
            Object {
              "id": 0,
              "value": "foo",
            },
            Object {
              "id": 1,
              "value": Array [
                Object {
                  "id": 0,
                  "value": "bar",
                },
              ],
            },
          ],
          "path": Array [],
        }
      `);
    });

    test("array 2 (sparse)", async () => {
      const original = ref<
        (
          | { id: number; value: string }
          | { id: number; value: [{ id: number; value: string }] }
        )[]
      >(Array(2));
      original.value[1] = { id: 1, value: "foo" };
      const ditto = commonDittoRef(original);

      expect(ditto.value).toMatchInlineSnapshot(`
        Array [
          ,
          Object {
            "$meta": Object {
              "order": 3,
              "original": Object {
                "id": 1,
                "value": "foo",
              },
              "path": Array [
                1,
              ],
            },
            "id": Object {
              "$meta": Object {
                "order": 1,
                "original": 1,
                "path": Array [
                  1,
                  "id",
                ],
              },
            },
            "value": Object {
              "$meta": Object {
                "order": 2,
                "original": "foo",
                "path": Array [
                  1,
                  "value",
                ],
              },
            },
          },
        ]
      `);
      expect(ditto.value.$meta).toMatchInlineSnapshot(`
        Object {
          "order": 4,
          "original": Array [
            ,
            Object {
              "id": 1,
              "value": "foo",
            },
          ],
          "path": Array [],
        }
      `);
    });
  });

  describe("reactive", () => {
    describe("primitive", () => {
      test("set 1", async () => {
        const original = ref<string>("foo");
        const ditto = commonDittoRef(original);

        original.value = "bar";
        await nextTick();

        expect(ditto.value).toMatchInlineSnapshot(`
          Object {
            "$meta": Object {
              "order": 2,
              "original": "bar",
              "path": Array [],
            },
          }
        `);
      });
    });

    describe("plain object", () => {
      test("set 1", async () => {
        const original = ref({ a: "foo", b: { c: "bar" } });
        const ditto = commonDittoRef(original);

        original.value = { a: "baz", b: { c: "qux" } };
        await nextTick();

        expect(ditto.value).toMatchInlineSnapshot(`
          Object {
            "$meta": Object {
              "order": 8,
              "original": Object {
                "a": "baz",
                "b": Object {
                  "c": "qux",
                },
              },
              "path": Array [],
            },
            "a": Object {
              "$meta": Object {
                "order": 5,
                "original": "baz",
                "path": Array [
                  "a",
                ],
              },
            },
            "b": Object {
              "$meta": Object {
                "order": 7,
                "original": Object {
                  "c": "qux",
                },
                "path": Array [
                  "b",
                ],
              },
              "c": Object {
                "$meta": Object {
                  "order": 6,
                  "original": "qux",
                  "path": Array [
                    "b",
                    "c",
                  ],
                },
              },
            },
          }
        `);
      });

      test("set 2", async () => {
        const original = ref({ a: "foo", b: { c: "bar" } });
        const ditto = commonDittoRef(original);

        original.value.a = "baz";
        await nextTick();

        expect(ditto.value).toMatchInlineSnapshot(`
          Object {
            "$meta": Object {
              "order": 4,
              "original": Object {
                "a": "baz",
                "b": Object {
                  "c": "bar",
                },
              },
              "path": Array [],
            },
            "a": Object {
              "$meta": Object {
                "order": 5,
                "original": "baz",
                "path": Array [
                  "a",
                ],
              },
            },
            "b": Object {
              "$meta": Object {
                "order": 3,
                "original": Object {
                  "c": "bar",
                },
                "path": Array [
                  "b",
                ],
              },
              "c": Object {
                "$meta": Object {
                  "order": 2,
                  "original": "bar",
                  "path": Array [
                    "b",
                    "c",
                  ],
                },
              },
            },
          }
        `);
      });

      test("set 3", async () => {
        const original = ref({ a: "foo", b: { c: "bar" } });
        const ditto = commonDittoRef(original);

        original.value.b = { c: "baz" };
        await nextTick();

        expect(ditto.value).toMatchInlineSnapshot(`
          Object {
            "$meta": Object {
              "order": 4,
              "original": Object {
                "a": "foo",
                "b": Object {
                  "c": "baz",
                },
              },
              "path": Array [],
            },
            "a": Object {
              "$meta": Object {
                "order": 1,
                "original": "foo",
                "path": Array [
                  "a",
                ],
              },
            },
            "b": Object {
              "$meta": Object {
                "order": 6,
                "original": Object {
                  "c": "baz",
                },
                "path": Array [
                  "b",
                ],
              },
              "c": Object {
                "$meta": Object {
                  "order": 5,
                  "original": "baz",
                  "path": Array [
                    "b",
                    "c",
                  ],
                },
              },
            },
          }
        `);
      });

      test("set 4", async () => {
        const original = ref({ a: "foo", b: { c: "bar" } });
        const ditto = commonDittoRef(original);

        original.value.b.c = "baz";
        await nextTick();

        expect(ditto.value).toMatchInlineSnapshot(`
          Object {
            "$meta": Object {
              "order": 4,
              "original": Object {
                "a": "foo",
                "b": Object {
                  "c": "baz",
                },
              },
              "path": Array [],
            },
            "a": Object {
              "$meta": Object {
                "order": 1,
                "original": "foo",
                "path": Array [
                  "a",
                ],
              },
            },
            "b": Object {
              "$meta": Object {
                "order": 3,
                "original": Object {
                  "c": "baz",
                },
                "path": Array [
                  "b",
                ],
              },
              "c": Object {
                "$meta": Object {
                  "order": 5,
                  "original": "baz",
                  "path": Array [
                    "b",
                    "c",
                  ],
                },
              },
            },
          }
        `);
      });

      test("add 1", async () => {
        const original = ref({} as { a: string; b: { c: string } });
        const ditto = commonDittoRef(original);

        original.value = { a: "foo", b: { c: "bar" } };
        await nextTick();

        expect(ditto.value).toMatchInlineSnapshot(`
          Object {
            "$meta": Object {
              "order": 5,
              "original": Object {
                "a": "foo",
                "b": Object {
                  "c": "bar",
                },
              },
              "path": Array [],
            },
            "a": Object {
              "$meta": Object {
                "order": 2,
                "original": "foo",
                "path": Array [
                  "a",
                ],
              },
            },
            "b": Object {
              "$meta": Object {
                "order": 4,
                "original": Object {
                  "c": "bar",
                },
                "path": Array [
                  "b",
                ],
              },
              "c": Object {
                "$meta": Object {
                  "order": 3,
                  "original": "bar",
                  "path": Array [
                    "b",
                    "c",
                  ],
                },
              },
            },
          }
        `);
      });

      test("add 2", async () => {
        const original = ref({ b: { c: "foo" } } as {
          a?: string;
          b: { c: string };
        });
        const ditto = commonDittoRef(original);

        original.value.a = "bar";
        await nextTick();

        expect(ditto.value).toMatchInlineSnapshot(`
          Object {
            "$meta": Object {
              "order": 3,
              "original": Object {
                "a": "bar",
                "b": Object {
                  "c": "foo",
                },
              },
              "path": Array [],
            },
            "a": Object {
              "$meta": Object {
                "order": 4,
                "original": "bar",
                "path": Array [
                  "a",
                ],
              },
            },
            "b": Object {
              "$meta": Object {
                "order": 2,
                "original": Object {
                  "c": "foo",
                },
                "path": Array [
                  "b",
                ],
              },
              "c": Object {
                "$meta": Object {
                  "order": 1,
                  "original": "foo",
                  "path": Array [
                    "b",
                    "c",
                  ],
                },
              },
            },
          }
        `);
      });

      test("add 3", async () => {
        const original = ref({ a: "foo" } as { a: string; b?: { c: string } });
        const ditto = commonDittoRef(original);

        original.value.b = { c: "bar" };
        await nextTick();

        expect(ditto.value).toMatchInlineSnapshot(`
          Object {
            "$meta": Object {
              "order": 2,
              "original": Object {
                "a": "foo",
                "b": Object {
                  "c": "bar",
                },
              },
              "path": Array [],
            },
            "a": Object {
              "$meta": Object {
                "order": 1,
                "original": "foo",
                "path": Array [
                  "a",
                ],
              },
            },
            "b": Object {
              "$meta": Object {
                "order": 4,
                "original": Object {
                  "c": "bar",
                },
                "path": Array [
                  "b",
                ],
              },
              "c": Object {
                "$meta": Object {
                  "order": 3,
                  "original": "bar",
                  "path": Array [
                    "b",
                    "c",
                  ],
                },
              },
            },
          }
        `);
      });

      test("add 4", async () => {
        const original = ref({ a: "foo", b: {} as { c?: string } });
        const ditto = commonDittoRef(original);

        original.value.b.c = "baz";
        await nextTick();

        expect(ditto.value).toMatchInlineSnapshot(`
          Object {
            "$meta": Object {
              "order": 3,
              "original": Object {
                "a": "foo",
                "b": Object {
                  "c": "baz",
                },
              },
              "path": Array [],
            },
            "a": Object {
              "$meta": Object {
                "order": 1,
                "original": "foo",
                "path": Array [
                  "a",
                ],
              },
            },
            "b": Object {
              "$meta": Object {
                "order": 2,
                "original": Object {
                  "c": "baz",
                },
                "path": Array [
                  "b",
                ],
              },
              "c": Object {
                "$meta": Object {
                  "order": 4,
                  "original": "baz",
                  "path": Array [
                    "b",
                    "c",
                  ],
                },
              },
            },
          }
        `);
      });

      test("delete 1", async () => {
        const original = ref<{ a?: string; b: { c: string } }>({
          a: "foo",
          b: { c: "bar" },
        });
        const ditto = commonDittoRef(original);

        delete original.value.a;
        await nextTick();

        expect(ditto.value).toMatchInlineSnapshot(`
          Object {
            "$meta": Object {
              "order": 4,
              "original": Object {
                "b": Object {
                  "c": "bar",
                },
              },
              "path": Array [],
            },
            "b": Object {
              "$meta": Object {
                "order": 3,
                "original": Object {
                  "c": "bar",
                },
                "path": Array [
                  "b",
                ],
              },
              "c": Object {
                "$meta": Object {
                  "order": 2,
                  "original": "bar",
                  "path": Array [
                    "b",
                    "c",
                  ],
                },
              },
            },
          }
        `);
      });

      test("delete 2", async () => {
        const original = ref<{ a: string; b?: { c: string } }>({
          a: "foo",
          b: { c: "bar" },
        });
        const ditto = commonDittoRef(original);

        delete original.value.b;
        await nextTick();

        expect(ditto.value).toMatchInlineSnapshot(`
          Object {
            "$meta": Object {
              "order": 4,
              "original": Object {
                "a": "foo",
              },
              "path": Array [],
            },
            "a": Object {
              "$meta": Object {
                "order": 1,
                "original": "foo",
                "path": Array [
                  "a",
                ],
              },
            },
          }
        `);
      });

      test("delete 3", async () => {
        const original = ref<{ a: string; b: { c?: string } }>({
          a: "foo",
          b: { c: "bar" },
        });
        const ditto = commonDittoRef(original);

        delete original.value.b.c;
        await nextTick();

        expect(ditto.value).toMatchInlineSnapshot(`
          Object {
            "$meta": Object {
              "order": 4,
              "original": Object {
                "a": "foo",
                "b": Object {},
              },
              "path": Array [],
            },
            "a": Object {
              "$meta": Object {
                "order": 1,
                "original": "foo",
                "path": Array [
                  "a",
                ],
              },
            },
            "b": Object {
              "$meta": Object {
                "order": 3,
                "original": Object {},
                "path": Array [
                  "b",
                ],
              },
            },
          }
        `);
      });
    });

    describe("array", () => {
      test("set 1", async () => {
        const original = ref<
          [
            { id: number; value: string },
            { id: number; value: [{ id: number; value: string }] }
          ]
        >([
          { id: 1, value: "foo" },
          { id: 2, value: [{ id: 3, value: "bar" }] },
        ]);
        const ditto = commonDittoRef(original);

        original.value = [
          { id: 1, value: "baz" },
          { id: 2, value: [{ id: 3, value: "qux" }] },
        ];
        await nextTick();

        expect(ditto.value).toMatchInlineSnapshot(`
          Array [
            Object {
              "$meta": Object {
                "order": 13,
                "original": Object {
                  "id": 1,
                  "value": "baz",
                },
                "path": Array [
                  0,
                ],
              },
              "id": Object {
                "$meta": Object {
                  "order": 11,
                  "original": 1,
                  "path": Array [
                    0,
                    "id",
                  ],
                },
              },
              "value": Object {
                "$meta": Object {
                  "order": 12,
                  "original": "baz",
                  "path": Array [
                    0,
                    "value",
                  ],
                },
              },
            },
            Object {
              "$meta": Object {
                "order": 19,
                "original": Object {
                  "id": 2,
                  "value": Array [
                    Object {
                      "id": 3,
                      "value": "qux",
                    },
                  ],
                },
                "path": Array [
                  1,
                ],
              },
              "id": Object {
                "$meta": Object {
                  "order": 14,
                  "original": 2,
                  "path": Array [
                    1,
                    "id",
                  ],
                },
              },
              "value": Array [
                Object {
                  "$meta": Object {
                    "order": 17,
                    "original": Object {
                      "id": 3,
                      "value": "qux",
                    },
                    "path": Array [
                      1,
                      "value",
                      0,
                    ],
                  },
                  "id": Object {
                    "$meta": Object {
                      "order": 15,
                      "original": 3,
                      "path": Array [
                        1,
                        "value",
                        0,
                        "id",
                      ],
                    },
                  },
                  "value": Object {
                    "$meta": Object {
                      "order": 16,
                      "original": "qux",
                      "path": Array [
                        1,
                        "value",
                        0,
                        "value",
                      ],
                    },
                  },
                },
              ],
            },
          ]
        `);
        expect(ditto.value[1].value.$meta).toMatchInlineSnapshot(`
          Object {
            "order": 18,
            "original": Array [
              Object {
                "id": 3,
                "value": "qux",
              },
            ],
            "path": Array [
              1,
              "value",
            ],
          }
        `);
        expect(ditto.value.$meta).toMatchInlineSnapshot(`
          Object {
            "order": 20,
            "original": Array [
              Object {
                "id": 1,
                "value": "baz",
              },
              Object {
                "id": 2,
                "value": Array [
                  Object {
                    "id": 3,
                    "value": "qux",
                  },
                ],
              },
            ],
            "path": Array [],
          }
        `);
      });

      test("set 2", async () => {
        const original = ref<
          [
            { id: number; value: string },
            { id: number; value: [{ id: number; value: string }] }
          ]
        >([
          { id: 1, value: "foo" },
          { id: 2, value: [{ id: 3, value: "bar" }] },
        ]);
        const ditto = commonDittoRef(original);

        original.value[0] = { id: 1, value: "baz" };
        await nextTick();

        expect(ditto.value).toMatchInlineSnapshot(`
          Array [
            Object {
              "$meta": Object {
                "order": 13,
                "original": Object {
                  "id": 1,
                  "value": "baz",
                },
                "path": Array [
                  0,
                ],
              },
              "id": Object {
                "$meta": Object {
                  "order": 11,
                  "original": 1,
                  "path": Array [
                    0,
                    "id",
                  ],
                },
              },
              "value": Object {
                "$meta": Object {
                  "order": 12,
                  "original": "baz",
                  "path": Array [
                    0,
                    "value",
                  ],
                },
              },
            },
            Object {
              "$meta": Object {
                "order": 9,
                "original": Object {
                  "id": 2,
                  "value": Array [
                    Object {
                      "id": 3,
                      "value": "bar",
                    },
                  ],
                },
                "path": Array [
                  1,
                ],
              },
              "id": Object {
                "$meta": Object {
                  "order": 4,
                  "original": 2,
                  "path": Array [
                    1,
                    "id",
                  ],
                },
              },
              "value": Array [
                Object {
                  "$meta": Object {
                    "order": 7,
                    "original": Object {
                      "id": 3,
                      "value": "bar",
                    },
                    "path": Array [
                      1,
                      "value",
                      0,
                    ],
                  },
                  "id": Object {
                    "$meta": Object {
                      "order": 5,
                      "original": 3,
                      "path": Array [
                        1,
                        "value",
                        0,
                        "id",
                      ],
                    },
                  },
                  "value": Object {
                    "$meta": Object {
                      "order": 6,
                      "original": "bar",
                      "path": Array [
                        1,
                        "value",
                        0,
                        "value",
                      ],
                    },
                  },
                },
              ],
            },
          ]
        `);
        expect(ditto.value[1].value.$meta).toMatchInlineSnapshot(`
          Object {
            "order": 8,
            "original": Array [
              Object {
                "id": 3,
                "value": "bar",
              },
            ],
            "path": Array [
              1,
              "value",
            ],
          }
        `);
        expect(ditto.value.$meta).toMatchInlineSnapshot(`
          Object {
            "order": 10,
            "original": Array [
              Object {
                "id": 1,
                "value": "baz",
              },
              Object {
                "id": 2,
                "value": Array [
                  Object {
                    "id": 3,
                    "value": "bar",
                  },
                ],
              },
            ],
            "path": Array [],
          }
        `);
      });

      test("set 3", async () => {
        const original = ref<
          [
            { id: number; value: string },
            { id: number; value: [{ id: number; value: string }] }
          ]
        >([
          { id: 1, value: "foo" },
          { id: 2, value: [{ id: 3, value: "bar" }] },
        ]);
        const ditto = commonDittoRef(original);

        original.value[0].value = "baz";
        await nextTick();

        expect(ditto.value).toMatchInlineSnapshot(`
          Array [
            Object {
              "$meta": Object {
                "order": 3,
                "original": Object {
                  "id": 1,
                  "value": "baz",
                },
                "path": Array [
                  0,
                ],
              },
              "id": Object {
                "$meta": Object {
                  "order": 1,
                  "original": 1,
                  "path": Array [
                    0,
                    "id",
                  ],
                },
              },
              "value": Object {
                "$meta": Object {
                  "order": 11,
                  "original": "baz",
                  "path": Array [
                    0,
                    "value",
                  ],
                },
              },
            },
            Object {
              "$meta": Object {
                "order": 9,
                "original": Object {
                  "id": 2,
                  "value": Array [
                    Object {
                      "id": 3,
                      "value": "bar",
                    },
                  ],
                },
                "path": Array [
                  1,
                ],
              },
              "id": Object {
                "$meta": Object {
                  "order": 4,
                  "original": 2,
                  "path": Array [
                    1,
                    "id",
                  ],
                },
              },
              "value": Array [
                Object {
                  "$meta": Object {
                    "order": 7,
                    "original": Object {
                      "id": 3,
                      "value": "bar",
                    },
                    "path": Array [
                      1,
                      "value",
                      0,
                    ],
                  },
                  "id": Object {
                    "$meta": Object {
                      "order": 5,
                      "original": 3,
                      "path": Array [
                        1,
                        "value",
                        0,
                        "id",
                      ],
                    },
                  },
                  "value": Object {
                    "$meta": Object {
                      "order": 6,
                      "original": "bar",
                      "path": Array [
                        1,
                        "value",
                        0,
                        "value",
                      ],
                    },
                  },
                },
              ],
            },
          ]
        `);
        expect(ditto.value[1].value.$meta).toMatchInlineSnapshot(`
          Object {
            "order": 8,
            "original": Array [
              Object {
                "id": 3,
                "value": "bar",
              },
            ],
            "path": Array [
              1,
              "value",
            ],
          }
        `);
        expect(ditto.value.$meta).toMatchInlineSnapshot(`
          Object {
            "order": 10,
            "original": Array [
              Object {
                "id": 1,
                "value": "baz",
              },
              Object {
                "id": 2,
                "value": Array [
                  Object {
                    "id": 3,
                    "value": "bar",
                  },
                ],
              },
            ],
            "path": Array [],
          }
        `);
      });

      test("set 4", async () => {
        const original = ref<
          [
            { id: number; value: string },
            { id: number; value: [{ id: number; value: string }] }
          ]
        >([
          { id: 1, value: "foo" },
          { id: 2, value: [{ id: 3, value: "bar" }] },
        ]);
        const ditto = commonDittoRef(original);

        original.value[1] = { id: 2, value: [{ id: 3, value: "baz" }] };
        await nextTick();

        expect(ditto.value).toMatchInlineSnapshot(`
          Array [
            Object {
              "$meta": Object {
                "order": 3,
                "original": Object {
                  "id": 1,
                  "value": "foo",
                },
                "path": Array [
                  0,
                ],
              },
              "id": Object {
                "$meta": Object {
                  "order": 1,
                  "original": 1,
                  "path": Array [
                    0,
                    "id",
                  ],
                },
              },
              "value": Object {
                "$meta": Object {
                  "order": 2,
                  "original": "foo",
                  "path": Array [
                    0,
                    "value",
                  ],
                },
              },
            },
            Object {
              "$meta": Object {
                "order": 16,
                "original": Object {
                  "id": 2,
                  "value": Array [
                    Object {
                      "id": 3,
                      "value": "baz",
                    },
                  ],
                },
                "path": Array [
                  1,
                ],
              },
              "id": Object {
                "$meta": Object {
                  "order": 11,
                  "original": 2,
                  "path": Array [
                    1,
                    "id",
                  ],
                },
              },
              "value": Array [
                Object {
                  "$meta": Object {
                    "order": 14,
                    "original": Object {
                      "id": 3,
                      "value": "baz",
                    },
                    "path": Array [
                      1,
                      "value",
                      0,
                    ],
                  },
                  "id": Object {
                    "$meta": Object {
                      "order": 12,
                      "original": 3,
                      "path": Array [
                        1,
                        "value",
                        0,
                        "id",
                      ],
                    },
                  },
                  "value": Object {
                    "$meta": Object {
                      "order": 13,
                      "original": "baz",
                      "path": Array [
                        1,
                        "value",
                        0,
                        "value",
                      ],
                    },
                  },
                },
              ],
            },
          ]
        `);
        expect(ditto.value[1].value.$meta).toMatchInlineSnapshot(`
          Object {
            "order": 15,
            "original": Array [
              Object {
                "id": 3,
                "value": "baz",
              },
            ],
            "path": Array [
              1,
              "value",
            ],
          }
        `);
        expect(ditto.value.$meta).toMatchInlineSnapshot(`
          Object {
            "order": 10,
            "original": Array [
              Object {
                "id": 1,
                "value": "foo",
              },
              Object {
                "id": 2,
                "value": Array [
                  Object {
                    "id": 3,
                    "value": "baz",
                  },
                ],
              },
            ],
            "path": Array [],
          }
        `);
      });

      test("set 5", async () => {
        const original = ref<
          [
            { id: number; value: string },
            { id: number; value: [{ id: number; value: string }] }
          ]
        >([
          { id: 1, value: "foo" },
          { id: 2, value: [{ id: 3, value: "bar" }] },
        ]);
        const ditto = commonDittoRef(original);

        original.value[1].value = [{ id: 3, value: "baz" }];
        await nextTick();

        expect(ditto.value).toMatchInlineSnapshot(`
          Array [
            Object {
              "$meta": Object {
                "order": 3,
                "original": Object {
                  "id": 1,
                  "value": "foo",
                },
                "path": Array [
                  0,
                ],
              },
              "id": Object {
                "$meta": Object {
                  "order": 1,
                  "original": 1,
                  "path": Array [
                    0,
                    "id",
                  ],
                },
              },
              "value": Object {
                "$meta": Object {
                  "order": 2,
                  "original": "foo",
                  "path": Array [
                    0,
                    "value",
                  ],
                },
              },
            },
            Object {
              "$meta": Object {
                "order": 9,
                "original": Object {
                  "id": 2,
                  "value": Array [
                    Object {
                      "id": 3,
                      "value": "baz",
                    },
                  ],
                },
                "path": Array [
                  1,
                ],
              },
              "id": Object {
                "$meta": Object {
                  "order": 4,
                  "original": 2,
                  "path": Array [
                    1,
                    "id",
                  ],
                },
              },
              "value": Array [
                Object {
                  "$meta": Object {
                    "order": 13,
                    "original": Object {
                      "id": 3,
                      "value": "baz",
                    },
                    "path": Array [
                      1,
                      "value",
                      0,
                    ],
                  },
                  "id": Object {
                    "$meta": Object {
                      "order": 11,
                      "original": 3,
                      "path": Array [
                        1,
                        "value",
                        0,
                        "id",
                      ],
                    },
                  },
                  "value": Object {
                    "$meta": Object {
                      "order": 12,
                      "original": "baz",
                      "path": Array [
                        1,
                        "value",
                        0,
                        "value",
                      ],
                    },
                  },
                },
              ],
            },
          ]
        `);
        expect(ditto.value[1].value.$meta).toMatchInlineSnapshot(`
          Object {
            "order": 14,
            "original": Array [
              Object {
                "id": 3,
                "value": "baz",
              },
            ],
            "path": Array [
              1,
              "value",
            ],
          }
        `);
        expect(ditto.value.$meta).toMatchInlineSnapshot(`
          Object {
            "order": 10,
            "original": Array [
              Object {
                "id": 1,
                "value": "foo",
              },
              Object {
                "id": 2,
                "value": Array [
                  Object {
                    "id": 3,
                    "value": "baz",
                  },
                ],
              },
            ],
            "path": Array [],
          }
        `);
      });

      test("set 6", async () => {
        const original = ref<
          [
            { id: number; value: string },
            { id: number; value: [{ id: number; value: string }] }
          ]
        >([
          { id: 1, value: "foo" },
          { id: 2, value: [{ id: 3, value: "bar" }] },
        ]);
        const ditto = commonDittoRef(original);

        original.value[1].value[0].value = "baz";
        await nextTick();

        expect(ditto.value).toMatchInlineSnapshot(`
          Array [
            Object {
              "$meta": Object {
                "order": 3,
                "original": Object {
                  "id": 1,
                  "value": "foo",
                },
                "path": Array [
                  0,
                ],
              },
              "id": Object {
                "$meta": Object {
                  "order": 1,
                  "original": 1,
                  "path": Array [
                    0,
                    "id",
                  ],
                },
              },
              "value": Object {
                "$meta": Object {
                  "order": 2,
                  "original": "foo",
                  "path": Array [
                    0,
                    "value",
                  ],
                },
              },
            },
            Object {
              "$meta": Object {
                "order": 9,
                "original": Object {
                  "id": 2,
                  "value": Array [
                    Object {
                      "id": 3,
                      "value": "baz",
                    },
                  ],
                },
                "path": Array [
                  1,
                ],
              },
              "id": Object {
                "$meta": Object {
                  "order": 4,
                  "original": 2,
                  "path": Array [
                    1,
                    "id",
                  ],
                },
              },
              "value": Array [
                Object {
                  "$meta": Object {
                    "order": 7,
                    "original": Object {
                      "id": 3,
                      "value": "baz",
                    },
                    "path": Array [
                      1,
                      "value",
                      0,
                    ],
                  },
                  "id": Object {
                    "$meta": Object {
                      "order": 5,
                      "original": 3,
                      "path": Array [
                        1,
                        "value",
                        0,
                        "id",
                      ],
                    },
                  },
                  "value": Object {
                    "$meta": Object {
                      "order": 11,
                      "original": "baz",
                      "path": Array [
                        1,
                        "value",
                        0,
                        "value",
                      ],
                    },
                  },
                },
              ],
            },
          ]
        `);
        expect(ditto.value[1].value.$meta).toMatchInlineSnapshot(`
          Object {
            "order": 8,
            "original": Array [
              Object {
                "id": 3,
                "value": "baz",
              },
            ],
            "path": Array [
              1,
              "value",
            ],
          }
        `);
        expect(ditto.value.$meta).toMatchInlineSnapshot(`
          Object {
            "order": 10,
            "original": Array [
              Object {
                "id": 1,
                "value": "foo",
              },
              Object {
                "id": 2,
                "value": Array [
                  Object {
                    "id": 3,
                    "value": "baz",
                  },
                ],
              },
            ],
            "path": Array [],
          }
        `);
      });

      test("lookup set 1", async () => {
        const original = ref<
          (
            | { id: number; value: string }
            | { id: number; value: [{ id: number; value: string }] }
          )[]
        >([{ id: 1, value: "foo" }]);
        const ditto = commonDittoRef(original);

        original.value[1] = { id: 2, value: [{ id: 3, value: "bar" }] };
        await nextTick();

        expect(ditto.value).toMatchInlineSnapshot(`
          Array [
            Object {
              "$meta": Object {
                "order": 3,
                "original": Object {
                  "id": 1,
                  "value": "foo",
                },
                "path": Array [
                  0,
                ],
              },
              "id": Object {
                "$meta": Object {
                  "order": 1,
                  "original": 1,
                  "path": Array [
                    0,
                    "id",
                  ],
                },
              },
              "value": Object {
                "$meta": Object {
                  "order": 2,
                  "original": "foo",
                  "path": Array [
                    0,
                    "value",
                  ],
                },
              },
            },
            Object {
              "$meta": Object {
                "order": 10,
                "original": Object {
                  "id": 2,
                  "value": Array [
                    Object {
                      "id": 3,
                      "value": "bar",
                    },
                  ],
                },
                "path": Array [
                  1,
                ],
              },
              "id": Object {
                "$meta": Object {
                  "order": 5,
                  "original": 2,
                  "path": Array [
                    1,
                    "id",
                  ],
                },
              },
              "value": Array [
                Object {
                  "$meta": Object {
                    "order": 8,
                    "original": Object {
                      "id": 3,
                      "value": "bar",
                    },
                    "path": Array [
                      1,
                      "value",
                      0,
                    ],
                  },
                  "id": Object {
                    "$meta": Object {
                      "order": 6,
                      "original": 3,
                      "path": Array [
                        1,
                        "value",
                        0,
                        "id",
                      ],
                    },
                  },
                  "value": Object {
                    "$meta": Object {
                      "order": 7,
                      "original": "bar",
                      "path": Array [
                        1,
                        "value",
                        0,
                        "value",
                      ],
                    },
                  },
                },
              ],
            },
          ]
        `);
        expect(ditto.value[1].value.$meta).toMatchInlineSnapshot(`
          Object {
            "order": 9,
            "original": Array [
              Object {
                "id": 3,
                "value": "bar",
              },
            ],
            "path": Array [
              1,
              "value",
            ],
          }
        `);
        expect(ditto.value.$meta).toMatchInlineSnapshot(`
          Object {
            "order": 4,
            "original": Array [
              Object {
                "id": 1,
                "value": "foo",
              },
              Object {
                "id": 2,
                "value": Array [
                  Object {
                    "id": 3,
                    "value": "bar",
                  },
                ],
              },
            ],
            "path": Array [],
          }
        `);
      });

      test("lookup set 2 (sparse)", async () => {
        const original = ref<
          (
            | { id: number; value: string }
            | { id: number; value: [{ id: number; value: string }] }
          )[]
        >(Array(2));
        original.value[1] = { id: 1, value: "foo" };
        const ditto = commonDittoRef(original);

        original.value[0] = { id: 2, value: [{ id: 3, value: "bar" }] };
        await nextTick();

        expect(ditto.value).toMatchInlineSnapshot(`
          Array [
            Object {
              "$meta": Object {
                "order": 10,
                "original": Object {
                  "id": 2,
                  "value": Array [
                    Object {
                      "id": 3,
                      "value": "bar",
                    },
                  ],
                },
                "path": Array [
                  0,
                ],
              },
              "id": Object {
                "$meta": Object {
                  "order": 5,
                  "original": 2,
                  "path": Array [
                    0,
                    "id",
                  ],
                },
              },
              "value": Array [
                Object {
                  "$meta": Object {
                    "order": 8,
                    "original": Object {
                      "id": 3,
                      "value": "bar",
                    },
                    "path": Array [
                      0,
                      "value",
                      0,
                    ],
                  },
                  "id": Object {
                    "$meta": Object {
                      "order": 6,
                      "original": 3,
                      "path": Array [
                        0,
                        "value",
                        0,
                        "id",
                      ],
                    },
                  },
                  "value": Object {
                    "$meta": Object {
                      "order": 7,
                      "original": "bar",
                      "path": Array [
                        0,
                        "value",
                        0,
                        "value",
                      ],
                    },
                  },
                },
              ],
            },
            Object {
              "$meta": Object {
                "order": 3,
                "original": Object {
                  "id": 1,
                  "value": "foo",
                },
                "path": Array [
                  1,
                ],
              },
              "id": Object {
                "$meta": Object {
                  "order": 1,
                  "original": 1,
                  "path": Array [
                    1,
                    "id",
                  ],
                },
              },
              "value": Object {
                "$meta": Object {
                  "order": 2,
                  "original": "foo",
                  "path": Array [
                    1,
                    "value",
                  ],
                },
              },
            },
          ]
        `);
        expect(ditto.value[0].value.$meta).toMatchInlineSnapshot(`
          Object {
            "order": 9,
            "original": Array [
              Object {
                "id": 3,
                "value": "bar",
              },
            ],
            "path": Array [
              0,
              "value",
            ],
          }
        `);
        expect(ditto.value.$meta).toMatchInlineSnapshot(`
          Object {
            "order": 4,
            "original": Array [
              Object {
                "id": 2,
                "value": Array [
                  Object {
                    "id": 3,
                    "value": "bar",
                  },
                ],
              },
              Object {
                "id": 1,
                "value": "foo",
              },
            ],
            "path": Array [],
          }
        `);
      });

      test("lookup set 3 (sparse)", async () => {
        const original = ref<
          (
            | { id: number; value: string }
            | { id: number; value: [{ id: number; value: string }] }
          )[]
        >([{ id: 1, value: "foo" }]);
        const ditto = commonDittoRef(original);

        original.value[2] = { id: 2, value: [{ id: 3, value: "bar" }] };
        await nextTick();

        expect(ditto.value).toMatchInlineSnapshot(`
          Array [
            Object {
              "$meta": Object {
                "order": 3,
                "original": Object {
                  "id": 1,
                  "value": "foo",
                },
                "path": Array [
                  0,
                ],
              },
              "id": Object {
                "$meta": Object {
                  "order": 1,
                  "original": 1,
                  "path": Array [
                    0,
                    "id",
                  ],
                },
              },
              "value": Object {
                "$meta": Object {
                  "order": 2,
                  "original": "foo",
                  "path": Array [
                    0,
                    "value",
                  ],
                },
              },
            },
            ,
            Object {
              "$meta": Object {
                "order": 10,
                "original": Object {
                  "id": 2,
                  "value": Array [
                    Object {
                      "id": 3,
                      "value": "bar",
                    },
                  ],
                },
                "path": Array [
                  2,
                ],
              },
              "id": Object {
                "$meta": Object {
                  "order": 5,
                  "original": 2,
                  "path": Array [
                    2,
                    "id",
                  ],
                },
              },
              "value": Array [
                Object {
                  "$meta": Object {
                    "order": 8,
                    "original": Object {
                      "id": 3,
                      "value": "bar",
                    },
                    "path": Array [
                      2,
                      "value",
                      0,
                    ],
                  },
                  "id": Object {
                    "$meta": Object {
                      "order": 6,
                      "original": 3,
                      "path": Array [
                        2,
                        "value",
                        0,
                        "id",
                      ],
                    },
                  },
                  "value": Object {
                    "$meta": Object {
                      "order": 7,
                      "original": "bar",
                      "path": Array [
                        2,
                        "value",
                        0,
                        "value",
                      ],
                    },
                  },
                },
              ],
            },
          ]
        `);
        expect(ditto.value[2].value.$meta).toMatchInlineSnapshot(`
          Object {
            "order": 9,
            "original": Array [
              Object {
                "id": 3,
                "value": "bar",
              },
            ],
            "path": Array [
              2,
              "value",
            ],
          }
        `);
        expect(ditto.value.$meta).toMatchInlineSnapshot(`
          Object {
            "order": 4,
            "original": Array [
              Object {
                "id": 1,
                "value": "foo",
              },
              ,
              Object {
                "id": 2,
                "value": Array [
                  Object {
                    "id": 3,
                    "value": "bar",
                  },
                ],
              },
            ],
            "path": Array [],
          }
        `);
      });

      test("lookup delete 1 (sparse)", async () => {
        const original = ref<
          (
            | { id: number; value: string }
            | { id: number; value: [{ id: number; value: string }] }
          )[]
        >([
          { id: 1, value: "foo" },
          { id: 2, value: [{ id: 3, value: "bar" }] },
        ]);
        const ditto = commonDittoRef(original);

        delete original.value[0];
        await nextTick();

        expect(ditto.value).toMatchInlineSnapshot(`
          Array [
            ,
            Object {
              "$meta": Object {
                "order": 9,
                "original": Object {
                  "id": 2,
                  "value": Array [
                    Object {
                      "id": 3,
                      "value": "bar",
                    },
                  ],
                },
                "path": Array [
                  1,
                ],
              },
              "id": Object {
                "$meta": Object {
                  "order": 4,
                  "original": 2,
                  "path": Array [
                    1,
                    "id",
                  ],
                },
              },
              "value": Array [
                Object {
                  "$meta": Object {
                    "order": 7,
                    "original": Object {
                      "id": 3,
                      "value": "bar",
                    },
                    "path": Array [
                      1,
                      "value",
                      0,
                    ],
                  },
                  "id": Object {
                    "$meta": Object {
                      "order": 5,
                      "original": 3,
                      "path": Array [
                        1,
                        "value",
                        0,
                        "id",
                      ],
                    },
                  },
                  "value": Object {
                    "$meta": Object {
                      "order": 6,
                      "original": "bar",
                      "path": Array [
                        1,
                        "value",
                        0,
                        "value",
                      ],
                    },
                  },
                },
              ],
            },
          ]
        `);
        expect(ditto.value[1].value.$meta).toMatchInlineSnapshot(`
          Object {
            "order": 8,
            "original": Array [
              Object {
                "id": 3,
                "value": "bar",
              },
            ],
            "path": Array [
              1,
              "value",
            ],
          }
        `);
        expect(ditto.value.$meta).toMatchInlineSnapshot(`
          Object {
            "order": 10,
            "original": Array [
              ,
              Object {
                "id": 2,
                "value": Array [
                  Object {
                    "id": 3,
                    "value": "bar",
                  },
                ],
              },
            ],
            "path": Array [],
          }
        `);
      });

      test("lookup delete 2 (sparse)", async () => {
        const original = ref<
          (
            | { id: number; value: string }
            | { id: number; value: [{ id: number; value: string }] }
          )[]
        >([
          { id: 1, value: "foo" },
          { id: 2, value: [{ id: 3, value: "bar" }] },
        ]);
        const ditto = commonDittoRef(original);

        delete original.value[1];
        await nextTick();

        expect(ditto.value).toMatchInlineSnapshot(`
          Array [
            Object {
              "$meta": Object {
                "order": 3,
                "original": Object {
                  "id": 1,
                  "value": "foo",
                },
                "path": Array [
                  0,
                ],
              },
              "id": Object {
                "$meta": Object {
                  "order": 1,
                  "original": 1,
                  "path": Array [
                    0,
                    "id",
                  ],
                },
              },
              "value": Object {
                "$meta": Object {
                  "order": 2,
                  "original": "foo",
                  "path": Array [
                    0,
                    "value",
                  ],
                },
              },
            },
            ,
          ]
        `);
        expect(ditto.value.$meta).toMatchInlineSnapshot(`
          Object {
            "order": 10,
            "original": Array [
              Object {
                "id": 1,
                "value": "foo",
              },
              ,
            ],
            "path": Array [],
          }
        `);
      });

      test("length 1", async () => {
        const original = ref<
          (
            | { id: number; value: string }
            | { id: number; value: [{ id: number; value: string }] }
          )[]
        >([
          { id: 1, value: "foo" },
          { id: 2, value: [{ id: 3, value: "bar" }] },
        ]);
        const ditto = commonDittoRef(original);

        original.value.length = 1;
        await nextTick();

        expect(ditto.value).toMatchInlineSnapshot(`
          Array [
            Object {
              "$meta": Object {
                "order": 3,
                "original": Object {
                  "id": 1,
                  "value": "foo",
                },
                "path": Array [
                  0,
                ],
              },
              "id": Object {
                "$meta": Object {
                  "order": 1,
                  "original": 1,
                  "path": Array [
                    0,
                    "id",
                  ],
                },
              },
              "value": Object {
                "$meta": Object {
                  "order": 2,
                  "original": "foo",
                  "path": Array [
                    0,
                    "value",
                  ],
                },
              },
            },
          ]
        `);
        expect(ditto.value.$meta).toMatchInlineSnapshot(`
          Object {
            "order": 10,
            "original": Array [
              Object {
                "id": 1,
                "value": "foo",
              },
            ],
            "path": Array [],
          }
        `);
      });

      test("length 2 (sparse)", async () => {
        const original = ref<
          {
            id: number;
            value: string;
          }[]
        >([{ id: 1, value: "foo" }]);
        const ditto = commonDittoRef(original);

        original.value.length = 2;
        await nextTick();

        expect(ditto.value).toMatchInlineSnapshot(`
          Array [
            Object {
              "$meta": Object {
                "order": 3,
                "original": Object {
                  "id": 1,
                  "value": "foo",
                },
                "path": Array [
                  0,
                ],
              },
              "id": Object {
                "$meta": Object {
                  "order": 1,
                  "original": 1,
                  "path": Array [
                    0,
                    "id",
                  ],
                },
              },
              "value": Object {
                "$meta": Object {
                  "order": 2,
                  "original": "foo",
                  "path": Array [
                    0,
                    "value",
                  ],
                },
              },
            },
            ,
          ]
        `);
        expect(ditto.value.$meta).toMatchInlineSnapshot(`
          Object {
            "order": 4,
            "original": Array [
              Object {
                "id": 1,
                "value": "foo",
              },
              ,
            ],
            "path": Array [],
          }
        `);
      });

      test("push 1", async () => {
        const original = ref<
          [
            | { id: number; value: string }
            | { id: number; value: { id: number; value: string }[] }
          ]
        >([{ id: 1, value: "foo" }]);
        const ditto = commonDittoRef(original);

        original.value.push({ id: 2, value: [{ id: 3, value: "bar" }] });
        await nextTick();

        expect(ditto.value).toMatchInlineSnapshot(`
          Array [
            Object {
              "$meta": Object {
                "order": 3,
                "original": Object {
                  "id": 1,
                  "value": "foo",
                },
                "path": Array [
                  0,
                ],
              },
              "id": Object {
                "$meta": Object {
                  "order": 1,
                  "original": 1,
                  "path": Array [
                    0,
                    "id",
                  ],
                },
              },
              "value": Object {
                "$meta": Object {
                  "order": 2,
                  "original": "foo",
                  "path": Array [
                    0,
                    "value",
                  ],
                },
              },
            },
            Object {
              "$meta": Object {
                "order": 10,
                "original": Object {
                  "id": 2,
                  "value": Array [
                    Object {
                      "id": 3,
                      "value": "bar",
                    },
                  ],
                },
                "path": Array [
                  1,
                ],
              },
              "id": Object {
                "$meta": Object {
                  "order": 5,
                  "original": 2,
                  "path": Array [
                    1,
                    "id",
                  ],
                },
              },
              "value": Array [
                Object {
                  "$meta": Object {
                    "order": 8,
                    "original": Object {
                      "id": 3,
                      "value": "bar",
                    },
                    "path": Array [
                      1,
                      "value",
                      0,
                    ],
                  },
                  "id": Object {
                    "$meta": Object {
                      "order": 6,
                      "original": 3,
                      "path": Array [
                        1,
                        "value",
                        0,
                        "id",
                      ],
                    },
                  },
                  "value": Object {
                    "$meta": Object {
                      "order": 7,
                      "original": "bar",
                      "path": Array [
                        1,
                        "value",
                        0,
                        "value",
                      ],
                    },
                  },
                },
              ],
            },
          ]
        `);
        expect(ditto.value[1].value.$meta).toMatchInlineSnapshot(`
          Object {
            "order": 9,
            "original": Array [
              Object {
                "id": 3,
                "value": "bar",
              },
            ],
            "path": Array [
              1,
              "value",
            ],
          }
        `);
        expect(ditto.value.$meta).toMatchInlineSnapshot(`
          Object {
            "order": 4,
            "original": Array [
              Object {
                "id": 1,
                "value": "foo",
              },
              Object {
                "id": 2,
                "value": Array [
                  Object {
                    "id": 3,
                    "value": "bar",
                  },
                ],
              },
            ],
            "path": Array [],
          }
        `);
      });

      test("pop 1", async () => {
        const original = ref<
          [
            { id: number; value: string },
            { id: number; value: { id: number; value: string }[] } | undefined
          ]
        >([
          { id: 1, value: "foo" },
          { id: 2, value: [{ id: 3, value: "bar" }] },
        ]);
        const ditto = commonDittoRef(original);

        original.value.pop();
        await nextTick();

        expect(ditto.value).toMatchInlineSnapshot(`
          Array [
            Object {
              "$meta": Object {
                "order": 3,
                "original": Object {
                  "id": 1,
                  "value": "foo",
                },
                "path": Array [
                  0,
                ],
              },
              "id": Object {
                "$meta": Object {
                  "order": 1,
                  "original": 1,
                  "path": Array [
                    0,
                    "id",
                  ],
                },
              },
              "value": Object {
                "$meta": Object {
                  "order": 2,
                  "original": "foo",
                  "path": Array [
                    0,
                    "value",
                  ],
                },
              },
            },
          ]
        `);
        expect(ditto.value.$meta).toMatchInlineSnapshot(`
          Object {
            "order": 10,
            "original": Array [
              Object {
                "id": 1,
                "value": "foo",
              },
            ],
            "path": Array [],
          }
        `);
      });

      test("unshift 1", async () => {
        const original = ref<
          [
            | { id: number; value: string }
            | { id: number; value: { id: number; value: string }[] }
          ]
        >([{ id: 1, value: "foo" }]);
        const ditto = commonDittoRef(original);

        original.value.unshift({ id: 2, value: [{ id: 3, value: "bar" }] });
        await nextTick();

        expect(ditto.value).toMatchInlineSnapshot(`
          Array [
            Object {
              "$meta": Object {
                "order": 10,
                "original": Object {
                  "id": 2,
                  "value": Array [
                    Object {
                      "id": 3,
                      "value": "bar",
                    },
                  ],
                },
                "path": Array [
                  0,
                ],
              },
              "id": Object {
                "$meta": Object {
                  "order": 5,
                  "original": 2,
                  "path": Array [
                    0,
                    "id",
                  ],
                },
              },
              "value": Array [
                Object {
                  "$meta": Object {
                    "order": 8,
                    "original": Object {
                      "id": 3,
                      "value": "bar",
                    },
                    "path": Array [
                      0,
                      "value",
                      0,
                    ],
                  },
                  "id": Object {
                    "$meta": Object {
                      "order": 6,
                      "original": 3,
                      "path": Array [
                        0,
                        "value",
                        0,
                        "id",
                      ],
                    },
                  },
                  "value": Object {
                    "$meta": Object {
                      "order": 7,
                      "original": "bar",
                      "path": Array [
                        0,
                        "value",
                        0,
                        "value",
                      ],
                    },
                  },
                },
              ],
            },
            Object {
              "$meta": Object {
                "order": 13,
                "original": Object {
                  "id": 1,
                  "value": "foo",
                },
                "path": Array [
                  1,
                ],
              },
              "id": Object {
                "$meta": Object {
                  "order": 11,
                  "original": 1,
                  "path": Array [
                    1,
                    "id",
                  ],
                },
              },
              "value": Object {
                "$meta": Object {
                  "order": 12,
                  "original": "foo",
                  "path": Array [
                    1,
                    "value",
                  ],
                },
              },
            },
          ]
        `);
        expect(ditto.value[0].value.$meta).toMatchInlineSnapshot(`
          Object {
            "order": 9,
            "original": Array [
              Object {
                "id": 3,
                "value": "bar",
              },
            ],
            "path": Array [
              0,
              "value",
            ],
          }
        `);
        expect(ditto.value.$meta).toMatchInlineSnapshot(`
          Object {
            "order": 4,
            "original": Array [
              Object {
                "id": 2,
                "value": Array [
                  Object {
                    "id": 3,
                    "value": "bar",
                  },
                ],
              },
              Object {
                "id": 1,
                "value": "foo",
              },
            ],
            "path": Array [],
          }
        `);
      });

      test("shift 1", async () => {
        const original = ref<
          [
            (
              | { id: number; value: string }
              | { id: number; value: { id: number; value: string }[] }
            ),
            { id: number; value: { id: number; value: string }[] }
          ]
        >([
          { id: 1, value: "a" },
          { id: 2, value: [{ id: 3, value: "b" }] },
        ]);
        const ditto = commonDittoRef(original);

        original.value.shift();
        await nextTick();

        expect(ditto.value).toMatchInlineSnapshot(`
          Array [
            Object {
              "$meta": Object {
                "order": 16,
                "original": Object {
                  "id": 2,
                  "value": Array [
                    Object {
                      "id": 3,
                      "value": "b",
                    },
                  ],
                },
                "path": Array [
                  0,
                ],
              },
              "id": Object {
                "$meta": Object {
                  "order": 11,
                  "original": 2,
                  "path": Array [
                    0,
                    "id",
                  ],
                },
              },
              "value": Array [
                Object {
                  "$meta": Object {
                    "order": 14,
                    "original": Object {
                      "id": 3,
                      "value": "b",
                    },
                    "path": Array [
                      0,
                      "value",
                      0,
                    ],
                  },
                  "id": Object {
                    "$meta": Object {
                      "order": 12,
                      "original": 3,
                      "path": Array [
                        0,
                        "value",
                        0,
                        "id",
                      ],
                    },
                  },
                  "value": Object {
                    "$meta": Object {
                      "order": 13,
                      "original": "b",
                      "path": Array [
                        0,
                        "value",
                        0,
                        "value",
                      ],
                    },
                  },
                },
              ],
            },
          ]
        `);
        expect(ditto.value[0].value.$meta).toMatchInlineSnapshot(`
          Object {
            "order": 15,
            "original": Array [
              Object {
                "id": 3,
                "value": "b",
              },
            ],
            "path": Array [
              0,
              "value",
            ],
          }
        `);
        expect(ditto.value.$meta).toMatchInlineSnapshot(`
          Object {
            "order": 10,
            "original": Array [
              Object {
                "id": 2,
                "value": Array [
                  Object {
                    "id": 3,
                    "value": "b",
                  },
                ],
              },
            ],
            "path": Array [],
          }
        `);
      });

      test("reverse 1", async () => {
        const original = ref<{ id: number; value: string }[]>([
          { id: 1, value: "a" },
          { id: 2, value: "b" },
          { id: 3, value: "c" },
          { id: 4, value: "d" },
        ]);
        const ditto = commonDittoRef(original);

        original.value.reverse();
        await nextTick();

        expect(ditto.value).toMatchInlineSnapshot(`
          Array [
            Object {
              "$meta": Object {
                "order": 16,
                "original": Object {
                  "id": 4,
                  "value": "d",
                },
                "path": Array [
                  0,
                ],
              },
              "id": Object {
                "$meta": Object {
                  "order": 14,
                  "original": 4,
                  "path": Array [
                    0,
                    "id",
                  ],
                },
              },
              "value": Object {
                "$meta": Object {
                  "order": 15,
                  "original": "d",
                  "path": Array [
                    0,
                    "value",
                  ],
                },
              },
            },
            Object {
              "$meta": Object {
                "order": 19,
                "original": Object {
                  "id": 3,
                  "value": "c",
                },
                "path": Array [
                  1,
                ],
              },
              "id": Object {
                "$meta": Object {
                  "order": 17,
                  "original": 3,
                  "path": Array [
                    1,
                    "id",
                  ],
                },
              },
              "value": Object {
                "$meta": Object {
                  "order": 18,
                  "original": "c",
                  "path": Array [
                    1,
                    "value",
                  ],
                },
              },
            },
            Object {
              "$meta": Object {
                "order": 22,
                "original": Object {
                  "id": 2,
                  "value": "b",
                },
                "path": Array [
                  2,
                ],
              },
              "id": Object {
                "$meta": Object {
                  "order": 20,
                  "original": 2,
                  "path": Array [
                    2,
                    "id",
                  ],
                },
              },
              "value": Object {
                "$meta": Object {
                  "order": 21,
                  "original": "b",
                  "path": Array [
                    2,
                    "value",
                  ],
                },
              },
            },
            Object {
              "$meta": Object {
                "order": 25,
                "original": Object {
                  "id": 1,
                  "value": "a",
                },
                "path": Array [
                  3,
                ],
              },
              "id": Object {
                "$meta": Object {
                  "order": 23,
                  "original": 1,
                  "path": Array [
                    3,
                    "id",
                  ],
                },
              },
              "value": Object {
                "$meta": Object {
                  "order": 24,
                  "original": "a",
                  "path": Array [
                    3,
                    "value",
                  ],
                },
              },
            },
          ]
        `);
        expect(ditto.value.$meta).toMatchInlineSnapshot(`
          Object {
            "order": 13,
            "original": Array [
              Object {
                "id": 4,
                "value": "d",
              },
              Object {
                "id": 3,
                "value": "c",
              },
              Object {
                "id": 2,
                "value": "b",
              },
              Object {
                "id": 1,
                "value": "a",
              },
            ],
            "path": Array [],
          }
        `);
      });

      test("reverse 2", async () => {
        const original = ref<{ id: number; value: string }[]>([
          { id: 1, value: "a" },
          { id: 2, value: "b" },
          { id: 3, value: "c" },
          { id: 4, value: "d" },
        ]);
        const ditto = commonDittoRef(original);

        original.value.reverse();
        await nextTick();

        original.value.reverse();
        await nextTick();

        expect(ditto.value).toMatchInlineSnapshot(`
          Array [
            Object {
              "$meta": Object {
                "order": 28,
                "original": Object {
                  "id": 1,
                  "value": "a",
                },
                "path": Array [
                  0,
                ],
              },
              "id": Object {
                "$meta": Object {
                  "order": 26,
                  "original": 1,
                  "path": Array [
                    0,
                    "id",
                  ],
                },
              },
              "value": Object {
                "$meta": Object {
                  "order": 27,
                  "original": "a",
                  "path": Array [
                    0,
                    "value",
                  ],
                },
              },
            },
            Object {
              "$meta": Object {
                "order": 31,
                "original": Object {
                  "id": 2,
                  "value": "b",
                },
                "path": Array [
                  1,
                ],
              },
              "id": Object {
                "$meta": Object {
                  "order": 29,
                  "original": 2,
                  "path": Array [
                    1,
                    "id",
                  ],
                },
              },
              "value": Object {
                "$meta": Object {
                  "order": 30,
                  "original": "b",
                  "path": Array [
                    1,
                    "value",
                  ],
                },
              },
            },
            Object {
              "$meta": Object {
                "order": 34,
                "original": Object {
                  "id": 3,
                  "value": "c",
                },
                "path": Array [
                  2,
                ],
              },
              "id": Object {
                "$meta": Object {
                  "order": 32,
                  "original": 3,
                  "path": Array [
                    2,
                    "id",
                  ],
                },
              },
              "value": Object {
                "$meta": Object {
                  "order": 33,
                  "original": "c",
                  "path": Array [
                    2,
                    "value",
                  ],
                },
              },
            },
            Object {
              "$meta": Object {
                "order": 37,
                "original": Object {
                  "id": 4,
                  "value": "d",
                },
                "path": Array [
                  3,
                ],
              },
              "id": Object {
                "$meta": Object {
                  "order": 35,
                  "original": 4,
                  "path": Array [
                    3,
                    "id",
                  ],
                },
              },
              "value": Object {
                "$meta": Object {
                  "order": 36,
                  "original": "d",
                  "path": Array [
                    3,
                    "value",
                  ],
                },
              },
            },
          ]
        `);
        expect(ditto.value.$meta).toMatchInlineSnapshot(`
          Object {
            "order": 13,
            "original": Array [
              Object {
                "id": 1,
                "value": "a",
              },
              Object {
                "id": 2,
                "value": "b",
              },
              Object {
                "id": 3,
                "value": "c",
              },
              Object {
                "id": 4,
                "value": "d",
              },
            ],
            "path": Array [],
          }
        `);
      });

      test("sort 1", async () => {
        const original = ref<{ id: number; value: string }[]>([
          { id: 1, value: "d" },
          { id: 2, value: "a" },
          { id: 3, value: "c" },
          { id: 4, value: "b" },
        ]);
        const ditto = commonDittoRef(original);

        original.value.sort((a, b) => a.value.localeCompare(b.value));
        await nextTick();

        expect(ditto.value).toMatchInlineSnapshot(`
          Array [
            Object {
              "$meta": Object {
                "order": 16,
                "original": Object {
                  "id": 2,
                  "value": "a",
                },
                "path": Array [
                  0,
                ],
              },
              "id": Object {
                "$meta": Object {
                  "order": 14,
                  "original": 2,
                  "path": Array [
                    0,
                    "id",
                  ],
                },
              },
              "value": Object {
                "$meta": Object {
                  "order": 15,
                  "original": "a",
                  "path": Array [
                    0,
                    "value",
                  ],
                },
              },
            },
            Object {
              "$meta": Object {
                "order": 19,
                "original": Object {
                  "id": 4,
                  "value": "b",
                },
                "path": Array [
                  1,
                ],
              },
              "id": Object {
                "$meta": Object {
                  "order": 17,
                  "original": 4,
                  "path": Array [
                    1,
                    "id",
                  ],
                },
              },
              "value": Object {
                "$meta": Object {
                  "order": 18,
                  "original": "b",
                  "path": Array [
                    1,
                    "value",
                  ],
                },
              },
            },
            Object {
              "$meta": Object {
                "order": 9,
                "original": Object {
                  "id": 3,
                  "value": "c",
                },
                "path": Array [
                  2,
                ],
              },
              "id": Object {
                "$meta": Object {
                  "order": 7,
                  "original": 3,
                  "path": Array [
                    2,
                    "id",
                  ],
                },
              },
              "value": Object {
                "$meta": Object {
                  "order": 8,
                  "original": "c",
                  "path": Array [
                    2,
                    "value",
                  ],
                },
              },
            },
            Object {
              "$meta": Object {
                "order": 22,
                "original": Object {
                  "id": 1,
                  "value": "d",
                },
                "path": Array [
                  3,
                ],
              },
              "id": Object {
                "$meta": Object {
                  "order": 20,
                  "original": 1,
                  "path": Array [
                    3,
                    "id",
                  ],
                },
              },
              "value": Object {
                "$meta": Object {
                  "order": 21,
                  "original": "d",
                  "path": Array [
                    3,
                    "value",
                  ],
                },
              },
            },
          ]
        `);
        expect(ditto.value.$meta).toMatchInlineSnapshot(`
          Object {
            "order": 13,
            "original": Array [
              Object {
                "id": 2,
                "value": "a",
              },
              Object {
                "id": 4,
                "value": "b",
              },
              Object {
                "id": 3,
                "value": "c",
              },
              Object {
                "id": 1,
                "value": "d",
              },
            ],
            "path": Array [],
          }
        `);
      });

      test("sort 2", async () => {
        const original = ref<{ id: number; value: string }[]>([
          { id: 1, value: "d" },
          { id: 2, value: "a" },
          { id: 3, value: "c" },
          { id: 4, value: "b" },
        ]);
        const ditto = commonDittoRef(original);

        original.value.sort((a, b) => a.value.localeCompare(b.value));
        await nextTick();

        original.value.sort((a, b) => a.id - b.id);
        await nextTick();

        expect(ditto.value).toMatchInlineSnapshot(`
          Array [
            Object {
              "$meta": Object {
                "order": 25,
                "original": Object {
                  "id": 1,
                  "value": "d",
                },
                "path": Array [
                  0,
                ],
              },
              "id": Object {
                "$meta": Object {
                  "order": 23,
                  "original": 1,
                  "path": Array [
                    0,
                    "id",
                  ],
                },
              },
              "value": Object {
                "$meta": Object {
                  "order": 24,
                  "original": "d",
                  "path": Array [
                    0,
                    "value",
                  ],
                },
              },
            },
            Object {
              "$meta": Object {
                "order": 28,
                "original": Object {
                  "id": 2,
                  "value": "a",
                },
                "path": Array [
                  1,
                ],
              },
              "id": Object {
                "$meta": Object {
                  "order": 26,
                  "original": 2,
                  "path": Array [
                    1,
                    "id",
                  ],
                },
              },
              "value": Object {
                "$meta": Object {
                  "order": 27,
                  "original": "a",
                  "path": Array [
                    1,
                    "value",
                  ],
                },
              },
            },
            Object {
              "$meta": Object {
                "order": 9,
                "original": Object {
                  "id": 3,
                  "value": "c",
                },
                "path": Array [
                  2,
                ],
              },
              "id": Object {
                "$meta": Object {
                  "order": 7,
                  "original": 3,
                  "path": Array [
                    2,
                    "id",
                  ],
                },
              },
              "value": Object {
                "$meta": Object {
                  "order": 8,
                  "original": "c",
                  "path": Array [
                    2,
                    "value",
                  ],
                },
              },
            },
            Object {
              "$meta": Object {
                "order": 31,
                "original": Object {
                  "id": 4,
                  "value": "b",
                },
                "path": Array [
                  3,
                ],
              },
              "id": Object {
                "$meta": Object {
                  "order": 29,
                  "original": 4,
                  "path": Array [
                    3,
                    "id",
                  ],
                },
              },
              "value": Object {
                "$meta": Object {
                  "order": 30,
                  "original": "b",
                  "path": Array [
                    3,
                    "value",
                  ],
                },
              },
            },
          ]
        `);
        expect(ditto.value.$meta).toMatchInlineSnapshot(`
          Object {
            "order": 13,
            "original": Array [
              Object {
                "id": 1,
                "value": "d",
              },
              Object {
                "id": 2,
                "value": "a",
              },
              Object {
                "id": 3,
                "value": "c",
              },
              Object {
                "id": 4,
                "value": "b",
              },
            ],
            "path": Array [],
          }
        `);
      });

      test("same id 1", async () => {
        const original = ref<{ id: number; value: string }[]>([
          { id: 1, value: "foo" },
        ]);
        const ditto = commonDittoRef(original);

        original.value[1] = { id: 1, value: "foo" };
        delete original.value[0];
        await nextTick();

        expect(ditto.value).toMatchInlineSnapshot(`
          Array [
            ,
            Object {
              "$meta": Object {
                "order": 7,
                "original": Object {
                  "id": 1,
                  "value": "foo",
                },
                "path": Array [
                  1,
                ],
              },
              "id": Object {
                "$meta": Object {
                  "order": 5,
                  "original": 1,
                  "path": Array [
                    1,
                    "id",
                  ],
                },
              },
              "value": Object {
                "$meta": Object {
                  "order": 6,
                  "original": "foo",
                  "path": Array [
                    1,
                    "value",
                  ],
                },
              },
            },
          ]
        `);
        expect(ditto.value.$meta).toMatchInlineSnapshot(`
          Object {
            "order": 4,
            "original": Array [
              ,
              Object {
                "id": 1,
                "value": "foo",
              },
            ],
            "path": Array [],
          }
        `);
      });

      test("same id 2", async () => {
        const original = ref<{ id: number; value: string }[]>([
          { id: 1, value: "foo" },
        ]);
        const ditto = commonDittoRef(original);

        original.value[1] = original.value[0];
        delete original.value[0];
        await nextTick();

        expect(ditto.value).toMatchInlineSnapshot(`
          Array [
            ,
            Object {
              "$meta": Object {
                "order": 7,
                "original": Object {
                  "id": 1,
                  "value": "foo",
                },
                "path": Array [
                  1,
                ],
              },
              "id": Object {
                "$meta": Object {
                  "order": 5,
                  "original": 1,
                  "path": Array [
                    1,
                    "id",
                  ],
                },
              },
              "value": Object {
                "$meta": Object {
                  "order": 6,
                  "original": "foo",
                  "path": Array [
                    1,
                    "value",
                  ],
                },
              },
            },
          ]
        `);
        expect(ditto.value.$meta).toMatchInlineSnapshot(`
          Object {
            "order": 4,
            "original": Array [
              ,
              Object {
                "id": 1,
                "value": "foo",
              },
            ],
            "path": Array [],
          }
        `);
      });
    });

    describe("mixed", () => {
      describe("primitive to others", () => {
        test("undefined 1", async () => {
          const original = ref<string | undefined>("foo");
          const ditto = commonDittoRef(original);

          original.value = undefined;
          await nextTick();

          expect(ditto.value).toMatchInlineSnapshot(`
            Object {
              "$meta": Object {
                "order": 2,
                "original": undefined,
                "path": Array [],
              },
            }
          `);
        });

        test("object 1", async () => {
          const original = ref<string | { foo: number; bar: { baz: number } }>(
            "foo"
          );
          const ditto = commonDittoRef(original);

          original.value = { foo: 42, bar: { baz: 43 } };
          await nextTick();

          expect(ditto.value).toMatchInlineSnapshot(`
            Object {
              "$meta": Object {
                "order": 5,
                "original": Object {
                  "bar": Object {
                    "baz": 43,
                  },
                  "foo": 42,
                },
                "path": Array [],
              },
              "bar": Object {
                "$meta": Object {
                  "order": 4,
                  "original": Object {
                    "baz": 43,
                  },
                  "path": Array [
                    "bar",
                  ],
                },
                "baz": Object {
                  "$meta": Object {
                    "order": 3,
                    "original": 43,
                    "path": Array [
                      "bar",
                      "baz",
                    ],
                  },
                },
              },
              "foo": Object {
                "$meta": Object {
                  "order": 2,
                  "original": 42,
                  "path": Array [
                    "foo",
                  ],
                },
              },
            }
          `);
        });

        test("array 1", async () => {
          const original = ref<string | { id: number; foo: number }[]>("foo");
          const ditto = commonDittoRef(original);

          original.value = [{ id: 1, foo: 42 }];
          await nextTick();

          expect(ditto.value).toMatchInlineSnapshot(`
            Array [
              Object {
                "$meta": Object {
                  "order": 4,
                  "original": Object {
                    "foo": 42,
                    "id": 1,
                  },
                  "path": Array [
                    0,
                  ],
                },
                "foo": Object {
                  "$meta": Object {
                    "order": 3,
                    "original": 42,
                    "path": Array [
                      0,
                      "foo",
                    ],
                  },
                },
                "id": Object {
                  "$meta": Object {
                    "order": 2,
                    "original": 1,
                    "path": Array [
                      0,
                      "id",
                    ],
                  },
                },
              },
            ]
          `);
          expect(ditto.value.$meta).toMatchInlineSnapshot(`
            Object {
              "order": 5,
              "original": Array [
                Object {
                  "foo": 42,
                  "id": 1,
                },
              ],
              "path": Array [],
            }
          `);
        });
      });

      describe("undefined to others", () => {
        test("primitive 1", async () => {
          const original = ref<undefined | string>();
          const ditto = commonDittoRef(original);

          original.value = "foo";
          await nextTick();

          expect(ditto.value).toMatchInlineSnapshot(`
            Object {
              "$meta": Object {
                "order": 2,
                "original": "foo",
                "path": Array [],
              },
            }
          `);
        });

        test("object 1", async () => {
          const original = ref<
            undefined | { foo: number; bar: { baz: number } }
          >(undefined);
          const ditto = commonDittoRef(original);

          original.value = { foo: 42, bar: { baz: 43 } };
          await nextTick();

          expect(ditto.value).toMatchInlineSnapshot(`
            Object {
              "$meta": Object {
                "order": 5,
                "original": Object {
                  "bar": Object {
                    "baz": 43,
                  },
                  "foo": 42,
                },
                "path": Array [],
              },
              "bar": Object {
                "$meta": Object {
                  "order": 4,
                  "original": Object {
                    "baz": 43,
                  },
                  "path": Array [
                    "bar",
                  ],
                },
                "baz": Object {
                  "$meta": Object {
                    "order": 3,
                    "original": 43,
                    "path": Array [
                      "bar",
                      "baz",
                    ],
                  },
                },
              },
              "foo": Object {
                "$meta": Object {
                  "order": 2,
                  "original": 42,
                  "path": Array [
                    "foo",
                  ],
                },
              },
            }
          `);
        });

        test("array 1", async () => {
          const original = ref<undefined | { id: number; foo: number }[]>();
          const ditto = commonDittoRef(original);

          original.value = [{ id: 1, foo: 42 }];
          await nextTick();

          expect(ditto.value).toMatchInlineSnapshot(`
            Array [
              Object {
                "$meta": Object {
                  "order": 4,
                  "original": Object {
                    "foo": 42,
                    "id": 1,
                  },
                  "path": Array [
                    0,
                  ],
                },
                "foo": Object {
                  "$meta": Object {
                    "order": 3,
                    "original": 42,
                    "path": Array [
                      0,
                      "foo",
                    ],
                  },
                },
                "id": Object {
                  "$meta": Object {
                    "order": 2,
                    "original": 1,
                    "path": Array [
                      0,
                      "id",
                    ],
                  },
                },
              },
            ]
          `);
          expect(ditto.value.$meta).toMatchInlineSnapshot(`
            Object {
              "order": 5,
              "original": Array [
                Object {
                  "foo": 42,
                  "id": 1,
                },
              ],
              "path": Array [],
            }
          `);
        });
      });

      describe("object to others", () => {
        test("undefined 1", async () => {
          const original = ref<{ a: string; b: { c: string } } | undefined>({
            a: "foo",
            b: { c: "bar" },
          });
          const ditto = commonDittoRef(original);

          original.value = undefined;
          await nextTick();

          expect(ditto.value).toMatchInlineSnapshot(`
            Object {
              "$meta": Object {
                "order": 5,
                "original": undefined,
                "path": Array [],
              },
            }
          `);
        });

        test("primitive 1", async () => {
          const original = ref<{ a: string; b: { c: string } } | string>({
            a: "foo",
            b: { c: "bar" },
          });
          const ditto = commonDittoRef(original);

          original.value = "foo";
          await nextTick();

          expect(ditto.value).toMatchInlineSnapshot(`
            Object {
              "$meta": Object {
                "order": 5,
                "original": "foo",
                "path": Array [],
              },
            }
          `);
        });

        test("array 1", async () => {
          const original = ref<
            { a: string; b: { c: string } } | { id: number; foo: number }[]
          >({
            a: "foo",
            b: { c: "bar" },
          });
          const ditto = commonDittoRef(original);

          original.value = [{ id: 1, foo: 42 }];
          await nextTick();

          expect(ditto.value).toMatchInlineSnapshot(`
            Array [
              Object {
                "$meta": Object {
                  "order": 7,
                  "original": Object {
                    "foo": 42,
                    "id": 1,
                  },
                  "path": Array [
                    0,
                  ],
                },
                "foo": Object {
                  "$meta": Object {
                    "order": 6,
                    "original": 42,
                    "path": Array [
                      0,
                      "foo",
                    ],
                  },
                },
                "id": Object {
                  "$meta": Object {
                    "order": 5,
                    "original": 1,
                    "path": Array [
                      0,
                      "id",
                    ],
                  },
                },
              },
            ]
          `);
          expect(ditto.value.$meta).toMatchInlineSnapshot(`
            Object {
              "order": 8,
              "original": Array [
                Object {
                  "foo": 42,
                  "id": 1,
                },
              ],
              "path": Array [],
            }
          `);
        });
      });

      describe("array to others", () => {
        test("undefined 1", async () => {
          const original = ref<[{ id: number; value: string }] | undefined>([
            { id: 0, value: "foo" },
          ]);
          const ditto = commonDittoRef(original);

          original.value = undefined;
          await nextTick();

          expect(ditto.value).toMatchInlineSnapshot(`
            Object {
              "$meta": Object {
                "order": 5,
                "original": undefined,
                "path": Array [],
              },
            }
          `);
        });

        test("primitive 1", async () => {
          const original = ref<[{ id: number; value: string }] | string>([
            { id: 0, value: "foo" },
          ]);
          const ditto = commonDittoRef(original);

          original.value = "foo";
          await nextTick();

          expect(ditto.value).toMatchInlineSnapshot(`
            Object {
              "$meta": Object {
                "order": 5,
                "original": "foo",
                "path": Array [],
              },
            }
          `);
        });

        test("object 1", async () => {
          const original = ref<
            | [{ id: number; value: string }]
            | { foo: number; bar: { baz: number } }
          >([{ id: 0, value: "foo" }]);
          const ditto = commonDittoRef(original);

          original.value = { foo: 42, bar: { baz: 43 } };
          await nextTick();

          expect(ditto.value).toMatchInlineSnapshot(`
            Object {
              "$meta": Object {
                "order": 8,
                "original": Object {
                  "bar": Object {
                    "baz": 43,
                  },
                  "foo": 42,
                },
                "path": Array [],
              },
              "bar": Object {
                "$meta": Object {
                  "order": 7,
                  "original": Object {
                    "baz": 43,
                  },
                  "path": Array [
                    "bar",
                  ],
                },
                "baz": Object {
                  "$meta": Object {
                    "order": 6,
                    "original": 43,
                    "path": Array [
                      "bar",
                      "baz",
                    ],
                  },
                },
              },
              "foo": Object {
                "$meta": Object {
                  "order": 5,
                  "original": 42,
                  "path": Array [
                    "foo",
                  ],
                },
              },
            }
          `);
        });
      });
    });
  });

  describe("hooks", () => {
    test("`onCreated` should be called before children created", () => {
      const onCreated = jest.fn();
      const original = ref({ foo: { bar: 42 } });
      dittoRef({ original, onCreated, flush: "sync" });

      expect(onCreated).toBeCalledTimes(3);
      expect(onCreated.mock.calls[0][0].path).toEqual([]);
      expect(onCreated.mock.calls[1][0].path).toEqual(["foo"]);
      expect(onCreated.mock.calls[2][0].path).toEqual(["foo", "bar"]);
    });

    test("`onChildrenCreated` should be called after children created", () => {
      const onChildrenCreated = jest.fn();
      const original = ref({ foo: { bar: 42 } });
      dittoRef({ original, onChildrenCreated, flush: "sync" });

      expect(onChildrenCreated).toBeCalledTimes(3);
      expect(onChildrenCreated.mock.calls[0][0].path).toEqual(["foo", "bar"]);
      expect(onChildrenCreated.mock.calls[1][0].path).toEqual(["foo"]);
      expect(onChildrenCreated.mock.calls[2][0].path).toEqual([]);
    });

    test("`onUpdated` should NOT be called if nothing changed", () => {
      const onUpdated = jest.fn();
      const original = ref({ foo: { bar: 42 } });
      dittoRef({ original, onUpdated, flush: "sync" });

      expect(onUpdated).not.toBeCalled();
    });

    test("`onChildrenUpdated` should NOT be called if nothing changed", () => {
      const onChildrenUpdated = jest.fn();
      const original = ref({ foo: { bar: 42 } });
      dittoRef({ original, onChildrenUpdated, flush: "sync" });

      expect(onChildrenUpdated).not.toBeCalled();
    });

    describe("`onUpdated` should be called if updated", () => {
      describe("plain object", () => {
        test("root", () => {
          const onUpdated = jest.fn();
          const original = ref({ foo: { bar: 42 } });
          dittoRef({ original, onUpdated, flush: "sync" });

          original.value = { foo: { bar: 42 } };

          expect(onUpdated).toBeCalledTimes(1);
          expect(onUpdated.mock.calls[0][0].path).toEqual([]);
        });

        test("nesting", () => {
          const onUpdated = jest.fn();
          const original = ref({ foo: { bar: 42 } });
          dittoRef({ original, onUpdated, flush: "sync" });

          original.value.foo = { bar: 42 };

          expect(onUpdated).toBeCalledTimes(1);
          expect(onUpdated.mock.calls[0][0].path).toEqual(["foo"]);
        });

        test("leaf", () => {
          const onUpdated = jest.fn();
          const original = ref({ foo: { bar: 42 } });
          dittoRef({ original, onUpdated, flush: "sync" });

          original.value.foo.bar = 42;

          expect(onUpdated).not.toBeCalled();
        });
      });
    });
  });
});
