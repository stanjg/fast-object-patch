import { type Operation, OpType } from "./types";
import { escapePathComponent } from "./jsonpointer";

export function compare(base: any, cmp: any, path: string = ""): Operation[] {
    if (base === cmp) return [];

    const baseKeys = objectKeys(base);
    const cmpKeys = objectKeys(cmp);

    const operations: Operation[] = [];

    for (const key of baseKeys) {
        const baseValue = base[key];

        if (!(key in cmp)) {
            operations.push([
                OpType.REMOVE,
                `${path}/${escapePathComponent(key)}`,
            ]);
        } else {
            const newValue = cmp[key];

            if (
                typeof baseValue === "object" &&
                baseValue !== null &&
                typeof newValue === "object" &&
                newValue !== null &&
                areBothArrayOrObject(baseValue, newValue)
            ) {
                operations.push(
                    ...compare(
                        baseValue,
                        newValue,
                        `${path}/${escapePathComponent(key)}`
                    )
                );
            } else {
                if (baseValue !== newValue) {
                    operations.push([
                        OpType.REPLACE,
                        `${path}/${escapePathComponent(key)}`,
                        newValue,
                    ]);
                }
            }
        }
    }

    for (const key of cmpKeys) {
        if (!(key in base) && cmp[key] !== undefined) {
            operations.push([
                OpType.ADD,
                `${path}/${escapePathComponent(key)}`,
                cmp[key],
            ]);
        }
    }

    return operations;
}

function areBothArrayOrObject(a: object, b: object): boolean {
    return Array.isArray(a) === Array.isArray(b);
}

function objectKeys(obj: any): any[] {
    if (Array.isArray(obj)) return [...Array(obj.length).keys()];

    return Object.keys(obj);
}

export const exportedForTesting = {
    areBothArrayOrObject,
    objectKeys,
};
