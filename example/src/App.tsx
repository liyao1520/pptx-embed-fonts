import { LiveProvider, LiveEditor, LivePreview, LiveError } from "react-live";
import code from "./code?raw";
import { libScopeNames, transformCode } from "./transformCode";
import PPTXEmbedFonts from "pptx-embed-fonts";
import pptxgenjs from "pptxgenjs";
import PPTXEmbedFontsPptxgenjs from "pptx-embed-fonts/pptxgenjs";
const scope = {
  [libScopeNames["pptx-embed-fonts"]]: PPTXEmbedFonts,
  [libScopeNames["pptxgenjs"]]: pptxgenjs,
  [libScopeNames["pptx-embed-fonts/pptxgenjs"]]: PPTXEmbedFontsPptxgenjs,
};

function App() {
  return (
    <LiveProvider
      noInline
      code={code}
      transformCode={transformCode}
      scope={scope}
    >
      <div className="grid grid-cols-2  size-full">
        <LiveEditor className="font-mono size overflow-y-scroll hidden-scrollbar" />
        <div className="size-full relative">
          <LivePreview className="size-full" />
          <LiveError className="text-red-800 w-full bg-red-100 mt-2 absolute bottom-0" />
        </div>
      </div>
    </LiveProvider>
  );
}

export default App;
