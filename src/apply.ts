import { type Operation, OpType } from "./types";
import { unescapePathComponent } from "./jsonpointer";

const objectOperations = {
    [OpType.ADD](obj: any, key: any, value: any) {
        obj[key] = value;
    },
    [OpType.REPLACE](obj: any, key: any, value: any) {
        obj[key] = value;
    },
    [OpType.REMOVE](obj: any, key: any) {
        delete obj[key];
    },
};

const arrayOperations = {
    [OpType.ADD]: objectOperations[OpType.ADD],
    [OpType.REPLACE]: objectOperations[OpType.REPLACE],
    [OpType.REMOVE](arr: any[], index: any) {
        arr.splice(index, 1);
    },
};

export function applyOperation(
    obj: any,
    op: Operation,
    mutate: boolean = true
): any {
    const result = mutate ? obj : JSON.parse(JSON.stringify(obj));
    const [type, path, arg] = op;

    let target = result;
    let keys = path.split("/").slice(1).map(unescapePathComponent);
    keys.slice(0, -1).forEach((key) => (target = target[key]));

    if (Array.isArray(target)) {
        arrayOperations[type](target, keys[keys.length - 1], arg);
    } else {
        objectOperations[type](target, keys[keys.length - 1], arg);
    }

    return result;
}

export function applyPatch(
    obj: any,
    ops: Operation[],
    mutate: boolean = true
): any {
    let result = obj;
    ops.forEach((op) => (result = applyOperation(obj, op, mutate)));
    return result;
}
