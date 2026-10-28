# Repost Cleaner — cadastro e login + Vercel

Esta versão adiciona cadastro, login, sessão persistente e logout usando Supabase Auth. O painel é responsivo para PC e Android.

## Importante
- As credenciais do formulário são **somente da conta do Repost Cleaner**.
- Não peça nem armazene a senha do TikTok. O botão abre o login oficial do TikTok.
- Esta versão **ainda não conecta a conta TikTok nem remove reposts automaticamente**. Os contadores são demonstrativos.
- A API oficial do TikTok pode exigir aprovação/permissões e não se deve presumir que permite remover republicações em lote.

## Configurar Supabase
1. Crie um projeto em https://supabase.com/.
2. No painel do Supabase, abra **Project Settings → API** (ou API Keys) e copie a Project URL e a chave publicável/anon.
3. Em Authentication → URL Configuration, adicione a URL do site da Vercel em **Site URL** e também em **Redirect URLs**.
4. Na Vercel, abra o projeto → Settings → Environment Variables e crie:
   - `VITE_SUPABASE_URL` = URL do projeto Supabase
   - `VITE_SUPABASE_ANON_KEY` = chave publicável/anon do projeto
5. Salve e faça um novo Deploy.
6. Para testar localmente, copie `.env.example` para `.env.local`, preencha os valores e execute:
   - `npm install`
   - `npm run dev`

## Publicar na Vercel
- Framework: Vite
- Build Command: `npm run build`
- Output Directory: `dist`

## GitHub
Extraia o ZIP, substitua os arquivos do projeto atual e envie as alterações para o repositório conectado à Vercel. Não envie `.env.local` nem segredos privados ao GitHub. A chave publicável/anon do Supabase é feita para uso no cliente, mas as regras de acesso e as políticas de segurança do banco devem continuar corretamente configuradas.

## Próximas etapas
Para conectar o TikTok, será necessário registrar um aplicativo de desenvolvedor e confirmar quais escopos oficiais são aprovados. Até lá, o botão apenas abre o login oficial e o site não consegue ler a sessão de outra aba.
