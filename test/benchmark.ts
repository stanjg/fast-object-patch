import b from "benny";
import { applyOperation, OpType } from "../src";

b.suite(
    "Apply",
    b.add("Add operation", () => {
        const obj = {
            foo: 1,
            baz: [
                {
                    qux: "hello",
                },
            ],
        };

        return () => {
            applyOperation(obj, [OpType.ADD, "/bar", [1, 2, 3, 4]]);
        };
    }),

    b.add("Remove operation", () => {
        const obj = {
            foo: 1,
            baz: [
                {
                    qux: "hello",
                },
            ],
            bar: [1, 2, 3, 4],
        };

        return () => {
            applyOperation(obj, [OpType.REMOVE, "/bar"]);
        };
    }),

    b.add("Replace operation", () => {
        const obj = {
            foo: 1,
            baz: [
                {
                    qux: "hello",
                },
            ],
        };

        return () => {
            applyOperation(obj, [OpType.REPLACE, "/foo", [1, 2, 3, 4]]);
        };
    }),

    b.cycle(),
    b.complete()
);
