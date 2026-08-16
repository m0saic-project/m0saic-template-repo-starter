/**
 * `@m0saic-starter/quality/geometry-contract-card/v1` — did the geometry you
 * computed survive to the pixels?
 *
 * ONE CONCEPT: a template is `(props, canvas) -> m0`. You do pixel math in
 * JS, encode the result as a string, and THROW THE INTENT AWAY at return.
 * Nothing downstream knows what you meant. `withGeometryContract` lets you
 * declare the rects you intended and check they survived — at THIS canvas.
 *
 * The failure it exists for: a quantization squash. Splits land on integers,
 * and a cell can come back visibly smaller or larger than the math said while
 * the m0 STRING is perfectly healthy. Every string-level tool reports fine.
 * The picture is wrong. Only comparing intent against the realized box finds
 * it, and only at the canvas where it happens.
 *
 * SELECT BY STABLEKEY, AND NEVER TYPE ONE:
 *
 *   const [chipKey] = findStableKeys(m0, (f) => f.kind === "frame");
 *
 * A stableKey is the deterministic structural path the parser assigns a node.
 * It is guaranteed-unique selection — no positional guessing — but it is
 * derived, not authored. Hand-writing one that does not exist selects
 * nothing, and a check that matches nothing does not fail loudly. Compute it
 * from the same m0 you are shipping, every time.
 *
 * (Note the division of labour with the layout contract next door: LABELS are
 * for canvas-independent ratios that outlive the string; STABLEKEYS are for
 * exact px assertions against one specific string. Different jobs.)
 *
 * THE GATE: `debug` falsy returns the document UNTOUCHED at zero cost — same
 * reference, no parse. On a violation the render SURVIVES and becomes a
 * GEOMETRY_CONTRACT card telling you where and why.
 *
 * TOLERANCE IS PART OF THE CONTRACT: `tolerancePx` defaults to 1, because an
 * exact ratio still has to land on integers and ±1px is what healthy
 * rounding looks like — not a defect. So a 1px gap PASSES on purpose. Set it
 * to 0 only where byte-exactness really is the contract (inset recovery).
 *
 * Watch it fire: turn Debug geometry on, then raise "Contract offset" to 2 or
 * more. The chip never moves — it is always a sixth of the canvas. The knob
 * moves what the CONTRACT ASKS FOR, because manufacturing the mismatch on the
 * expectation side is the only way to demonstrate it without faking engine
 * behavior. At 1 you will see nothing happen, and that is the tolerance
 * doing its job.
 */
export type GeometryContractCardProps = {
    /** Run the geometry contract and render violations. */
    debugGeometry?: boolean;
    /** Px added to the CONTRACT's target height. The chip itself never moves. */
    contractOffsetPx?: number;
    /** Chip fill (#rrggbb). */
    chipColor?: string;
    /** Card fill (#rrggbb). */
    cardColor?: string;
};
export declare const GeometryContractCardV1: import("@m0saic/types").MosaicTemplate<GeometryContractCardProps, import("@m0saic/types").MosaicTemplateOutputs, import("@m0saic/types").MosaicTemplateUpstreamVariables, import("@m0saic/types").MosaicTemplateUpstreamData, import("@m0saic/types").MosaicTemplateSidecars>;
export default GeometryContractCardV1;
