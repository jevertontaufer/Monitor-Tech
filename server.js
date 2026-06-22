/* ============================================================
   Observatório de Tecnologia Global — Backend (Node + Express)
   Pronto para deploy no Render como Web Service.

   O que ele faz:
   - Serve o site estático (index.html, fornecedores.js, sw.js, manifest.json...)
   - GET  /api/suppliers          catálogo compartilhado (persistido em arquivo)
   - POST /api/suppliers          publica um fornecedor para todos
   - GET  /api/news?area=&lang=    notícias por área (RSS do Google News -> JSON, com cache)
   - GET  /api/fx                  cotação (cache do AwesomeAPI; opcional)
   - POST /api/ask                 resumo por IA usando sua ANTHROPIC_API_KEY
   - GET  /api/health              status

   Variáveis de ambiente (defina no painel do Render):
   - ANTHROPIC_API_KEY   (obrigatória só para /api/ask)
   - ANTHROPIC_MODEL     (opcional; padrão claude-haiku-4-5-20251001)
   - DATA_DIR            (opcional; padrão ./data — use um Render Disk para persistir)
   - PORT                (o Render injeta automaticamente)
   ============================================================ */

"use strict";
const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(express.json({ limit: "256kb" }));

/* CORS liberado (frontend pode estar no mesmo domínio ou em outro) */
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

/* ---------- persistência simples em arquivo ----------
   ATENÇÃO: no plano free do Render o disco é efêmero (zera a cada deploy/restart).
   Para um catálogo durável, monte um Render Disk e aponte DATA_DIR para ele,
   ou troque estas funções por um banco (Postgres/Supabase). A interface abaixo
   isola a persistência para facilitar essa troca. */
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, "data");
const SUP_FILE = path.join(DATA_DIR, "suppliers.json");
function ensureStore() {
  try { fs.mkdirSync(DATA_DIR, { recursive: true }); } catch (e) {}
  if (!fs.existsSync(SUP_FILE)) {
    try { fs.writeFileSync(SUP_FILE, "[]"); } catch (e) {}
  }
}
function readSuppliers() {
  try { return JSON.parse(fs.readFileSync(SUP_FILE, "utf8")) || []; }
  catch (e) { return []; }
}
function writeSuppliers(arr) {
  try { fs.writeFileSync(SUP_FILE, JSON.stringify(arr, null, 2)); return true; }
  catch (e) { return false; }
}
ensureStore();

/* util */
function clean(s, max) { return String(s == null ? "" : s).trim().slice(0, max || 200); }
function normUrl(u) { u = clean(u, 300); if (!u) return ""; u = /^https?:\/\//i.test(u) ? u : "https://" + u; return u.replace(/\/+$/, ""); }

/* ============================================================
   FORNECEDORES (compartilhados)
   ============================================================ */
app.get("/api/suppliers", (req, res) => {
  res.json({ items: readSuppliers() });
});

app.post("/api/suppliers", (req, res) => {
  const b = req.body || {};
  const nm = clean(b.nm, 120);
  const url = normUrl(b.site || b.url);
  if (!nm || !url) return res.status(400).json({ error: "Informe ao menos nome e site." });
  const item = {
    id: "s" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    nm,
    pais: clean(b.pais, 60),
    cats: Array.isArray(b.cats) ? b.cats.slice(0, 6).map(c => clean(c, 40)) : [],
    tag: clean(b.tag, 240),
    url,
    contato: clean(b.contato, 120),
    ts: Date.now()
  };
  const arr = readSuppliers();
  // dedupe simples por url
  if (arr.some(s => (s.url || "").toLowerCase() === item.url.toLowerCase())) {
    return res.status(409).json({ error: "Esse site já está no catálogo." });
  }
  arr.push(item);
  if (!writeSuppliers(arr)) return res.status(500).json({ error: "Falha ao salvar." });
  res.json({ item });
});

/* ============================================================
   NOTÍCIAS — RSS do Google News -> JSON (com cache em memória)
   ============================================================ */
const newsCache = new Map(); // key -> {ts, items}
const NEWS_TTL = 15 * 60 * 1000; // 15 min

function decodeEntities(s) {
  return String(s)
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/<[^>]+>/g, "")
    .replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&#x27;/g, "'")
    .replace(/&nbsp;/g, " ").replace(/&amp;/g, "&")
    .trim();
}
function parseRss(xml) {
  const items = [];
  const blocks = xml.split(/<item>/).slice(1);
  for (const blk of blocks) {
    const body = blk.split(/<\/item>/)[0];
    const pick = (tag) => {
      const m = body.match(new RegExp("<" + tag + "[^>]*>([\\s\\S]*?)<\\/" + tag + ">"));
      return m ? decodeEntities(m[1]) : "";
    };
    const title = pick("title");
    const link = pick("link");
    if (!title || !link) continue;
    let pub = pick("pubDate");
    if (pub) { const d = new Date(pub); if (!isNaN(d)) pub = d.toLocaleDateString("pt-BR"); }
    items.push({ title, link, source: pick("source"), pubDate: pub });
    if (items.length >= 6) break;
  }
  return items;
}

