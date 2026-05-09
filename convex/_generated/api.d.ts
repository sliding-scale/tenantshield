/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as analyzeLease_actions from "../analyzeLease/actions.js";
import type * as analyzeLease_mutations from "../analyzeLease/mutations.js";
import type * as analyzeLease_queries from "../analyzeLease/queries.js";
import type * as cases_actions from "../cases/actions.js";
import type * as cases_aiSchema from "../cases/aiSchema.js";
import type * as cases_mutations from "../cases/mutations.js";
import type * as cases_queries from "../cases/queries.js";
import type * as dashboard_queries from "../dashboard/queries.js";
import type * as http from "../http.js";
import type * as letters_actions from "../letters/actions.js";
import type * as letters_aiSchema from "../letters/aiSchema.js";
import type * as letters_mutations from "../letters/mutations.js";
import type * as letters_queries from "../letters/queries.js";
import type * as onboarding_mutations from "../onboarding/mutations.js";
import type * as onboarding_queries from "../onboarding/queries.js";
import type * as users_mutations from "../users/mutations.js";
import type * as users_queries from "../users/queries.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  "analyzeLease/actions": typeof analyzeLease_actions;
  "analyzeLease/mutations": typeof analyzeLease_mutations;
  "analyzeLease/queries": typeof analyzeLease_queries;
  "cases/actions": typeof cases_actions;
  "cases/aiSchema": typeof cases_aiSchema;
  "cases/mutations": typeof cases_mutations;
  "cases/queries": typeof cases_queries;
  "dashboard/queries": typeof dashboard_queries;
  http: typeof http;
  "letters/actions": typeof letters_actions;
  "letters/aiSchema": typeof letters_aiSchema;
  "letters/mutations": typeof letters_mutations;
  "letters/queries": typeof letters_queries;
  "onboarding/mutations": typeof onboarding_mutations;
  "onboarding/queries": typeof onboarding_queries;
  "users/mutations": typeof users_mutations;
  "users/queries": typeof users_queries;
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
