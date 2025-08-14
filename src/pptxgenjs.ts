import pptxgenjs from "pptxgenjs";
import JSZip from "jszip";
import PPTXEmbedFonts from "./index.js";

interface ExportPresentationOptions {
  outputType?: string;
  compression?: boolean;
}

declare module "pptxgenjs" {
  export default interface PptxGenJS {
    exportPresentation(
      ...args: any[]
    ): Promise<string | ArrayBuffer | Blob | Buffer | Uint8Array>;
  }
}

function withPPTXEmbedFonts(pptxgen: typeof pptxgenjs) {
  return class EmbedFontsPPTXGenJS extends pptxgen {
    #superExportPresentation: (
      options: ExportPresentationOptions
    ) => Promise<any>;
    constructor() {
      super();
      this.#superExportPresentation = this.exportPresentation;
      this.exportPresentation = async (options: ExportPresentationOptions) => {
        // 这里可以添加嵌入字体的相关逻辑

        const res = await this.#superExportPresentation(options);
        const zip = await new JSZip().loadAsync(res);

        await this._pptxEmbedFonts.loadZip(zip);
        await this._pptxEmbedFonts.updateFiles();

        if (options.outputType === "STREAM") {
          // A: stream file
          return await zip.generateAsync({
            type: "nodebuffer",
            compression: options.compression ? "DEFLATE" : "STORE",
          });
        } else if (options.outputType) {
          // B: Node [fs]: Output type user option or default
          return await zip.generateAsync({
            type: options.outputType as any,
          });
        } else {
          // C: Browser: Output blob as app/ms-pptx
          return await zip.generateAsync({
            type: "blob",
            compression: options.compression ? "DEFLATE" : "STORE",
          });
        }
      };
    }
    readonly _pptxEmbedFonts: PPTXEmbedFonts = new PPTXEmbedFonts();
    async addFont(options: {
      fontFace: string;
      fontFile: ArrayBuffer;
      fontType: "ttf" | "eot" | "woff";
    }) {
      if (options.fontType === "ttf") {
        await this._pptxEmbedFonts.addFontFromTTF(
          options.fontFace,
          options.fontFile
        );
      } else if (options.fontType === "eot") {
        await this._pptxEmbedFonts.addFontFromEOT(
          options.fontFace,
          options.fontFile
        );
      } else if (options.fontType === "woff") {
        await this._pptxEmbedFonts.addFontFromWOFF(
          options.fontFace,
          options.fontFile
        );
      }
    }
    getFontInfo(fontFile: ArrayBuffer) {
      return this._pptxEmbedFonts.getFontInfo(fontFile);
    }
  };
}

export default withPPTXEmbedFonts;

export { withPPTXEmbedFonts };
