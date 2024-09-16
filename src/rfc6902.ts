import { type Operation, OpType } from "./types";

// export type JSONOperation =
//     | {
//           op: "add" | "replace";
//           path: string;
//           value: string;
//       }
//     | {
//           op: "remove";
//           path: string;
//       };

export interface JSONOperation {
    op: string;
    path: string;
    value?: any;
}

function _toRFC6902(operation: Operation): JSONOperation {
    const op: any = {
        op: OpType[operation[0]].toLowerCase() as any,
        path: operation[1],
    };

    if (operation[0] !== OpType.REMOVE) op.value = operation[2];

    return op;
}

export function toRFC6902(operation: Operation): JSONOperation;
export function toRFC6902(operations: Operation[]): JSONOperation[];
export function toRFC6902(
    operations: Operation | Operation[]
): JSONOperation | JSONOperation[] {
    if (typeof operations[0] === "number") return _toRFC6902(operations);

    return operations.map((op) => _toRFC6902(op));
}

export const toJSONPatch = toRFC6902;
