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
PIX_API_BASE_URL="https://hidepay.site/api"
PIX_API_CREATE_PATH="/v1/gateway/"
PIX_API_STATUS_PATH="/v1/webhook/"
```

O checkout envia a `api-key` no corpo da requisição, conforme a documentação da HidePay. O PIX é criado em `/v1/gateway/` e o status é consultado em `/v1/webhook/`.

## Suporte por e-mail

Para o formulário de suporte enviar tickets diretamente para o Gmail, configure:

```env
SUPPORT_EMAIL_USER="rovixstoresupport@gmail.com"
SUPPORT_EMAIL_APP_PASSWORD="senha de app do Gmail"
```

Use uma senha de app do Google, não a senha normal da conta.

## Colocar no domínio

1. Suba este projeto em uma hospedagem compatível com Next.js, como Vercel, Render, Railway ou VPS Node.
2. Configure as mesmas variáveis de ambiente na hospedagem.
3. No painel do domínio `rovixstore.site`, aponte o DNS para a hospedagem.

Para Vercel, normalmente use:

```text
Tipo A      @      76.76.21.21
Tipo CNAME  www    cname.vercel-dns.com
```

Depois adicione `rovixstore.site` e `www.rovixstore.site` em `Project Settings > Domains` na Vercel.
