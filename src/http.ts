export async function fetchJson<T = any>(url: string, timeoutMs = 8000): Promise<T> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: ctrl.signal, headers: { accept: 'application/json', 'user-agent': 'elnine-api/1.0' } });
    if (!res.ok) throw new Error(`HTTP ${res.status} en ${new URL(url).host}`);
    return (await res.json()) as T;
  } finally {
    clearTimeout(t);
  }
}
export async function fetchText(url: string, timeoutMs = 8000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: {
        accept: 'text/html,application/xhtml+xml',
        'accept-language': 'es-AR,es;q=0.9',
        'user-agent': 'Mozilla/5.0 (compatible; elnine-api/1.0)',
      },
    });
    return { status: res.status, ok: res.ok, text: await res.text() };
  } finally {
    clearTimeout(t);
  }
}
