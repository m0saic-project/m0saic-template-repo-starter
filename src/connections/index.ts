import type { MosaicTemplate, MosaicTemplateProps } from "@m0saic/types";

// Side-effect imports FIRST: registering the starter-catalog connection and
// its options/images fetchers is what makes the chapter's pickers work.
// This is the repo's one deliberate exception to "no self-registration" —
// see ./registry.ts and docs/security.md.
import "./connection";
import "./fetchers";

import { HostConnectionV1 } from "./host-connection/v1/host-connection";
import { OptionsSelectV1 } from "./options-select/v1/options-select";
import { CardsPickerV1 } from "./cards-picker/v1/cards-picker";
import { MultiSelectV1 } from "./multi-select/v1/multi-select";

/** Chapter `connections`, in teaching order (mirrors ./registry.ts). */
export const connectionsTemplates: MosaicTemplate<MosaicTemplateProps>[] = [
  HostConnectionV1 as unknown as MosaicTemplate<MosaicTemplateProps>,
  OptionsSelectV1 as unknown as MosaicTemplate<MosaicTemplateProps>,
  CardsPickerV1 as unknown as MosaicTemplate<MosaicTemplateProps>,
  MultiSelectV1 as unknown as MosaicTemplate<MosaicTemplateProps>,
];

// `export *` ONLY — see the note in src/basics/index.ts for why the
// `export * from` + named-re-export pairing is a trap.
export * from "./connection";
export * from "./fetchers";
export * from "./host-connection/v1/host-connection";
export * from "./options-select/v1/options-select";
export * from "./cards-picker/v1/cards-picker";
export * from "./multi-select/v1/multi-select";
