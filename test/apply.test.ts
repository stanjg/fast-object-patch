import { describe, expect, it } from "vitest";
import { applyOperation, applyPatch, type Operation, OpType } from "../src";

describe("applyOperation", () => {
    it("should apply an 'ADD' operation correctly", () => {
        // Add to empty object
        expect(applyOperation({}, [OpType.ADD, "/a", 42])).toEqual({
            a: 42,
        });

        // Add to object
        expect(applyOperation({ a: 42 }, [OpType.ADD, "/b", 43])).toEqual({
            a: 42,
            b: 43,
        });

        // Add to nested object
        expect(
            applyOperation({ a: { a: 42 } }, [OpType.ADD, "/a/b", 43])
        ).toEqual({
            a: {
                a: 42,
                b: 43,
            },
        });

        // Add to empty array
        expect(applyOperation([], [OpType.ADD, "/0", 42])).toEqual([42]);

        // Add to array
        expect(applyOperation([1, 2], [OpType.ADD, "/2", 3])).toEqual([
            1, 2, 3,
        ]);

        // Add to nested object in an array
        expect(applyOperation([1, 2, {}], [OpType.ADD, "/2/a", 42])).toEqual([
            1,
            2,
            { a: 42 },
        ]);

        // Add to nested array in an object
        expect(
            applyOperation({ a: 42, b: [43] }, [OpType.ADD, "/b/1", 44])
        ).toEqual({
            a: 42,
            b: [43, 44],
        });
    });

    it("should apply a 'REMOVE' operation correctly", () => {
        // Remove last property from object
        expect(applyOperation({ a: 42 }, [OpType.REMOVE, "/a"])).toEqual({});

        // Remove property from object
        expect(applyOperation({ a: 42, b: 43 }, [OpType.REMOVE, "/b"])).toEqual(
            { a: 42 }
        );

        // Remove property from nested object
        expect(
            applyOperation({ a: 42, b: { c: 43, d: 44 } }, [
                OpType.REMOVE,
                "/b/c",
            ])
        ).toEqual({ a: 42, b: { d: 44 } });

        // Remove property from array
        expect(applyOperation([42, 43, 44], [OpType.REMOVE, "/0"])).toEqual([
            43, 44,
        ]);

        // Remove property from array nested inside object
        expect(
            applyOperation({ a: [42, 43, 44], b: 45 }, [OpType.REMOVE, "/a/1"])
        ).toEqual({
            a: [42, 44],
            b: 45,
        });

        // Remove property from object nested inside array
        expect(
            applyOperation([42, { a: 43, b: 44 }], [OpType.REMOVE, "/1/b"])
        ).toEqual([42, { a: 43 }]);
    });

    it("should apply a 'REPLACE' operation correctly", () => {
        // Replace property inside object
        expect(
            applyOperation({ a: 42, b: 43 }, [OpType.REPLACE, "/a", 41])
        ).toEqual({ a: 41, b: 43 });

        // Replace property inside array
        expect(
            applyOperation([41, 42, 43], [OpType.REPLACE, "/1", 44])
        ).toEqual([41, 44, 43]);

        // Replace property inside nested object
        expect(
            applyOperation({ a: 42, b: { c: 43 } }, [
                OpType.REPLACE,
                "/b/c",
                44,
            ])
        ).toEqual({ a: 42, b: { c: 44 } });

        // Replace property inside nested array
        expect(
            applyOperation([41, [42, 43]], [OpType.REPLACE, "/1/1", 44])
        ).toEqual([41, [42, 44]]);

        // Mix and match array and object nesting
        expect(
            applyOperation(
                {
                    a: [42, [43, { b: { c: [44, 45] } }]],
                },
                [OpType.REPLACE, "/a/1/1/b/c/1", 46]
            )
        ).toEqual({
            a: [42, [43, { b: { c: [44, 46] } }]],
        });
    });

    it("should only mutate the passed object reference if mutate is true", () => {
        const obj = { a: 42 };

        expect(applyOperation(obj, [OpType.ADD, "/b", 43], false)).toEqual({
            a: 42,
            b: 43,
        });
        expect(obj).toEqual({ a: 42 });

        expect(applyOperation(obj, [OpType.ADD, "/b", 43], true)).toEqual({
            a: 42,
            b: 43,
        });
        expect(obj).toEqual({ a: 42, b: 43 });
    });

    it("should handle escaped paths correctly", () => {
        expect(
            applyOperation(
                {
                    "a~a": 42,
                    "b/b": 43,
                },
                [OpType.REMOVE, "/b~1b"]
            )
        ).toEqual({
            "a~a": 42,
        });

        expect(
            applyOperation(
                {
                    "a~a": 42,
                    "b/b": 43,
                },
                [OpType.REPLACE, "/a~0a", 41]
            )
        ).toEqual({
            "a~a": 41,
            "b/b": 43,
        });
    });
});

describe("applyPatch", () => {
    it("should apply operations in the given order", () => {
        // Add then remove should result in no changes
        expect(
            applyPatch({ a: 42 }, [
                [OpType.ADD, "/b", 43],
                [OpType.REMOVE, "/b"],
            ])
        ).toEqual({ a: 42 });

        // Remove then add should equal to an add operation
        expect(
            applyPatch({ a: 42 }, [
                [OpType.REMOVE, "/b"],
                [OpType.ADD, "/b", 43],
            ])
        ).toEqual({ a: 42, b: 43 });
    });

    it("should correctly apply complex patches", () => {
        const obj = {
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
        const operations: Operation[] = [
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
        const expected = {
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

        expect(applyPatch(obj, operations)).toEqual(expected);
    });
});
