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
import type * as auth_actions from "../auth/actions.js";
import type * as auth_mutations from "../auth/mutations.js";
import type * as auth_queries from "../auth/queries.js";
import type * as functions_ai_summaries from "../functions/ai_summaries.js";
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
  "auth/actions": typeof auth_actions;
  "auth/mutations": typeof auth_mutations;
  "auth/queries": typeof auth_queries;
  "functions/ai_summaries": typeof functions_ai_summaries;
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
