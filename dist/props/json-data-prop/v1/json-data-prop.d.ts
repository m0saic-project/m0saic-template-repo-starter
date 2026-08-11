/**
 * `@m0saic-starter/props/json-data-prop/v1` — structured data through one
 * typed prop.
 *
 * ONE CONCEPT: `type: "json"`. When a knob is a STRUCTURE — a list of
 * records, a config object — declare it as a json prop instead of a
 * JSON-in-a-string (`'[{"label":...}]'` inside a string prop loses editor
 * introspection and double-escapes). The host hands render() the parsed
 * value; render() still owns the shape check, collecting EVERY problem
 * into one remedy-bearing error rather than dying on the first.
 *
 * The render is the data, visualized: one row per record, its value as a
 * proportional bar (a weightedSplit of value against the max — data
 * becomes geometry).
 */
export type JsonDataRecord = {
    label: string;
    value: number;
};
export type JsonDataPropProps = {
    /** The records to chart (1-6 of {label, value 1-100}). */
    data?: JsonDataRecord[];
};
export declare const JsonDataPropV1: import("@m0saic/types").MosaicTemplate<JsonDataPropProps, import("@m0saic/types").MosaicTemplateOutputs, import("@m0saic/types").MosaicTemplateUpstreamVariables, import("@m0saic/types").MosaicTemplateUpstreamData, import("@m0saic/types").MosaicTemplateSidecars>;
export default JsonDataPropV1;
