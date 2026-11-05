/** Envelope every upstream NeoCash API response is wrapped in. */
export interface ApiResponse<T> {
  data: T;
}
