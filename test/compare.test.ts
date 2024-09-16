import { describe, expect, it } from "vitest";
import { compare, exportedForTesting } from "../src/compare";
import { OpType } from "../src/types";
const { objectKeys, areBothArrayOrObject } = exportedForTesting;

describe("compare", () => {
    it("should return an empty array for objects that are the same", () => {
        const obj = {};
        expect(compare(obj, obj)).toEqual([]);
        expect(compare({}, {})).toEqual([]);
        expect(compare({ a: 42 }, { a: 42 })).toEqual([]);
        expect(
            compare(
                { a: 42, b: [1, 2], c: { a: 42 } },
                { a: 42, b: [1, 2], c: { a: 42 } }
            )
        ).toEqual([]);
    });

    it("should generate 'ADD' operations", () => {
        const result = compare(
            { b: [], c: {} },
            { a: "one", b: ["two"], c: { a: "three" } }
        );

        expect(result.length).toBe(3);
        expect(result).toContainEqual([OpType.ADD, "/a", "one"]);
        expect(result).toContainEqual([OpType.ADD, "/b/0", "two"]);
        expect(result).toContainEqual([OpType.ADD, "/c/a", "three"]);
    });

    it("should generate 'REMOVE' operations", () => {
        const result = compare(
            { a: "one", b: ["two"], c: { a: "three" } },
            { b: [], c: {} }
        );

        expect(result.length).toBe(3);
        expect(result).toContainEqual([OpType.REMOVE, "/a"]);
        expect(result).toContainEqual([OpType.REMOVE, "/b/0"]);
        expect(result).toContainEqual([OpType.REMOVE, "/c/a"]);
    });

    it("should generate 'REPLACE' operations", () => {
        const result = compare(
            { a: "one", b: ["two"], c: { a: "three" } },
            { a: "1", b: ["2"], c: { a: "3" } }
        );

        expect(result.length).toBe(3);
        expect(result).toContainEqual([OpType.REPLACE, "/a", "1"]);
        expect(result).toContainEqual([OpType.REPLACE, "/b/0", "2"]);
        expect(result).toContainEqual([OpType.REPLACE, "/c/a", "3"]);
    });

    it("should correctly generate operations for complex objects", () => {
        const base = {
            id: 0,
            roles: ["USER", "ADMIN"],
            posts: [
                {
                    title: "Title",
                    content: "Content",
                },
                {
                    title: "Post 2",
                    content: "Content 2",
                },
                {
                    title: "Post 3",
                    content: "Content 3",
                },
            ],
            profile: {
                avatar: "img.png",
                website: "google.com",
                address: {
                    country: "The Netherlands",
                    city: "Amsterdam",
                    street: "Leidsestraat",
                },
                age: 21,
            },
            objToArray: { a: 42, b: 43 },
            updatedAt: Date.UTC(2024, 9, 16),
        };
        const cmp = {
            id: 0,
            roles: ["USER", "EMPLOYEE", "ADMIN"],
            posts: [
                {
                    title: "Title",
                    content: "Content",
                },
                {
                    title: "Post 3",
                    content: "Content 3",
                },
            ],
            profile: {
                avatar: "img.png",
                website: "github.com",
                address: {
                    country: "The Netherlands",
                    city: "Utrecht",
                },
            },
            objToArray: ["one", "two"],
            updatedAt: Date.UTC(2024, 9, 17),
        };
        const expected = [
            [OpType.REPLACE, "/roles/1", "EMPLOYEE"],
            [OpType.ADD, "/roles/2", "ADMIN"],
            [OpType.REPLACE, "/posts/1/title", "Post 3"],
            [OpType.REPLACE, "/posts/1/content", "Content 3"],
            [OpType.REMOVE, "/posts/2"],
            [OpType.REPLACE, "/profile/website", "github.com"],
            [OpType.REPLACE, "/profile/address/city", "Utrecht"],
            [OpType.REMOVE, "/profile/address/street"],
            [OpType.REMOVE, "/profile/age"],
            [OpType.REPLACE, "/objToArray", ["one", "two"]],
            [OpType.REPLACE, "/updatedAt", Date.UTC(2024, 9, 17)],
        ];

        const result = compare(base, cmp);

        expect(result.length).toBe(expected.length);
        expected.forEach((op) => expect(result).toContainEqual(op));
    });
});

describe("objectKeys", () => {
    it("should return the correct keys for an array", () => {
        expect(objectKeys([])).toEqual([]);
        expect(objectKeys([42, 42, 42])).toEqual([0, 1, 2]);
    });

    it("should return the correct keys for an object", () => {
        expect(objectKeys({})).toEqual([]);

        expect(
            objectKeys({
                test: 42,
                secondKey: 42,
            })
        ).toEqual(["test", "secondKey"]);
    });
});

describe("areBothArrayOrObject", () => {
    it("should return false if a is an array and b is not", () => {
        expect(areBothArrayOrObject([], {})).toBe(false);
        expect(areBothArrayOrObject({}, [])).toBe(false);
    });

    it("should return true if a and b are both not arrays", () => {
        expect(areBothArrayOrObject({}, {})).toBe(true);
    });

    it("should return true if a and b are both arrays", () => {
        expect(areBothArrayOrObject([], [])).toBe(true);
    });
});
