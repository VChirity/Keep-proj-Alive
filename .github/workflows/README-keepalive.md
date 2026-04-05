# Keep-alive do Supabase (vários projetos)

O workflow **Supabase keep-alive** roda **duas vezes por dia** e faz requisições em cada projeto listado em **`.github/supabase-keepalive-projects.json`**, para reduzir pausa por inatividade no plano gratuito do Supabase.

O workflow **Manter repositório ativo** roda **uma vez por mês** e atualiza `.github/last-repo-activity.txt`. Isso ajuda a evitar que o GitHub **desative workflows agendados** quando o repositório fica muito tempo sem commits (~60 dias sem atividade).

## Se o ping parar de rodar

1. Abra **Actions** no GitHub e veja se o workflow **Supabase keep-alive** está **habilitado** (não desativado).
2. Se estiver desativado por inatividade do repositório, **ative de novo** e faça um commit qualquer, ou espere o job mensal **Manter repositório ativo** (ou rode manualmente em **Run workflow**).

## Adicionar outro app

1. Edite **`.github/supabase-keepalive-projects.json`** e acrescente um objeto `{ "name": "...", "url": "...", "anonKey": "..." }`.
2. **url**: Project Settings → API → Project URL (`https://xxxx.supabase.co`).
3. **anonKey**: chave **anon** / **publishable** (não a service role).

Repositório público: a chave anon é pública por desenho, mas evite commitar a **service role**.
