# Repost Cleaner — Vercel + Android

## O que esta versão faz
- Painel responsivo para celular.
- Contador local de demonstração e barra de progresso.
- Atalhos para TikTok Web e instruções de uso.
- Não pede credenciais nem transmite dados pessoais.

## O que ainda não faz
Esta versão NÃO remove republicações automaticamente. Uma página hospedada em Vercel não pode controlar o DOM de `tiktok.com` por causa da política de mesma origem do navegador. O TikTok também não oferece uma API pública oficial para remover republicações em massa.

Para implementar automação real no Android, será necessário um navegador compatível com userscripts/extensões e um script que interaja com a interface atual do TikTok. A interface do TikTok pode mudar, e a automação deve parar quando não reconhecer com segurança o botão/menu esperado. Não prometa remoções ilimitadas: a plataforma pode impor limites.

## Publicar na Vercel
1. Extraia este ZIP.
2. Envie a pasta do projeto para um repositório GitHub.
3. Em https://vercel.com, importe o repositório.
4. Framework Preset: Vite.
5. Build Command: `npm run build`.
6. Output Directory: `dist`.
7. Clique em Deploy.

## Rodar localmente
- Instale Node.js.
- Execute `npm install`.
- Execute `npm run dev`.
