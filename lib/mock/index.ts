/**
 * All mock fixtures in one place.
 *
 * Nothing outside lib/api imports from here. Screens talk to the api object,
 * which decides whether to serve these fixtures or call the real backend, so
 * swapping to live endpoints touches one file rather than every component.
 */
export * from "./office";
export * from "./settings";
export * from "./staff";
export * from "./attendance";
export * from "./scan";
