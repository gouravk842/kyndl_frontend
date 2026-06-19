export function getCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const match = document.cookie.match(
    new RegExp(
      `(?:^|; )${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}=([^;]*)`,
    ),
  );
  const value = match?.[1];
  return value !== undefined ? decodeURIComponent(value) : undefined;
}

export function setCookie(
  name: string,
  value: string,
  options: {
    maxAge?: number;
    path?: string;
    secure?: boolean;
    sameSite?: "strict" | "lax" | "none";
  } = {},
): void {
  if (typeof document === "undefined") return;
  const { maxAge, path = "/", secure, sameSite = "lax" } = options;
  let cookie = `${name}=${encodeURIComponent(value)}; path=${path}; SameSite=${sameSite}`;
  if (maxAge !== undefined) cookie += `; max-age=${maxAge}`;
  if (secure) cookie += "; Secure";
  document.cookie = cookie;
}

export function removeCookie(name: string, path = "/"): void {
  setCookie(name, "", { maxAge: 0, path });
}
