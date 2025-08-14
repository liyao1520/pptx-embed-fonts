import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "src/pptxgenjs.ts"],
  format: ["esm", "cjs"],
  dts: true,
  splitting: true,
  sourcemap: true,
  clean: true,
  external: ["pptxgenjs"],
});
