/* eslint-disable */
// @ts-nocheck

import withPPTXEmbedFonts from "pptx-embed-fonts/pptxgenjs";

import pptxgenjs from "pptxgenjs";

const pptxgen = withPPTXEmbedFonts(pptxgenjs);

function Example() {
  const handleCreatePPTX = async () => {
    const fontFile = await fetch("/font.ttf").then((res) => res.arrayBuffer());

    const pptx = new pptxgen();

    const fontInfo = pptx.getFontInfo(fontFile);
    const fontFace =
      fontInfo.names.fontFamily.en || fontInfo.names.fontFamily.zh;

    pptx.addFont({
      fontFace: fontFace,
      fontType: "ttf",
      fontFile: fontFile,
    });

    const slide = pptx.addSlide();

    slide.addText("Hello World 你好啊", {
      x: 0,
      y: 1,
      w: "100%",
      h: 2,
      align: "center",
      color: "0088CC",
      fontSize: 24,
      fit: "shrink",
      fontFace: fontFace,
    });

    const pptxFile = await pptx.writeFile({
      fileName: "example.pptx",
    });
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <button
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 cursor-pointer"
        onClick={handleCreatePPTX}
      >
        download pptx
      </button>
    </div>
  );
}

render(<Example />);
