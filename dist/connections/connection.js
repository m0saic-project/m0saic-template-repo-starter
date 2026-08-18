"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CATALOG_CONNECTION_REGISTRATION = exports.catalogConnectionProbe = exports.CATALOG_CONNECTION_SCHEMA = exports.CATALOG_DEFAULT_BASE_URL = exports.CATALOG_KEY_FIELD = exports.CATALOG_CONNECTION_ID = void 0;
exports.catalogBaseUrl = catalogBaseUrl;
const types_1 = require("@m0saic/types");
const template_utils_1 = require("@m0saic/template-utils");
/** Canonical id: `publisher` = `starter-catalog`, `profile` = `default`. */
exports.CATALOG_CONNECTION_ID = (0, types_1.asMosaicHostConnectionId)("starter-catalog@default");
/** The `secret`-kind field key the fetchers mint a SecretRef for. */
exports.CATALOG_KEY_FIELD = "apiKey";
/** Where the example server listens when started with no flags. */
exports.CATALOG_DEFAULT_BASE_URL = "http://127.0.0.1:4977";
exports.CATALOG_CONNECTION_SCHEMA = {
    id: exports.CATALOG_CONNECTION_ID,
    version: 1,
    label: "Starter Catalog",
    description: "The neutral catalog backend for the connections chapter (examples/http-orchestrator). Point the base URL at the local example server — or at any backend speaking the same four routes.",
    publisher: "starter-catalog",
    fields: [
        {
            kind: "url",
            key: "baseUrl",
            label: "Base URL",
            required: false,
            placeholder: exports.CATALOG_DEFAULT_BASE_URL,
            description: "Where the catalog API lives. Leave blank for the local example server's default port.",
        },
        {
            kind: "secret",
            key: exports.CATALOG_KEY_FIELD,
            label: "API key",
            required: false,
            storage: "keychain",
            description: "Optional bearer key. The example server only requires one when started with STARTER_CATALOG_KEY; real backends usually do.",
        },
    ],
};
/** `values.baseUrl` with the default applied and trailing slash trimmed. */
function catalogBaseUrl(values) {
    const raw = typeof values.baseUrl === "string" && values.baseUrl.trim().length > 0
        ? values.baseUrl.trim()
        : exports.CATALOG_DEFAULT_BASE_URL;
    return raw.replace(/\/+$/, "");
}
/**
 * Probe: `GET {baseUrl}/health`. Unreachable / non-catalog → `UNREACHABLE`;
 * rejected key → `AUTH_FAILED`; otherwise `reachable`, with `authenticated`
 * reported only when a key was actually provided (mirrors the two-tick
 * contract: absent credential = tick is not applicable, not failed).
 */
exports.catalogConnectionProbe = {
    async probe(values, opts) {
        var _a, _b;
        const base = catalogBaseUrl(values);
        const key = typeof values[exports.CATALOG_KEY_FIELD] === "string" ? values[exports.CATALOG_KEY_FIELD] : undefined;
        const keyProvided = key !== undefined && key.length > 0;
        let signal = opts === null || opts === void 0 ? void 0 : opts.signal;
        const AS = globalThis.AbortSignal;
        if (!signal && typeof (AS === null || AS === void 0 ? void 0 : AS.timeout) === "function") {
            signal = AS.timeout((_a = opts === null || opts === void 0 ? void 0 : opts.timeoutMs) !== null && _a !== void 0 ? _a : 10000);
        }
        const fetchImpl = (_b = opts === null || opts === void 0 ? void 0 : opts.fetchImpl) !== null && _b !== void 0 ? _b : globalThis.fetch;
        let res;
        try {
            res = await fetchImpl(`${base}/health`, {
                headers: keyProvided ? { authorization: `Bearer ${key}` } : {},
                signal,
            });
        }
        catch (e) {
            return {
                ok: false,
                code: "UNREACHABLE",
                message: `Could not reach ${base}: ${e instanceof Error ? e.message : String(e)}`,
            };
        }
        if (res.status === 401) {
            return { ok: false, code: "AUTH_FAILED", message: "The API key was rejected (HTTP 401)." };
        }
        if (res.status !== 200) {
            return {
                ok: false,
                code: "UNREACHABLE",
                message: `Unexpected response from ${base}/health (HTTP ${res.status}).`,
            };
        }
        const body = (await res.json());
        if ((body === null || body === void 0 ? void 0 : body.service) !== "starter-catalog") {
            return {
                ok: false,
                code: "UNREACHABLE",
                message: `${base}/health did not identify as a starter-catalog service.`,
            };
        }
        return {
            ok: true,
            reachable: true,
            ...(keyProvided ? { authenticated: body.authenticated === true } : {}),
            ...(typeof body.version === "number" ? { version: String(body.version) } : {}),
        };
    },
};
exports.CATALOG_CONNECTION_REGISTRATION = {
    schema: exports.CATALOG_CONNECTION_SCHEMA,
    probe: exports.catalogConnectionProbe,
};
(0, template_utils_1.registerHostConnection)(exports.CATALOG_CONNECTION_REGISTRATION);
