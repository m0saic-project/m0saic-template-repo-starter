import type { MosaicTemplate, MosaicTemplateProps } from "@m0saic/types";

import { HelloWorldV1 } from "./hello-world/v1/hello-world";
import { AnatomyV1 } from "./anatomy/v1/anatomy";
import { HotReloadCanaryV1 } from "./hot-reload-canary/v1/hot-reload-canary";
import { ColorTilesV1 } from "./color-tiles/v1/color-tiles";
import { AspectAdaptiveCardV1 } from "./aspect-adaptive-card/v1/aspect-adaptive-card";

/** Chapter `basics`, in teaching order (mirrors ./registry.ts). */
export const basicsTemplates: MosaicTemplate<MosaicTemplateProps>[] = [
  HelloWorldV1 as unknown as MosaicTemplate<MosaicTemplateProps>,
  AnatomyV1 as unknown as MosaicTemplate<MosaicTemplateProps>,
  HotReloadCanaryV1 as unknown as MosaicTemplate<MosaicTemplateProps>,
  ColorTilesV1 as unknown as MosaicTemplate<MosaicTemplateProps>,
  AspectAdaptiveCardV1 as unknown as MosaicTemplate<MosaicTemplateProps>,
];

// `export *` ONLY — never `export * from "./x"` alongside a named
// `export { X } from "./x"` for the same module. tsc would emit a second
// require() for it, which Node's ESM→CJS translation mis-serves on re-import,
// silently filling template arrays with `undefined`. (Direct `import` +
// `export *`, as here, is the safe pairing.)
export * from "./hello-world/v1/hello-world";
export * from "./anatomy/v1/anatomy";
export * from "./hot-reload-canary/v1/hot-reload-canary";
export * from "./color-tiles/v1/color-tiles";
export * from "./aspect-adaptive-card/v1/aspect-adaptive-card";
