# Keep-alive do Supabase

O workflow **Supabase keep-alive** roda **todo dia** (09:00 BRT) e faz uma requisição à API do seu projeto Supabase. Assim o Supabase entende que o projeto está em uso e não pausa por inatividade (plano gratuito).

## O que você precisa fazer

1. **Subir o projeto no GitHub** (se ainda não estiver)
   - Crie um repositório no GitHub e envie o código:
   - `git remote add origin https://github.com/SEU_USUARIO/SEU_REPO.git`
   - `git push -u origin main` (ou master)

2. **Deixar o GitHub Actions ativo**
   - No repositório: **Settings** → **Actions** → **General** → em "Actions permissions" escolha **Allow all actions**.

3. **Pronto.** O workflow roda sozinho todo dia. Para testar na hora:
   - Aba **Actions** → **Supabase keep-alive** → **Run workflow**.

O arquivo `public/supabase-config.json` já tem a URL e a chave do projeto; o workflow usa esse arquivo, não precisa configurar nada a mais.
