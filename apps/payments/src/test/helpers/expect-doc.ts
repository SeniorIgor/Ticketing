export function expectDoc<T>(doc: T | null | undefined, msg = 'Expected document to exist'): asserts doc is T {
  if (doc == null) {
    throw new Error(msg);
  }
}
