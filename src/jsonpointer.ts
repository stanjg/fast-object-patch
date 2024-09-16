export function escapePathComponent(component: string | number): string {
    if (typeof component === "number") component = component.toString();

    if (component.indexOf("/") === -1 && component.indexOf("~") === -1)
        return component;

    return component.replace(/~/g, "~0").replace(/\//g, "~1");
}

export function unescapePathComponent(component: string): string {
    if (component.indexOf("~") === -1) return component;

    return component.replace(/~1/g, "/").replace(/~0/g, "~");
}
