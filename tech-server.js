// ---------------------------------------------------------------------------
// Monitor de Tecnologia — backend de notícias com resumo (pt-BR)
// Node 18+ (fetch nativo). SEM dependências e SEM chave de API.
//
// O que faz:
//  - busca no GDELT apenas fontes do Brasil (notícias em pt-BR) para o termo pedido
//  - abre cada matéria e extrai o resumo que o próprio veículo publica
//    (meta description / og:description) — o mesmo texto do preview de link
//  - devolve título + resumo + fonte + horário em JSON, com CORS liberado
//  - serve a própria página no mesmo endereço (sem CORS, sem file://)
//
// Rodar:
//   node tech-server.js
//   e abrir http://localhost:8080
// ---------------------------------------------------------------------------

import http from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT           = parseInt(process.env.PORT || "8080", 10);
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || "*";
const CACHE_MIN      = parseInt(process.env.CACHE_MIN || "10", 10);
const MAX_ARTICLES   = parseInt(process.env.MAX_ARTICLES || "9", 10);
const CONCURRENCY    = 4;
const PAGE_FILE      = "monitor-tecnologia-global.html";

const cache = new Map(); // query -> { ts, payload }

// ----------------------------------------------------------- helpers -------
function decodeEntities(s) {
  return s
    .replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#0?39;/g, "'")
    .replace(/&#x27;/gi, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ").replace(/&hellip;/g, "…").replace(/&#8230;/g, "…")
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(parseInt(d, 10)))
    .replace(/&[a-z]+;/gi, (m) => ENT[m] || m);
}
const ENT = {
  "&aacute;":"á","&agrave;":"à","&acirc;":"â","&atilde;":"ã","&auml;":"ä",
  "&eacute;":"é","&ecirc;":"ê","&iacute;":"í","&oacute;":"ó","&ocirc;":"ô",
  "&otilde;":"õ","&ouml;":"ö","&uacute;":"ú","&uuml;":"ü","&ccedil;":"ç",
  "&Aacute;":"Á","&Atilde;":"Ã","&Eacute;":"É","&Ccedil;":"Ç","&Oacute;":"Ó",
  "&ndash;":"–","&mdash;":"—","&rsquo;":"'","&lsquo;":"'","&ldquo;":"\u201C","&rdquo;":"\u201D","&aelig;":"æ",
};
function metaContent(html, attr, val) {
  // tenta os dois ordenamentos: property antes de content e vice-versa
  const re1 = new RegExp(`<meta[^>]+${attr}=["']${val}["'][^>]+content=["']([^"']*)["']`, "i");
  const re2 = new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]+${attr}=["']${val}["']`, "i");
  const m = html.match(re1) || html.match(re2);
  return m ? decodeEntities(m[1]).trim() : "";
}
function extractSummary(html) {
  let s = metaContent(html, "property", "og:description")
       || metaContent(html, "name", "description")
       || metaContent(html, "name", "twitter:description");
  if (!s) return "";
  s = s.replace(/\s+/g, " ").trim();
  if (s.length > 240) s = s.slice(0, 237).replace(/\s+\S*$/, "") + "…";
  return s;
}
async function fetchText(url, ms) {
  const c = new AbortController();
  const t = setTimeout(() => c.abort(), ms);
  try {
    const r = await fetch(url, {
      signal: c.signal,
      redirect: "follow",
      headers: { "User-Agent": "Mozilla/5.0 (compatible; MonitorTech/1.0)" },
    });
    if (!r.ok) return "";
    const ct = r.headers.get("content-type") || "";
    if (!ct.includes("text/html")) return "";
    return await r.text();
  } catch { return ""; }
  finally { clearTimeout(t); }
}
async function withPool(items, worker, size) {
  const out = new Array(items.length);
  let i = 0;
  await Promise.all(Array.from({ length: size }, async () => {
    while (i < items.length) { const idx = i++; out[idx] = await worker(items[idx]); }
  }));
  return out;
}

// ----------------------------------------------------------- build --------
async function buildNews(query) {
  const gdelt = "https://api.gdeltproject.org/api/v2/doc/doc?query="
    + encodeURIComponent("(" + query + ") sourcecountry:brazil")
    + "&mode=artlist&format=json&maxrecords=" + (MAX_ARTICLES + 4)
    + "&sort=datedesc&timespan=7d";
  const raw = await fetchText(gdelt, 9000);
  let arts = [];
  try { arts = (JSON.parse(raw).articles || []); } catch { arts = []; }
  arts = arts.filter(a => a.title && a.url).slice(0, MAX_ARTICLES);

  const withSummaries = await withPool(arts, async (a) => {
    const html = await fetchText(a.url, 6000);
    const summary = html ? extractSummary(html) : "";
    return {
      title: decodeEntities(a.title),
      summary,
      url: a.url,
      domain: a.domain || "",
      seendate: a.seendate || "",
    };
  }, CONCURRENCY);

  return {
    query,
    updated: new Date().toISOString(),
    source: "GDELT (Brasil) + resumo do veículo",
    articles: withSummaries,
  };
}
async function getNews(query) {
  const key = query.toLowerCase();
  const hit = cache.get(key);
  if (hit && Date.now() - hit.ts < CACHE_MIN * 60000) return hit.payload;
  const payload = await buildNews(query);
  cache.set(key, { ts: Date.now(), payload });
  return payload;
}

// ----------------------------------------------------------- server -------
const MIME = { ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript", ".json": "application/json" };
function cors(res) {
  res.setHeader("Access-Control-Allow-Origin", ALLOWED_ORIGIN);
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

http.createServer(async (req, res) => {
  cors(res);
  if (req.method === "OPTIONS") { res.writeHead(204); return res.end(); }
  const url = new URL(req.url, `http://localhost:${PORT}`);

  if (url.pathname === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({ ok: true }));
  }
  if (url.pathname === "/news") {
    const q = (url.searchParams.get("q") || "tecnologia").slice(0, 300);
    try {
      const payload = await getNews(q);
      res.writeHead(200, { "Content-Type": "application/json", "Cache-Control": "no-store" });
      return res.end(JSON.stringify(payload));
    } catch (e) {
      res.writeHead(502, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ error: String(e.message || e) }));
    }
  }
  // static
  const file = url.pathname === "/" || url.pathname === "/index.html" ? PAGE_FILE : url.pathname.replace(/^\/+/, "");
  if (file.includes("..")) { res.writeHead(403); return res.end("forbidden"); }
  try {
    const buf = await readFile(path.join(__dirname, file));
    res.writeHead(200, { "Content-Type": MIME[path.extname(file)] || "application/octet-stream" });
    return res.end(buf);
  } catch { res.writeHead(404, { "Content-Type": "text/plain" }); return res.end("not found"); }
}).listen(PORT, () => {
  console.log(`Monitor de tecnologia em http://localhost:${PORT}/`);
  console.log(`  resumos pt-BR: http://localhost:${PORT}/news?q=automação industrial`);
});
