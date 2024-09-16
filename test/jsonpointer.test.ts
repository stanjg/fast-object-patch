import { describe, expect, it } from "vitest";
import { escapePathComponent, unescapePathComponent } from "../src/jsonpointer";

describe("escapePathComponent", () => {
    it("should not modify if no '~' or '/' characters are present", () => {
        expect(escapePathComponent("test")).toEqual("test");
    });

    it("should escape '~' characters", () => {
        expect(escapePathComponent("test~suffix")).toBe("test~0suffix");
    });

    it("should escape '/' characters", () => {
        expect(escapePathComponent("test/suffix")).toBe("test~1suffix");
    });

    it("should escape both '~' and '/' characters", () => {
        expect(escapePathComponent("prefix~test/suffix")).toBe(
            "prefix~0test~1suffix"
        );
    });
});

describe("unescapePathComponent", () => {
    it("should unescape '~' characters", () => {
        expect(unescapePathComponent("test~0suffix")).toEqual("test~suffix");
    });

    it("should unescape '/' characters", () => {
        expect(unescapePathComponent("test~1suffix")).toBe("test/suffix");
    });

    it("should unescape both '~' and '/' characters", () => {
        expect(unescapePathComponent("prefix~0test~1suffix")).toBe(
            "prefix~test/suffix"
        );
    });
});
