# pptx-embed-fonts

[![npm version](https://badge.fury.io/js/pptx-embed-fonts.svg)](https://badge.fury.io/js/pptx-embed-fonts)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

一个用于在 PPTX 文件中嵌入字体的 JavaScript 库，支持与 pptxgenjs 集成使用。

## ✨ 特性

- 🎯 **字体嵌入**: 支持 TTF、EOT、OTF、WOFF 格式字体文件嵌入
- 🔌 **pptxgenjs 集成**: 提供与 pptxgenjs 的无缝集成
- 📱 **跨平台**: 支持 Node.js 和浏览器环境
- 📦 **TypeScript 支持**: 完整的类型定义支持

## Edit on CodeSandbox

[![Edit on CodeSandbox](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/p/sandbox/nqf84m)

## 📦 安装

```bash
npm install pptx-embed-fonts
# 或者
yarn add pptx-embed-fonts
# 或者
pnpm add pptx-embed-fonts
```

## 🚀 快速开始

### 基本用法

```typescript
import PPTXEmbedFonts from "pptx-embed-fonts";

// 创建实例
const embedFonts = new PPTXEmbedFonts();

// 加载PPTX文件
const pptxBuffer = await fetch("presentation.pptx").then((r) =>
  r.arrayBuffer()
);
await embedFonts.load(pptxBuffer);

// 添加字体
const fontBuffer = await fetch("font.ttf").then((r) => r.arrayBuffer());
await embedFonts.addFontFromTTF("MyFont", fontBuffer);

const result = await embedFonts.save();
```

### 与 pptxgenjs 集成

[![Edit on CodeSandbox](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/p/sandbox/pptx-embed-fonts-857gv3)

```typescript
import pptxgenjs from "pptxgenjs";
import { withPPTXEmbedFonts } from "pptx-embed-fonts/pptxgenjs";

// 创建增强版的pptxgenjs
const EnhancedPPTXGenJS = withPPTXEmbedFonts(pptxgenjs);
const pptx = new EnhancedPPTXGenJS();

// 添加字体
const fontBuffer = await fetch("font.ttf").then((r) => r.arrayBuffer());
await pptx.addFont({
  fontFace: "MyFont",
  fontFile: fontBuffer,
  fontType: "ttf",
});

// 创建幻灯片内容
const slide = pptx.addSlide();
slide.addText("Hello World", {
  fontFace: "MyFont",
  fontSize: 24,
});

// 导出时自动嵌入字体
const pptxFile = await pptx.writeFile({
  fileName: "example.pptx",
});
```

## 📚 API 参考

### PPTXEmbedFonts 类

#### 构造函数

```typescript
new PPTXEmbedFonts(zip?: JSZip)
```

#### 方法

##### `load(fileBuffer: ArrayBuffer): Promise<void>`

加载 PPTX 文件缓冲区

##### `loadZip(zip: JSZip): Promise<void>`

加载 JSZip 实例

##### `addFontFromTTF(fontName: string, ttfFile: ArrayBuffer): Promise<void>`

添加 TTF 格式字体

##### `addFontFromEOT(fontName: string, eotFile: ArrayBuffer): Promise<void>`

添加 EOT 格式字体

##### `addFontFromOTF(fontName: string, otfFile: ArrayBuffer): Promise<void>`

添加 OTF 格式字体

##### `addFontFromWOFF(fontName: string, woffFile: ArrayBuffer): Promise<void>`

添加 WOFF 格式字体

##### `getFontInfo(fontBuffer: ArrayBuffer): any`

获取字体信息

##### `updateFiles(): Promise<void>`

更新 PPTX 文件中的字体相关配置

##### `save(): Promise<ArrayBuffer | Buffer>`

保存并返回更新后的文件

### withPPTXEmbedFonts 函数

#### 参数

- `pptxgen: typeof pptxgenjs` - pptxgenjs 类

#### 返回值

增强版的 pptxgenjs 类，包含以下额外方法：

##### `addFont(options): Promise<void>`

```typescript
interface AddFontOptions {
  fontFace: string;
  fontFile: ArrayBuffer;
  fontType: "ttf" | "eot" | "woff" | "otf";
}
```

##### `getFontInfo(fontFile: ArrayBuffer): any`

获取字体信息

## 🔗 相关链接

- [pptxgenjs](https://github.com/gitbrent/PptxGenJS) - PowerPoint 文件生成库
- [JSZip](https://github.com/Stuk/jszip) - 文件压缩库
- [opentype.js](https://github.com/opentypejs/opentype.js) - 字体解析库
