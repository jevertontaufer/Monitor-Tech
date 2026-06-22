# Observatório de Tecnologia Global — guia de implantação

Você tem duas formas de usar os arquivos. A **1** é instantânea; a **2** liga os recursos novos (notícias ao vivo, IA e fornecedores compartilhados).

## 1) Só o frontend (já funciona hoje)
O `index.html` é autossuficiente e degrada com elegância: sem backend, ele continua mostrando feiras, áreas, fornecedores (catálogo do seu `fornecedores.js` + os que o usuário salva no navegador), cotação ao vivo, conversor, exportação `.ics`, idiomas PT/EN/ES e a busca em linguagem natural (modo local).

Mantenha no mesmo diretório, como já está hoje:
```
index.html
fornecedores.js        (o seu, sem mudanças)
manifest.json          (o seu)
sw.js                  (o seu)
icon-192.png           (o seu)
```
É só substituir o `index.html` antigo pelo novo e publicar como hoje. Notícias e IA ficam em modo local/atalho até você ligar o backend.

## 2) Frontend + backend no Render (libera notícias, IA e fornecedores compartilhados)
O `server.js` serve o site **e** as APIs no mesmo serviço. No frontend, deixe `const API_BASE = "";` (mesma origem) — já está assim.

Estrutura do repositório:
```
server.js
package.json
index.html
fornecedores.js
manifest.json
sw.js
icon-192.png
```

No Render, crie um **Web Service** apontando para o repositório:
- **Build Command:** `npm install`
- **Start Command:** `npm start`
- **Environment:** Node 18+

Variáveis de ambiente (aba *Environment*):
- `ANTHROPIC_API_KEY` — sua chave (necessária só para o resumo por IA em `/api/ask`).
- `ANTHROPIC_MODEL` — opcional. Padrão: `claude-haiku-4-5-20251001` (barato e rápido). Pode trocar por `claude-sonnet-4-6` para respostas mais ricas.
- `DATA_DIR` — opcional. Caminho de gravação dos fornecedores compartilhados.

### Importante sobre persistência
No plano free do Render o disco é **efêmero**: a cada deploy/restart o arquivo de fornecedores zera. Para um catálogo durável:
- monte um **Render Disk** e aponte `DATA_DIR` para o ponto de montagem (ex.: `/var/data`); ou
- troque as funções `readSuppliers/writeSuppliers` no `server.js` por um banco (Postgres no próprio Render, ou Supabase). A interface já está isolada para facilitar.

## Endpoints do backend
- `GET  /api/health` — status (mostra se a IA está configurada e quantos fornecedores há).
- `GET  /api/suppliers` · `POST /api/suppliers` — catálogo compartilhado.
- `GET  /api/news?area=...&lang=pt` — notícias por área (RSS do Google News → JSON, cache 15 min).
- `GET  /api/fx` — cotação com cache de 20 s (opcional; o frontend já busca direto no AwesomeAPI).
- `POST /api/ask` — resumo por IA usando sua chave.

## Próxima iteração (não incluída ainda)
Notificações push (Web Push) para avisar quando uma feira está chegando. O `server.js` já tem o endpoint de inscrição (`/api/push/subscribe`) como ponto de partida; falta gerar chaves VAPID (`npx web-push generate-vapid-keys`), tratar permissão no app e o envio agendado. Posso montar isso quando quiser.
