/**
 * `@m0saic-starter/surfaces/render-cover/v1` — the first impression.
 *
 * ONE CONCEPT: `renderCover` is a polished welcome page shown when a
 * template is opened with PURE DEFAULT props, before the user has touched
 * anything. It buys a friendly first frame WITHOUT weakening `render`.
 *
 * The problem it solves, exactly: a template that requires media should fail
 * fast when it has none — that is the correct `render` contract, and this
 * one keeps it (open with no Clip and Make gives you a report card naming
 * what is missing). But it means the editor's very first frame is an error,
 * which reads as "this template is broken" when it merely wants a video.
 * The cover puts a welcome there instead, and `render` stays strict. Neither
 * surface compromises for the other; that is the entire design.
 *
 * LIFECYCLE (the host's half of the contract, worth knowing before you
 * wonder why your cover "won't show"):
 *   - Shown only on a pure-default open. An `--props` open skips it, because
 *     supplying props means you already know what this template wants.
 *   - The FIRST prop edit dismisses it. That flag is deliberately not derived
 *     from `props === defaults`, so edit-then-undo does not resurrect it on
 *     its own — but dismissal is NOT one-way: the host gives the cover its
 *     own pill beside the "?" and you can reopen it whenever you like. Write
 *     a cover you would not mind someone going back to.
 *   - OPT-IN ONLY. A template without a cover gets no cover: hosts return
 *     null and fall through to the normal preview path in silence. They
 *     never synthesize a generic one. Same for an ERRORING cover — silence,
 *     because an error card about the cover would recreate the very
 *     broken-first-impression problem the cover exists to fix.
 *
 * (`renderTutorial` errors do the opposite and render an error mosaic: the
 * user explicitly clicked the "?" pill, so a silent no-op reads as a dead
 * button. Two surfaces, two error postures, both on purpose.)
 *
 * REAL GEOMETRY, not floating text: the page is three carved bands with
 * their copy on attached overlays. Onboarding content gets no exemption from
 * the rect thesis — a cover is a document like any other.
 */
export type RenderCoverProps = {
    /** Absolute path to a video file. Required by `render`. */
    clip?: string;
    /** Cover and caption accent (#rrggbb). */
    accentColor?: string;
};
export declare const RenderCoverV1: import("@m0saic/types").MosaicTemplate<RenderCoverProps, import("@m0saic/types").MosaicTemplateOutputs, import("@m0saic/types").MosaicTemplateUpstreamVariables, import("@m0saic/types").MosaicTemplateUpstreamData, import("@m0saic/types").MosaicTemplateSidecars>;
export default RenderCoverV1;
