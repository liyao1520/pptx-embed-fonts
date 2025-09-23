import { Font } from "fonteditor-core";

import pako from "pako";
export async function fontToEot(
  type: "ttf" | "woff" | "otf",
  fontBuffer: ArrayBuffer | Uint8Array
): Promise<ArrayBuffer> {
  const options: any = {
    type,
    hinting: true,
  };
  if (type === "woff") {
    options.inflate = pako.inflate;
  }

  const font = Font.create(fontBuffer, options);

  const eotBuffer = font.write({
    type: "eot",
    toBuffer: true,
  });

  // 保证返回 ArrayBuffer
  if (eotBuffer instanceof ArrayBuffer) {
    return eotBuffer;
  }

  return eotBuffer.buffer.slice(
    eotBuffer.byteOffset,
    eotBuffer.byteOffset + eotBuffer.byteLength
  );
}
