/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as activities from "../activities.js";
import type * as agents from "../agents.js";
import type * as agents_status from "../agents_status.js";
import type * as audit_agents from "../audit_agents.js";
import type * as audit_check from "../audit_check.js";
import type * as cleanup from "../cleanup.js";
import type * as debug from "../debug.js";
import type * as documents from "../documents.js";
import type * as enrich_agent from "../enrich_agent.js";
import type * as find_agent from "../find_agent.js";
import type * as fix_duplicates from "../fix_duplicates.js";
import type * as heartbeat_batch from "../heartbeat_batch.js";
import type * as http from "../http.js";
import type * as init from "../init.js";
import type * as inspect from "../inspect.js";
import type * as memories from "../memories.js";
import type * as messages from "../messages.js";
import type * as migrate from "../migrate.js";
import type * as notifications from "../notifications.js";
import type * as openclaw_bridge from "../openclaw_bridge.js";
import type * as promote_agents from "../promote_agents.js";
import type * as purge_agents from "../purge_agents.js";
import type * as scheduler from "../scheduler.js";
import type * as seed_docs from "../seed_docs.js";
import type * as seed_workspace from "../seed_workspace.js";
import type * as setup_atlas from "../setup_atlas.js";
import type * as setup_estrategico from "../setup_estrategico.js";
import type * as setup_katy from "../setup_katy.js";
import type * as setup_lazaro from "../setup_lazaro.js";
import type * as setup_marechal from "../setup_marechal.js";
import type * as setup_operacional_sargentos from "../setup_operacional_sargentos.js";
import type * as setup_operacional_soldados from "../setup_operacional_soldados.js";
import type * as setup_reforcos from "../setup_reforcos.js";
import type * as setup_skills from "../setup_skills.js";
import type * as setup_tatico from "../setup_tatico.js";
import type * as skills from "../skills.js";
import type * as smart_merge from "../smart_merge.js";
import type * as squad from "../squad.js";
import type * as tasks from "../tasks.js";
import type * as tiago_setup from "../tiago_setup.js";
import type * as workspace from "../workspace.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  activities: typeof activities;
  agents: typeof agents;
  agents_status: typeof agents_status;
  audit_agents: typeof audit_agents;
  audit_check: typeof audit_check;
  cleanup: typeof cleanup;
  debug: typeof debug;
  documents: typeof documents;
  enrich_agent: typeof enrich_agent;
  find_agent: typeof find_agent;
  fix_duplicates: typeof fix_duplicates;
  heartbeat_batch: typeof heartbeat_batch;
  http: typeof http;
  init: typeof init;
  inspect: typeof inspect;
  memories: typeof memories;
  messages: typeof messages;
  migrate: typeof migrate;
  notifications: typeof notifications;
  openclaw_bridge: typeof openclaw_bridge;
  promote_agents: typeof promote_agents;
  purge_agents: typeof purge_agents;
  scheduler: typeof scheduler;
  seed_docs: typeof seed_docs;
  seed_workspace: typeof seed_workspace;
  setup_atlas: typeof setup_atlas;
  setup_estrategico: typeof setup_estrategico;
  setup_katy: typeof setup_katy;
  setup_lazaro: typeof setup_lazaro;
  setup_marechal: typeof setup_marechal;
  setup_operacional_sargentos: typeof setup_operacional_sargentos;
  setup_operacional_soldados: typeof setup_operacional_soldados;
  setup_reforcos: typeof setup_reforcos;
  setup_skills: typeof setup_skills;
  setup_tatico: typeof setup_tatico;
  skills: typeof skills;
  smart_merge: typeof smart_merge;
  squad: typeof squad;
  tasks: typeof tasks;
  tiago_setup: typeof tiago_setup;
  workspace: typeof workspace;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
