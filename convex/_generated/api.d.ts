/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as actions_ai_summarize from "../actions/ai_summarize.js";
import type * as admin_facilityMutations from "../admin/facilityMutations.js";
import type * as admin_physicianMutations from "../admin/physicianMutations.js";
import type * as admin_queries from "../admin/queries.js";
import type * as auth_actions from "../auth/actions.js";
import type * as auth_mutations from "../auth/mutations.js";
import type * as auth_queries from "../auth/queries.js";
import type * as facilities_index from "../facilities/index.js";
import type * as facilities_queries from "../facilities/queries.js";
import type * as functions_ai_summaries from "../functions/ai_summaries.js";
import type * as migrations_index from "../migrations/index.js";
import type * as migrations_physicianMigrations from "../migrations/physicianMigrations.js";
import type * as migrations_userMigrations from "../migrations/userMigrations.js";
import type * as referrals_mutations from "../referrals/mutations.js";
import type * as referrals_queries from "../referrals/queries.js";
import type * as referrals_utils from "../referrals/utils.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  "actions/ai_summarize": typeof actions_ai_summarize;
  "admin/facilityMutations": typeof admin_facilityMutations;
  "admin/physicianMutations": typeof admin_physicianMutations;
  "admin/queries": typeof admin_queries;
  "auth/actions": typeof auth_actions;
  "auth/mutations": typeof auth_mutations;
  "auth/queries": typeof auth_queries;
  "facilities/index": typeof facilities_index;
  "facilities/queries": typeof facilities_queries;
  "functions/ai_summaries": typeof functions_ai_summaries;
  "migrations/index": typeof migrations_index;
  "migrations/physicianMigrations": typeof migrations_physicianMigrations;
  "migrations/userMigrations": typeof migrations_userMigrations;
  "referrals/mutations": typeof referrals_mutations;
  "referrals/queries": typeof referrals_queries;
  "referrals/utils": typeof referrals_utils;
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
