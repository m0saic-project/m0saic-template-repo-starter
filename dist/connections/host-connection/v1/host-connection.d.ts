/**
 * `@m0saic-starter/connections/host-connection/v1` — a template pack can
 * teach the HOST a new kind of backend.
 *
 * ONE CONCEPT: `registerHostConnection`. The pack declares a connection
 * SCHEMA (what the user fills in under Settings → Integrations: here a base
 * URL plus an optional keychain-stored API key) and a PROBE (the "Test
 * connection" button: reachable / authenticated, or a named failure). The
 * host stays generic — it renders the form and calls the probe; the pack
 * owns the protocol. `src/connections/connection.ts` is the whole
 * implementation, and this template renders that REAL schema, not a mockup.
 *
 * Three things worth internalizing:
 *
 *  - REGISTRATION IS A MODULE-EVAL SIDE EFFECT. Importing the chapter makes
 *    `starter-catalog@default` exist in the app and the CLI. This is the one
 *    deliberate exception to the repo's "no self-registration" rule — and
 *    it is why loading a repo that registers connections is part of the
 *    Add-source consent surface (docs/security.md).
 *  - THE PUBLISHER HALF OF THE ID IS LAW. `starter-catalog@default` must
 *    have `schema.publisher === "starter-catalog"` or registration throws.
 *    Forks change the publisher; never squat another's.
 *  - SECRETS NEVER TRAVEL. The key is a `secret`-kind field stored in the
 *    OS keychain; fetchers read it back through a scoped resolver, and the
 *    host never ships cleartext into documents or option values.
 *
 * Render is PURE: it draws the schema constant. The probe runs in Settings,
 * never here. Start the example upstream and test it live:
 *
 *   node examples/http-orchestrator/server.cjs
 */
export type HostConnectionProps = {
    /** Accent fill (#rrggbb). */
    bandColor?: string;
    /** Backdrop (#rrggbb). */
    pageColor?: string;
};
export declare const HostConnectionV1: import("@m0saic/types").MosaicTemplate<HostConnectionProps, import("@m0saic/types").MosaicTemplateOutputs, import("@m0saic/types").MosaicTemplateUpstreamVariables, import("@m0saic/types").MosaicTemplateUpstreamData, import("@m0saic/types").MosaicTemplateSidecars>;
export default HostConnectionV1;
