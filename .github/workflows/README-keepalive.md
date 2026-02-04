# Keep-alive do Supabase (vários projetos)

O workflow **Supabase keep-alive** roda **todo dia às 09:00 (BRT)** e faz uma requisição em cada projeto listado em **`.github/supabase-keepalive-projects.json`**. Assim nenhum projeto Supabase pausa por inatividade (plano gratuito).

## Adicionar outro app

1. Abra o arquivo **`.github/supabase-keepalive-projects.json`** no repositório.
2. No segundo item (ou adicione um novo objeto `{ "name": "...", "url": "...", "anonKey": "..." }`):
   - **name**: um nome para identificar (ex: `meu-outro-app`).
   - **url**: a URL do projeto no Supabase (ex: `https://xxxx.supabase.co`). Você acha em Supabase → Project Settings → API → Project URL.
   - **anonKey**: a chave **publishable** (não a secret). Em Supabase → Project Settings → API → Publishable key.
3. Salve, faça commit e push. Pronto: o mesmo workflow passa a pingar os dois (ou mais) projetos todo dia.

Entradas com `url` ou `anonKey` ainda no placeholder (COLE_AQUI_...) são ignoradas, não quebram o workflow.
