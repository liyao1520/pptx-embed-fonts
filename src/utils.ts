import { Font } from "fonteditor-core";
import pako from "pako";
export function fontToEot(
  type: "ttf" | "woff" | "woff2",
  fontBuffer: ArrayBuffer | Uint8Array
) {
  const font = Font.create(fontBuffer, {
    type,
    hinting: true,
    inflate: pako.inflate as any,
  });

  const eotBuffer = font.write({
    type: "eot",
    toBuffer: true,
  });

  return new Uint8Array(eotBuffer).buffer;
}
