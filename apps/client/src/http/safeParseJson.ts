export async function safeParseJson(res: Response) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}
