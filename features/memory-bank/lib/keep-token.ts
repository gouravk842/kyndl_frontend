/** Undo one or two layers of URL encoding.

Page params can still contain `%3A` for a colon, while route-handler params
arrive already decoded. Decoding until the signature's colons are back makes
both paths send Django the same token.
*/
export function decodeKeepToken(token: string): string {
  let current = token;
  for (let pass = 0; pass < 2; pass += 1) {
    if (!current.includes("%")) break;
    try {
      const next = decodeURIComponent(current);
      if (next === current) break;
      current = next;
    } catch {
      break;
    }
  }
  return current;
}
