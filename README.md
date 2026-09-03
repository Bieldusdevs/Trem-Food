# FUEGO ARTISAN — PWA funcional (Next.js 14)

App de pedidos completo: PWA instalável, backend real (API Routes + Prisma),
carrinho, checkout e Clube da Brasa (fidelidade) que realmente persistem no
banco — **nada é mockado**. Fotos de produtos são locais (`public/images/products`),
então o cardápio nunca quebra por link externo.

## Rodando localmente (zero configuração)

```bash
npm install
npm run dev        # cria o banco SQLite local e popula o cardápio automaticamente
```

Abra http://localhost:3000. Pronto — sem Postgres, sem variáveis de ambiente,
sem comandos extras.

Para redefinir o banco do zero:

```bash
cp .env.example .env.local   # opcional, já usa SQLite por padrão
npm run db:setup             # cria tabelas + popula o cardápio
```

## O que está implementado de verdade

- **Backend**: `app/api/products`, `app/api/cart`, `app/api/orders`,
  `app/api/loyalty`, `app/api/health` — rotas reais lendo/escrevendo no banco.
- **Banco local**: SQLite automático (`prisma/dev.db`, schema local em
  `prisma/schema.local.prisma`).
- **Banco de produção**: Postgres via `DATABASE_URL` (`prisma/schema.prisma`).
  Para rodar em Postgres: `npm run db:setup:pg`.
- **Sessão de convidado**: cookie httpOnly identifica o cliente sem login e já
  cria a conta de fidelidade.
- **Carrinho persistente**: adicionar, atualizar quantidade e remover, no banco,
  com **controle real de estoque** (produto esgotado não entra na sacola).
- **Checkout**: cria `Order` + `OrderItem`s em transação, **baixa estoque**,
  salva o endereço no cliente, limpa o carrinho e carimba o Clube da Brasa
  (a cada 5 selos, 1 recompensa grátis — e dá para resgatar de verdade).
- **Entrega**: R$ 9,00 — **grátis acima de R$ 50,00** (o total mostrado na
  sacola é exatamente o que é cobrado no pedido).
- **Fotos**: 10 produtos com fotos locais + `ImageWithFallback` (skeleton
  enquanto carrega e placeholder se algo falhar). Nunca depende de link externo.
- **Cardápio**: 6 coleções funcionais e 10 itens. Categorias filtram de verdade
  no backend; busca de erros mostra mensagem amigável + botão "Tentar de novo".
- **PWA**: `manifest.json`, ícones, service worker (instalável, offline para
  assets já visitados).
- **Animações**: `SplitReveal` (texto letra a letra), `Hero` (máscara +
  parallax), `ProductCard` (reveal no scroll) e `SmoothScrollProvider`
  (Lenis + GSAP).

## Produção (Vercel / Neon)

1. No dashboard da Vercel → Storage → crie um **Postgres** (Neon) e defina
   `DATABASE_URL` (ou cole a connection string em Settings → Environment Variables).
2. Faça push do repositório e importe na Vercel (build: `prisma generate && next build`).
3. Aplique o schema e popule uma vez:
   ```bash
   npx vercel env pull .env.local
   npm run db:setup:pg
   ```
4. Pronto — `https://<app>.vercel.app/api/health` deve responder `{"ok":true}`.

## Scripts

| Comando | O que faz |
| --- | --- |
| `npm run dev` | Inicia o app (cria banco/cardápio automaticamente na 1ª vez) |
| `npm run db:setup` | SQLite local: gera client, cria tabelas e popula cardápio |
| `npm run db:setup:pg` | Postgres: gera client, `db push` e popula cardápio |
| `npm run db:studio` | Abre o Prisma Studio para inspecionar o banco |
| `npm run build` | Build de produção (gera Prisma Client) |
