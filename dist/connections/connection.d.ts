/**
 * `starter-catalog@default` — the host connection the `connections` chapter
 * teaches against.
 *
 * The upstream is the neutral catalog server in `examples/http-orchestrator`
 * (or anything with the same four routes — see its README). The schema
 * declares what the fetchers need: a base URL and an optional keychain-stored
 * key. The probe implements Settings → Integrations' "Test connection"
 * button, with the standard two ticks: REACHABLE (the URL is alive and
 * speaking the catalog protocol) and AUTHENTICATED (a key was provided and
 * accepted).
 *
 * REGISTRATION IS A MODULE-EVAL SIDE EFFECT — importing this file (via the
 * chapter barrel, re-exported from the repo entry) is what makes
 * `starter-catalog@default` appear in the app and CLI. This is the one
 * deliberate exception to the repo's "no self-registration" rule: templates
 * are consumed as plain exports, but connections register themselves, and
 * the host's registries live on `globalThis` precisely so an external repo's
 * own module instance still lands in the same store. Loading a repo that
 * registers a connection is part of the Add-source consent surface — see
 * `docs/security.md`.
 *
 * The publisher half of the id ("starter-catalog") MUST match
 * `schema.publisher` — registration throws otherwise. Never squat another
 * publisher's id.
 */
import type { MosaicHostConnectionProbe, MosaicHostConnectionRegistration, MosaicHostConnectionSchema } from "@m0saic/types";
/** Canonical id: `publisher` = `starter-catalog`, `profile` = `default`. */
export declare const CATALOG_CONNECTION_ID: import("@m0saic/types").MosaicHostConnectionId;
/** The `secret`-kind field key the fetchers mint a SecretRef for. */
export declare const CATALOG_KEY_FIELD = "apiKey";
/** Where the example server listens when started with no flags. */
export declare const CATALOG_DEFAULT_BASE_URL = "http://127.0.0.1:4977";
export declare const CATALOG_CONNECTION_SCHEMA: MosaicHostConnectionSchema;
/** `values.baseUrl` with the default applied and trailing slash trimmed. */
export declare function catalogBaseUrl(values: Readonly<Record<string, unknown>>): string;
/**
 * Probe: `GET {baseUrl}/health`. Unreachable / non-catalog → `UNREACHABLE`;
 * rejected key → `AUTH_FAILED`; otherwise `reachable`, with `authenticated`
 * reported only when a key was actually provided (mirrors the two-tick
 * contract: absent credential = tick is not applicable, not failed).
 */
export declare const catalogConnectionProbe: MosaicHostConnectionProbe;
export declare const CATALOG_CONNECTION_REGISTRATION: MosaicHostConnectionRegistration;
