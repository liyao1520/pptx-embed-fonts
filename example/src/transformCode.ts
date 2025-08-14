import * as recast from "recast";

export const libScopeNames = {
  pptxgenjs: "__pptxgen__",
  "pptx-embed-fonts": "__pptxEmbedFonts__",
  "pptx-embed-fonts/pptxgenjs": "__pptxEmbedFontsPptxgenjs__",
};

export const transformCode = (code: string) => {
  const ast = recast.parse(code);
  const n = recast.types.namedTypes;
  const b = recast.types.builders;

  const moduleMap = {
    pptxgenjs: libScopeNames.pptxgenjs,
    "pptx-embed-fonts": libScopeNames["pptx-embed-fonts"],
    "pptx-embed-fonts/pptxgenjs": libScopeNames["pptx-embed-fonts/pptxgenjs"],
  };

  recast.types.visit(ast, {
    visitImportDeclaration(path) {
      // 安全检查
      if (
        !n.ImportDeclaration.check(path.node) ||
        !path.node.source ||
        typeof path.node.source.value !== "string" ||
        !path.node.specifiers ||
        path.node.specifiers.length === 0 ||
        !n.ImportDefaultSpecifier.check(path.node.specifiers[0]) ||
        !path.node.specifiers[0].local
      ) {
        return this.traverse(path);
      }

      const moduleName = path.node.source.value;
      const globalVar = moduleMap[moduleName as keyof typeof moduleMap];

      if (!globalVar) {
        return this.traverse(path);
      }

      const variableName = path.node.specifiers[0].local.name.toString();

      // 修复类型错误的关键部分
      path.replace(
        b.variableDeclaration("const", [
          b.variableDeclarator(
            b.identifier(variableName),
            b.identifier(globalVar) // 确保这里传递的是字符串
          ),
        ])
      );

      return false;
    },
  });
  const newCode = recast.print(ast).code;

  return newCode;
};
