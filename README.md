# Rovix Store

Landing page premium para venda de Robux com checkout PIX, QR Code, copia e cola, consulta de status e pedidos salvos localmente.

URL oficial configurada: `https://rovixstore.site`.

## Rodando

```bash
npm install
npm run dev
```

Abra `http://localhost:3000`.

## PIX HidePay

Copie `.env.example` para `.env.local` e configure:

```env
NEXT_PUBLIC_SITE_URL="https://rovixstore.site"
PIX_API_KEY="sua_chave_hidepay"
PIX_API_BASE_URL="https://hidespay.com/api"
PIX_API_CREATE_PATH="/v1/gateway/"
PIX_API_STATUS_PATH="/v1/webhook/"
```

Nunca coloque a chave real no front-end, em componentes React ou em variaveis com prefixo `NEXT_PUBLIC_`.
`PIX_API_KEY` deve existir somente no `.env.local` local e nas Environment Variables da Vercel.

O checkout chama apenas as rotas internas `/api/pix/create` e `/api/pix/status/[id]`.
A `api-key` da HidePay e enviada somente pelo servidor, dentro de `lib/pix-service.ts`.

## Suporte por e-mail

Para o formulario de suporte enviar tickets diretamente para o Gmail, configure:

```env
SUPPORT_EMAIL_USER="rovixstoresupport@gmail.com"
SUPPORT_EMAIL_APP_PASSWORD="senha de app do Gmail"
EMAIL_VERIFICATION_SECRET="uma chave grande aleatoria"
```

Use uma senha de app do Google, nao a senha normal da conta.
O `EMAIL_VERIFICATION_SECRET` assina os codigos de verificacao de e-mail. Configure tambem na Vercel.

## Colocar no dominio

1. Suba este projeto em uma hospedagem compativel com Next.js, como Vercel, Render, Railway ou VPS Node.
2. Configure as mesmas variaveis de ambiente na hospedagem.
3. No painel do dominio `rovixstore.site`, aponte o DNS para a hospedagem.

Para Vercel, normalmente use:

```text
Tipo A      @      76.76.21.21
Tipo CNAME  www    cname.vercel-dns.com
```

Depois adicione `rovixstore.site` e `www.rovixstore.site` em `Project Settings > Domains` na Vercel.
