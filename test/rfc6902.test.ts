import { describe, expect, it } from "vitest";
import { OpType, toJSONPatch, toRFC6902 } from "../src";

describe("toRFC6902", () => {
    it("should convert 'ADD' operations to the RFC6902 standard correctly", () => {
        expect(toRFC6902([OpType.ADD, "/a/b/c", 42])).toEqual({
            op: "add",
            path: "/a/b/c",
            value: 42,
        });
    });

    it("should convert 'REMOVE' operations to the RFC6902 standard correctly", () => {
        expect(toRFC6902([OpType.REMOVE, "/a/b/c"])).toEqual({
            op: "remove",
            path: "/a/b/c",
        });
    });

    it("should convert 'REPLACE' operations to the RFC6902 standard correctly", () => {
        expect(toRFC6902([OpType.REPLACE, "/a/b/c", 42])).toEqual({
            op: "replace",
            path: "/a/b/c",
            value: 42,
        });
    });

    it("should convert an array of operations to an array of RFC6902 operations", () => {
        expect(
            toRFC6902([
                [OpType.ADD, "/a/b/c", 42],
                [OpType.REPLACE, "/a/b/c", 42],
            ])
        ).toEqual([
            {
                op: "add",
                path: "/a/b/c",
                value: 42,
            },
            {
                op: "replace",
                path: "/a/b/c",
                value: 42,
            },
        ]);
    });
});

describe("toJSONPatch", () => {
    it("should function exactly like toRFC6902", () => {
        expect(toJSONPatch([OpType.ADD, "/a/b/c", 42])).toEqual(
            toRFC6902([OpType.ADD, "/a/b/c", 42])
        );
        expect(toJSONPatch([OpType.REMOVE, "/a/b/c"])).toEqual(
            toRFC6902([OpType.REMOVE, "/a/b/c"])
        );
        expect(toJSONPatch([OpType.REPLACE, "/a/b/c", 42])).toEqual(
            toRFC6902([OpType.REPLACE, "/a/b/c", 42])
        );
        expect(
            toJSONPatch([
                [OpType.ADD, "/a/b/c", 42],
                [OpType.REPLACE, "/a/b/c", 42],
            ])
        ).toEqual(
            toRFC6902([
                [OpType.ADD, "/a/b/c", 42],
                [OpType.REPLACE, "/a/b/c", 42],
            ])
        );
    });
});
