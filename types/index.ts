/**
 * Single import point for every domain type.
 *
 * Lets a component write one line - import type { StaffProfile, Office } from
 * "@/types" - instead of one import per file. If a type later moves between
 * files, this is the only place that changes.
 */
export * from "./department";
export * from "./office";
export * from "./settings";
export * from "./staff";
export * from "./attendance";
export * from "./scan";
export * from "./auth";
