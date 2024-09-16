export enum OpType {
    ADD,
    REMOVE,
    REPLACE,
}

export type Operation =
    | [OpType.REMOVE, path: string]
    | [Exclude<OpType, OpType.REMOVE>, path: string, value: any];
