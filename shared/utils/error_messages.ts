/**
 * What a shopper sees when an error comes without a message written for them. Shared by the
 * server (which replaces raw failures before they leave it) and the browser (for failures that
 * never reached the server). Never an endpoint, a stack trace or an HTTP reason phrase.
 *
 * Plain ASCII on purpose: these also travel as HTTP status text, which drops anything else.
 */
export function friendlyErrorMessage(status?: number | null): string {
  if (!status) return "You seem to be offline. Check your connection and try again.";
  if (status === 401) return "Please sign in again.";
  if (status === 404) return "We couldn't find what you were looking for.";
  if (status === 409) return "Something changed in the meantime. Please refresh and try again.";
  if (status === 429) return "Too many attempts. Please wait a moment and try again.";
  if (status === 502 || status === 503 || status === 504) {
    return "We're having trouble connecting right now. Please try again in a moment.";
  }
  if (status < 500) return "Some details weren't right. Please check them and try again.";
  return "Something went wrong on our side. Please try again in a moment.";
}
