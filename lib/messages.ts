/**
 * Wording for when a request gets no reply at all.
 *
 * Deliberately not "you are offline". The browser reports a dropped connection,
 * a server that is down, a wrong server address, and a server refusing this
 * site (CORS) in exactly the same way, so the app cannot tell them apart. "You
 * are offline" was wrong in three of those four cases and sent people checking
 * a connection that was fine. This names only what is actually known: the
 * server did not answer.
 *
 * Kept in one place so the wording cannot drift between screens.
 */
export const NO_RESPONSE_TITLE = "Can't reach the server";

export const NO_RESPONSE_MESSAGE =
  "We couldn't reach the server. Check your connection and try again.";
