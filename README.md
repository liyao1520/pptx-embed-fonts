# pptx-embed-fonts

**[中文文档](./README_ZH.md)**

[![npm version](https://badge.fury.io/js/pptx-embed-fonts.svg)](https://badge.fury.io/js/pptx-embed-fonts)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A JavaScript library for embedding fonts in PPTX files, with seamless integration support for pptxgenjs.

## ✨ Features

- 🎯 **Font Embedding**: Support for TTF, EOT, OTF and WOFF format font file embedding
- 🔌 **pptxgenjs Integration**: Seamless integration with pptxgenjs
- 📱 **Cross-platform**: Support for Node.js and browser environments
- 📦 **TypeScript Support**: Complete type definitions

## Edit on CodeSandbox

[![Edit on CodeSandbox](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/p/sandbox/nqf84m)

## 📦 Installation

```bash
npm install pptx-embed-fonts
# or
yarn add pptx-embed-fonts
# or
pnpm add pptx-embed-fonts
```

## 🚀 Quick Start

### Basic Usage

```typescript
import PPTXEmbedFonts from "pptx-embed-fonts";

// Create instance
const embedFonts = new PPTXEmbedFonts();

// Load PPTX file
const pptxBuffer = await fetch("presentation.pptx").then((r) =>
  r.arrayBuffer()
);
await embedFonts.load(pptxBuffer);

// Add font
const fontBuffer = await fetch("font.ttf").then((r) => r.arrayBuffer());
await embedFonts.addFontFromTTF("MyFont", fontBuffer);

const result = await embedFonts.save();
```

### Integration with pptxgenjs

[![Edit on CodeSandbox](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/p/sandbox/pptx-embed-fonts-857gv3)

```typescript
import pptxgenjs from "pptxgenjs";
import { withPPTXEmbedFonts } from "pptx-embed-fonts/pptxgenjs";

// Create enhanced version of pptxgenjs
const EnhancedPPTXGenJS = withPPTXEmbedFonts(pptxgenjs);
const pptx = new EnhancedPPTXGenJS();

// Add font
const fontBuffer = await fetch("font.ttf").then((r) => r.arrayBuffer());
await pptx.addFont({
  fontFace: "MyFont",
  fontFile: fontBuffer,
  fontType: "ttf",
});

// Create slide content
const slide = pptx.addSlide();
slide.addText("Hello World", {
  fontFace: "MyFont",
  fontSize: 24,
});

// Automatically embed fonts when exporting
const pptxFile = await pptx.writeFile({
  fileName: "example.pptx",
});
```

## 📚 API Reference

### PPTXEmbedFonts Class

#### Constructor

```typescript
new PPTXEmbedFonts(zip?: JSZip)
```

#### Methods

##### `load(fileBuffer: ArrayBuffer): Promise<void>`

Load PPTX file buffer

##### `loadZip(zip: JSZip): Promise<void>`

Load JSZip instance

##### `addFontFromTTF(fontName: string, ttfFile: ArrayBuffer): Promise<void>`

Add TTF format font

##### `addFontFromOTF(fontName: string, otfFile: ArrayBuffer): Promise<void>`

Add OTF format font

##### `addFontFromEOT(fontName: string, eotFile: ArrayBuffer): Promise<void>`

Add EOT format font

##### `addFontFromWOFF(fontName: string, woffFile: ArrayBuffer): Promise<void>`

Add WOFF format font

##### `getFontInfo(fontBuffer: ArrayBuffer): any`

Get font information

##### `updateFiles(): Promise<void>`

Update font-related configurations in PPTX file

##### `save(): Promise<ArrayBuffer | Buffer>`

Save and return the updated file

### withPPTXEmbedFonts Function

#### Parameters

- `pptxgen: typeof pptxgenjs` - pptxgenjs class

#### Return Value

Enhanced version of pptxgenjs class with the following additional methods:

##### `addFont(options): Promise<void>`

```typescript
interface AddFontOptions {
  fontFace: string;
  fontFile: ArrayBuffer;
  fontType: "ttf" | "eot" | "woff" | "otf";
}
```

##### `getFontInfo(fontFile: ArrayBuffer): any`

Get font information

## 🔗 Related Links

- [pptxgenjs](https://github.com/gitbrent/PptxGenJS) - PowerPoint file generation library
- [JSZip](https://github.com/Stuk/jszip) - File compression library
- [opentype.js](https://github.com/opentypejs/opentype.js) - Font parsing library
