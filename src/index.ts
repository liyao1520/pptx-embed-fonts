import JSZip from "jszip";
import { toZip } from "./parse.js";
import opentype from "opentype.js";
import { DOMParser } from "@xmldom/xmldom";
import { fontToEot } from "./utils.js";

const isNode =
  typeof process !== "undefined" &&
  !!process.versions?.node &&
  process.release?.name === "node";

const START_RID = 201314;
interface Font {
  name: string;
  data: ArrayBuffer;
  rid: number;
}
class PPTXEmbedFonts {
  public zip: JSZip | undefined;
  public rId: number = START_RID;
  private _notLoadedError = "pptx file not loaded";
  public fonts: Font[] = [];
  constructor(zip?: JSZip) {
    if (zip) {
      this.zip = zip;
    }
  }
  async loadZip(zip: JSZip) {
    this.zip = zip;
  }
  async load(fileBuffer: ArrayBuffer) {
    this.zip = await toZip(fileBuffer);
  }
  public getFontInfo(fontBuffer: ArrayBuffer) {
    const font = opentype.parse(fontBuffer);
    return font;
  }
  private async updateContentTypesXML() {
    if (!this.zip) {
      throw new Error(this._notLoadedError);
    }
    const contentTypes = this.zip.file("[Content_Types].xml");
    if (!contentTypes) {
      throw new Error("[Content_Types].xml not found");
    }
    const contentTypesXml = await contentTypes.async("string");
    const domParser = new DOMParser();
    const doc = domParser.parseFromString(contentTypesXml, "text/xml");
    const Types = doc.getElementsByTagName(`Types`)[0];
    if (!Types) {
      throw new Error("Types not found");
    }
    const defaultElements = doc.getElementsByTagName(`Default`);
    const fntdataExtensionElement = Array.from(defaultElements).find(
      (element) => {
        if (element.getAttribute("Extension") === "fntdata") {
          return element;
        }
      }
    );
    if (!fntdataExtensionElement) {
      const fntdataExtensionElement = doc.createElement("Default");
      fntdataExtensionElement.setAttribute("Extension", "fntdata");
      fntdataExtensionElement.setAttribute(
        "ContentType",
        "application/x-fontdata"
      );
      Types.insertBefore(fntdataExtensionElement, Types.firstChild);
    }
    this.zip.file("[Content_Types].xml", doc.toString());
  }
  private async updatePresentationXML() {
    if (!this.zip) throw new Error(this._notLoadedError);

    const presentation = this.zip.file("ppt/presentation.xml");
    if (!presentation) throw new Error("presentation.xml not found");

    const presentationXml = await presentation.async("string");
    const domParser = new DOMParser();
    const doc = domParser.parseFromString(presentationXml, "text/xml");
    const presentationNode = doc.getElementsByTagName(`p:presentation`)[0];
    if (!presentationNode) throw new Error("presentationNode not found");

    // 设置必要属性
    presentationNode.setAttribute("saveSubsetFonts", "true");
    presentationNode.setAttribute("embedTrueTypeFonts", "true");

    // 创建嵌入字体节点的函数
    const createEmbeddedFontNode = (font: Font) => {
      const embeddedFontNode = doc.createElement("p:embeddedFont");
      const fontNode = doc.createElement("p:font");
      fontNode.setAttribute("typeface", font.name);
      embeddedFontNode.appendChild(fontNode);

      const regularNode = doc.createElement("p:regular");
      regularNode.setAttribute("r:id", `rId${font.rid}`);
      embeddedFontNode.appendChild(regularNode);
      return embeddedFontNode;
    };

    // 查找或创建 embeddedFontLst 节点
    let embeddedFontLstNode =
      presentationNode.getElementsByTagName("p:embeddedFontLst")[0];

    // 如果不存在则创建并插入到正确位置
    // https://www.iso.org/standard/71691.html 规范
    if (!embeddedFontLstNode) {
      embeddedFontLstNode = doc.createElement("p:embeddedFontLst");

      // 关键修改1: 确保插入在 defaultTextStyle 之前
      const defaultTextStyleNode =
        presentationNode.getElementsByTagName("p:defaultTextStyle")[0];

      if (defaultTextStyleNode) {
        // 如果存在 defaultTextStyle，则在它之前插入
        presentationNode.insertBefore(
          embeddedFontLstNode,
          defaultTextStyleNode
        );
      } else {
        // 否则插入到合理的位置 (sldSz/notesSz 之后)
        const sldSzNode = presentationNode.getElementsByTagName("p:sldSz")[0];
        const notesSzNode =
          presentationNode.getElementsByTagName("p:notesSz")[0];
        const referenceNode =
          notesSzNode || sldSzNode || presentationNode.lastChild;

        if (referenceNode) {
          presentationNode.insertBefore(
            embeddedFontLstNode,
            referenceNode.nextSibling
          );
        } else {
          presentationNode.appendChild(embeddedFontLstNode);
        }
      }
    }

    // 添加字体到 embeddedFontLst
    this.fonts.forEach((font) => {
      const existingFont = Array.from(
        embeddedFontLstNode!.getElementsByTagName("p:font")
      ).find((node) => node.getAttribute("typeface") === font.name);

      if (!existingFont) {
        embeddedFontLstNode!.appendChild(createEmbeddedFontNode(font));
      }
    });

    this.zip.file("ppt/presentation.xml", doc.toString());
  }
  private async updateRelsPresentationXML() {
    if (!this.zip) {
      throw new Error(this._notLoadedError);
    }
    const relsPresentation = this.zip.file("ppt/_rels/presentation.xml.rels");
    if (!relsPresentation) {
      throw new Error("presentation.xml.rels not found");
    }
    const relsPresentationXml = await relsPresentation.async("string");
    const domParser = new DOMParser();
    const doc = domParser.parseFromString(relsPresentationXml, "text/xml");
    const relationshipsNode = doc.getElementsByTagName(`Relationships`)[0];
    if (!relationshipsNode) {
      throw new Error("Relationships not found");
    }
    this.fonts.forEach((font) => {
      const relationshipNode = doc.createElement("Relationship");
      relationshipNode.setAttribute("Id", `rId${font.rid}`);
      relationshipNode.setAttribute("Target", `fonts/${font.rid}.fntdata`);
      relationshipNode.setAttribute(
        "Type",
        "http://schemas.openxmlformats.org/officeDocument/2006/relationships/font"
      );
      relationshipsNode.appendChild(relationshipNode);
    });
    this.zip.file("ppt/_rels/presentation.xml.rels", doc.toString());
  }
  private updateFontFiles() {
    if (!this.zip) {
      throw new Error(this._notLoadedError);
    }
    this.fonts.forEach((font) => {
      this.zip!.file(`ppt/fonts/${font.rid}.fntdata`, font.data, {
        binary: true,
        compression: "DEFLATE",
      });
    });
  }
  public uniqueId() {
    return this.rId++;
  }
  private async eot2FntData(eotFile: ArrayBuffer) {
    const unit8Array = new Uint8Array(eotFile);
    const blob = new Blob([unit8Array], {
      type: "font/opentype",
    });
    return await blob.arrayBuffer();
  }
  private async addFont(fontFace: string, fntData: ArrayBuffer) {
    const rid = this.uniqueId();
    this.fonts.push({ name: fontFace, data: fntData, rid });
  }
  public async addFontFromEOT(fontFace: string, eotFile: ArrayBuffer) {
    const fontData = await this.eot2FntData(eotFile);
    await this.addFont(fontFace, fontData);
  }
  public async addFontFromTTF(fontFace: string, ttfFile: ArrayBuffer) {
    const eotFile = fontToEot("ttf", ttfFile);
    await this.addFontFromEOT(fontFace, eotFile);
  }
  public async addFontFromWOFF(fontFace: string, woffFile: ArrayBuffer) {
    const eotFile = fontToEot("woff", woffFile);
    await this.addFontFromEOT(fontFace, eotFile);
  }
  public async updateFiles() {
    await this.updateContentTypesXML();
    await this.updatePresentationXML();
    await this.updateRelsPresentationXML();
    this.updateFontFiles();
  }
  public async save() {
    if (!this.zip) {
      throw new Error(this._notLoadedError);
    }
    await this.updateFiles();
    const outputType = isNode ? ("nodebuffer" as const) : "arraybuffer";
    return this.zip.generateAsync({
      type: outputType,
      compression: "DEFLATE",
      compressionOptions: {
        level: 6, // 或 9
      },
    });
  }
}

export default PPTXEmbedFonts;
