# FUEGO ARTISAN — PWA funcional (Next.js 14)

App de pedidos completo, construído a partir do seu mockup: PWA instalável, backend real
(API Routes + Prisma + Postgres), carrinho, checkout e Clube da Brasa (fidelidade) que
realmente persistem no banco — nada é mockado. Animações com **GSAP + ScrollTrigger** e
**Lenis** (scroll suave) conforme a stack pedida.

## O que está implementado de verdade

- **Backend**: `app/api/products`, `app/api/cart`, `app/api/orders`, `app/api/loyalty` —
  rotas reais lendo/escrevendo no Postgres via Prisma.
- **Banco de dados**: schema Prisma (`prisma/schema.prisma`) com `Product`, `Category`,
  `Customer`, `CartItem`, `Order`, `OrderItem`, `LoyaltyAccount`, `LoyaltyEvent`.
- **Sessão de convidado**: cookie httpOnly identifica o cliente sem precisar de login,
  já cria conta de fidelidade automaticamente.
- **Carrinho persistente**: adicionar, atualizar quantidade e remover, tudo no banco.
- **Checkout**: cria `Order` + `OrderItem`s numa transação, limpa o carrinho e **carimba
  o Clube da Brasa automaticamente** (a cada 5 selos libera 1 recompensa grátis).
- **PWA**: `manifest.json`, ícones, service worker gerado por `next-pwa` (instalável,
  funciona offline para assets já visitados).
- **Animações**:
  - `SplitReveal.tsx` — texto do hero entrando letra por letra;
  - `Hero.tsx` — imagem revelada por máscara (clip-path) + parallax no scroll;
  - `ProductCard.tsx` — reveal dos cards conforme entram na viewport (ScrollTrigger);
  - `SmoothScrollProvider.tsx` — Lenis sincronizado com o ticker do GSAP.

## Rodando localmente

```bash
npm install
cp .env.example .env.local   # cole sua DATABASE_URL
npx prisma db push           # cria as tabelas
npm run db:seed              # popula os 3 produtos do mockup
npm run dev
```

Abra http://localhost:3000

## Deploy no Vercel (passo a passo)

1. **Crie o banco Postgres** (gratuito): no dashboard da Vercel → seu projeto →
   aba **Storage** → **Create Database** → escolha **Postgres** (Neon). Isso já
   gera a variável `DATABASE_URL` automaticamente no projeto.
   - Alternativa: crie um banco grátis em [neon.tech](https://neon.tech) e cole a
     connection string manualmente em **Settings → Environment Variables**.

2. **Suba o código**:
   ```bash
   git init
   git add .
   git commit -m "Fuego Artisan PWA"
   git branch -M main
   git remote add origin <seu-repo-git>
   git push -u origin main
   ```

3. **Importe o repositório na Vercel** (vercel.com/new). O build command já está
   configurado em `package.json` (`prisma generate && next build`) — não precisa
   mexer em nada.

4. **Aplique o schema no banco de produção** (uma vez, após o primeiro deploy):
   ```bash
   npx vercel env pull .env.local   # baixa a DATABASE_URL de produção
   npx prisma db push
   npm run db:seed
   ```

5. Pronto — acesse a URL gerada pela Vercel. No celular, abra no navegador e use
   "Adicionar à tela de início" para instalar como PWA.

## Próximos incrementos sugeridos

- Painel admin para gerenciar produtos/pedidos (hoje o seed cobre o catálogo inicial).
- Autenticação real (NextAuth) se quiser contas de cliente além do cookie de convidado.
- Integração de pagamento (Stripe/Mercado Pago) na rota `app/api/orders`.
- Camadas extras da stack pedida (Three.js/R3F para o burger em 3D, WebGL/GLSL para
  transições) — não entraram nesta primeira entrega para manter o app 100% funcional
  e leve; a estrutura de componentes já comporta adicioná-las depois sem refatorar o
  backend.
