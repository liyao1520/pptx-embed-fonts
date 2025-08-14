import fs from "fs";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import { withPPTXEmbedFonts } from "../src/pptxgenjs.js";
import pptxgenjs from "pptxgenjs";

const __dirname = dirname(fileURLToPath(import.meta.url));

async function main() {
  const pptxgen = withPPTXEmbedFonts(pptxgenjs);
  const pptx = new pptxgen();

  const slide = pptx.addSlide();
  const fontFile = fs.readFileSync(path.join(__dirname, "./fonts/font.ttf"));
  const arrayBuffer = new Uint8Array(fontFile).buffer;
  const fontInfo = pptx.getFontInfo(arrayBuffer);
  const fontFace = fontInfo.names.fontFamily.en || fontInfo.names.fontFamily.zh;

  slide.addText("Hello World", {
    x: 0,
    y: 0,

    fontSize: 20,
    fontFace: fontFace,
  });
  await pptx.addFont({
    fontFace: fontFace,
    fontFile: arrayBuffer,
    fontType: "ttf",
  });

  await pptx.writeFile({
    fileName: "test.pptx",
  });
}
main();
