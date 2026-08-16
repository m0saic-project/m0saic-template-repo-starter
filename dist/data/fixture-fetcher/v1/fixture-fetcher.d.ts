/**
 * `@m0saic-starter/data/fixture-fetcher/v1` — where data ENTERS the system.
 *
 * ONE CONCEPT: a fetcher publishes a JSON payload onto the upstream channel
 * as a `type: "data"` source, and downstream templates read it by alias as
 * `ctx.upstreamData[alias]`. Same mechanism as theming — theme tokens are
 * just a data block with an agreed shape.
 *
 * CAPABILITY TIER IS DEFAULT-DENY. `ctx.secrets` and `ctx.connections` are
 * stripped from a template unless it declares `capabilities: { tier:
 * "capability" }`. Declaring the tier is what makes the host ASK the user;
 * a core-tier template that reaches for `ctx.secrets` finds `undefined`, and
 * that is the gate working, not a bug.
 *
 * SECRETS GO IN, SECRETS DON'T COME OUT. `secretRef` names a secret
 * (`env:SOME_TOKEN`); `ctx.secrets.get()` resolves it inside `render` and
 * nothing derived from the cleartext may enter the document, the upstream
 * channel or a sidecar. This one publishes `{ secretResolved, secretLength }`
 * — enough to prove the wiring, useless to an attacker.
 *
 * THE CARRIER TILE. A data source claims no cell, so a doc holding ONLY data
 * has nothing to render. This lesson pairs the payload with one visible tile
 * (which also shows you what was published). In a real pipeline the fetcher
 * step is `intermediate: true` and that tile never reaches the deliverable.
 *
 * No network here on purpose: a lesson that depends on someone else's uptime
 * is a lesson that fails for the wrong reason. `examples/http-orchestrator`
 * does the real fetch, OUTSIDE the template, and hands the result in as props
 * — the pattern to copy, since `ctx` has no `fetch`.
 */
export type FixtureFetcherProps = {
    /** Channel name downstream templates read. */
    alias?: string;
    /** Payload to publish instead of the built-in fixture. */
    payload?: Record<string, unknown>;
    /** CLI path: a secret to resolve, e.g. `env:M0SAIC_STARTER_TOKEN`. */
    secretRef?: string;
    /** DESKTOP path: a connection id configured under Tools - Integrations. */
    connectionId?: string;
    /** Which field of that connection carries the secret. Defaults to "token". */
    secretField?: string;
};
/** The default payload. Deterministic — the whole chapter reads it. */
export declare const STARTER_FIXTURE_PAYLOAD: {
    readonly dataset: "starter-fixture";
    readonly version: 1;
    readonly series: readonly [3, 5, 8, 13, 21];
    readonly label: "deterministic fixture payload";
};
export declare const FixtureFetcherV1: import("@m0saic/types").MosaicTemplate<FixtureFetcherProps, import("@m0saic/types").MosaicTemplateOutputs, import("@m0saic/types").MosaicTemplateUpstreamVariables, import("@m0saic/types").MosaicTemplateUpstreamData, import("@m0saic/types").MosaicTemplateSidecars>;
export default FixtureFetcherV1;