app.get("/api/news", async (req, res) => {
  const area = clean(req.query.area, 120);
  const lang = (clean(req.query.lang, 2) || "pt").toLowerCase();
  if (!area) return res.status(400).json({ error: "Parâmetro 'area' é obrigatório." });
  const map = { pt: ["pt-BR", "BR", "BR:pt-419"], en: ["en-US", "US", "US:en"], es: ["es-419", "BR", "BR:es-419"] };
  const [hl, gl, ceid] = map[lang] || map.pt;
  const key = lang + "|" + area;
  const hit = newsCache.get(key);
  if (hit && Date.now() - hit.ts < NEWS_TTL) return res.json({ items: hit.items, cached: true });
  try {
    const url = "https://news.google.com/rss/search?q=" + encodeURIComponent(area) +
      "&hl=" + hl + "&gl=" + gl + "&ceid=" + encodeURIComponent(ceid);
    const ctrl = new AbortController();
    const to = setTimeout(() => ctrl.abort(), 8000);
    const r = await fetch(url, { signal: ctrl.signal, headers: { "User-Agent": "Mozilla/5.0 (compatible; ObservatorioTech/1.0)" } });
    clearTimeout(to);
    if (!r.ok) throw new Error("rss " + r.status);
    const xml = await r.text();
    const items = parseRss(xml);
    newsCache.set(key, { ts: Date.now(), items });
    res.json({ items });
  } catch (e) {
    res.status(502).json({ error: "Não foi possível obter notícias agora.", items: [] });
  }
});

/* ============================================================
   COTAÇÃO — cache do AwesomeAPI (opcional; reduz chamadas)
   ============================================================ */
let fxCache = { ts: 0, data: null };
const FX_TTL = 20 * 1000;
app.get("/api/fx", async (req, res) => {
  const pairs = clean(req.query.pairs, 120) || "USD-BRL,EUR-BRL,CNY-BRL,EUR-USD";
  if (fxCache.data && Date.now() - fxCache.ts < FX_TTL) return res.json(fxCache.data);
  try {
    const r = await fetch("https://economia.awesomeapi.com.br/json/last/" + encodeURIComponent(pairs), { cache: "no-store" });
    if (!r.ok) throw new Error("fx " + r.status);
    const data = await r.json();
    fxCache = { ts: Date.now(), data };
    res.json(data);
  } catch (e) {
    if (fxCache.data) return res.json(fxCache.data); // serve o último válido
    res.status(502).json({ error: "Cotação indisponível." });
  }
});

/* ============================================================
   IA — proxy para a API da Anthropic (usa sua chave no servidor)
   ============================================================ */
const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL || "claude-haiku-4-5-20251001";

app.post("/api/ask", async (req, res) => {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return res.status(503).json({ error: "IA não configurada (defina ANTHROPIC_API_KEY)." });
  const b = req.body || {};
  const q = clean(b.q, 500);
  if (!q) return res.status(400).json({ error: "Pergunta vazia." });
  const ctx = b.context || {};
  const langName = { pt: "português", en: "English", es: "español" }[ctx.lang] || "português";

  const system =
    "Você é o assistente do Observatório de Tecnologia Global. " +
    "Responda em " + langName + ", em no máximo 3 frases, de forma objetiva e útil. " +
    "Use SOMENTE os dados de contexto fornecidos (feiras e áreas). " +
    "Não invente datas, números ou eventos que não estejam no contexto. " +
    "Se o contexto estiver vazio, diga que não há resultados para esses termos e sugira refinar a busca.";

  const userMsg =
    "Pergunta do usuário:\n" + q + "\n\n" +
    "Contexto (JSON):\n" + JSON.stringify(ctx).slice(0, 6000);

  try {
    const ctrl = new AbortController();
    const to = setTimeout(() => ctrl.abort(), 20000);
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      signal: ctrl.signal,
      headers: {
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json"
      },
      body: JSON.stringify({
        model: ANTHROPIC_MODEL,
        max_tokens: 400,
        system,
        messages: [{ role: "user", content: userMsg }]
      })
    });
    clearTimeout(to);
    if (!r.ok) {
      const txt = await r.text().catch(() => "");
      return res.status(502).json({ error: "Falha na IA.", detail: txt.slice(0, 300) });
    }
    const data = await r.json();
    const answer = (data.content || []).map(b => (b.type === "text" ? b.text : "")).join("\n").trim();
    res.json({ answer });
  } catch (e) {
    res.status(502).json({ error: "IA indisponível no momento." });
  }
});

/* ============================================================
   PUSH (opcional / próxima iteração)
   Para ativar notificações: instale 'web-push', gere chaves VAPID
   (npx web-push generate-vapid-keys) e defina VAPID_PUBLIC/VAPID_PRIVATE.
   Mantemos o endpoint de inscrição pronto; o envio fica como próximo passo.
   ============================================================ */
const subs = [];
app.post("/api/push/subscribe", (req, res) => {
  if (req.body && req.body.endpoint) { subs.push(req.body); return res.json({ ok: true }); }
  res.status(400).json({ error: "Inscrição inválida." });
});

/* ============================================================
   ESTÁTICOS + boot
   ============================================================ */
app.get("/api/health", (req, res) => res.json({ ok: true, ai: !!process.env.ANTHROPIC_API_KEY, suppliers: readSuppliers().length }));

app.use(express.static(__dirname, { extensions: ["html"] }));
app.get("*", (req, res) => res.sendFile(path.join(__dirname, "index.html")));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Observatório no ar em :" + PORT + " | IA:" + (!!process.env.ANTHROPIC_API_KEY) + " | modelo:" + ANTHROPIC_MODEL));
