import type { MosaicTemplate, MosaicTemplateProps } from "@m0saic/types";

import { FixtureFetcherV1 } from "./fixture-fetcher/v1/fixture-fetcher";
import { PureAdapterV1 } from "./pure-adapter/v1/pure-adapter";
import { DataCardV1 } from "./data-card/v1/data-card";
import { SidecarJsonV1 } from "./sidecar-json/v1/sidecar-json";
import { SidecarTextV1 } from "./sidecar-text/v1/sidecar-text";

/** Chapter `data`, in teaching order (mirrors ./registry.ts). */
export const dataTemplates: MosaicTemplate<MosaicTemplateProps>[] = [
  FixtureFetcherV1 as unknown as MosaicTemplate<MosaicTemplateProps>,
  PureAdapterV1 as unknown as MosaicTemplate<MosaicTemplateProps>,
  DataCardV1 as unknown as MosaicTemplate<MosaicTemplateProps>,
  SidecarJsonV1 as unknown as MosaicTemplate<MosaicTemplateProps>,
  SidecarTextV1 as unknown as MosaicTemplate<MosaicTemplateProps>,
];

// `export *` ONLY — see the note in src/basics/index.ts for why the
// `export * from` + named-re-export pairing is a trap.
export * from "./fixture-fetcher/v1/fixture-fetcher";
export * from "./pure-adapter/v1/pure-adapter";
export * from "./data-card/v1/data-card";
export * from "./sidecar-json/v1/sidecar-json";
export * from "./sidecar-text/v1/sidecar-text";
