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
    const keys = path.split("/");
    let i = 1;

    while (true) {
        let key = unescapePathComponent(keys[i]!);

        i++;
        if (i >= keys.length) {
            if (Array.isArray(target)) {
                arrayOperations[type](target, key, arg);
            } else {
                objectOperations[type](target, key, arg);
            }
            return result;
        }

        target = target[key];
    }
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

export function isInteger(str: string): boolean {
    let i = 0;
    const len = str.length;
    let charCode;
    while (i < len) {
        charCode = str.charCodeAt(i);
        if (charCode >= 48 && charCode <= 57) {
            i++;
            continue;
        }
        return false;
    }
    return true;
}
