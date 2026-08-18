/**
 * `@m0saic-starter/controls/group-fields/v1` — related props that travel as
 * ONE value.
 *
 * ONE CONCEPT: `type: "group"` + `fields`. Three loose props (`name`,
 * `role`, `accent`) would work — but they are one IDEA (who is on screen),
 * and splitting them invites half-edits: a saved preset that carries the
 * name but not the accent, an agent that writes two of three. A group prop
 * declares the nested definitions under `fields`, the editor renders them
 * as one fieldset, and the VALUE is one object written in one edit —
 * whole or not at all.
 *
 * The nested definitions are ordinary prop definitions — same types, same
 * meta, same controls (the accent field below carries a colorPicker like
 * any top-level color prop). Grouping changes the SHAPE of the value, not
 * the vocabulary. Render validates the object as a unit, which is the
 * other half of the win: one guard for one idea.
 */
export type SpeakerGroup = {
    name: string;
    role: string;
    accent: string;
};
export type GroupFieldsProps = {
    /** Who is on screen — one object, one edit. */
    speaker?: SpeakerGroup;
    /** Backdrop (#rrggbb). */
    pageColor?: string;
};
/** Validate the group as a UNIT — whole or not at all. */
export declare function parseSpeaker(raw: GroupFieldsProps["speaker"]): SpeakerGroup;
export declare const GroupFieldsV1: import("@m0saic/types").MosaicTemplate<GroupFieldsProps, import("@m0saic/types").MosaicTemplateOutputs, import("@m0saic/types").MosaicTemplateUpstreamVariables, import("@m0saic/types").MosaicTemplateUpstreamData, import("@m0saic/types").MosaicTemplateSidecars>;
export default GroupFieldsV1;
