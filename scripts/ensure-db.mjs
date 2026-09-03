// Bootstrap automático do banco local (SQLite).
// Roda antes de `next dev`: se não existir banco, cria o schema e
// popula o cardápio — o app funciona logo após `npm install && npm run dev`.
// Se DATABASE_URL apontar para Postgres (produção), não faz nada.

import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outerEnv = process.env.DATABASE_URL;

// Apenas SQLite/local. Postgres via env é responsabilidade do deploy.
const usingSqlite = !outerEnv || /^file:/i.test(outerEnv);

if (usingSqlite) {
  process.env.DATABASE_URL = "file:./dev.db";
  const dbFile = path.join(root, "prisma", "dev.db");

  if (!existsSync(dbFile)) {
    console.log("⚙️  Primeira execução: criando banco local (SQLite) e cardápio...");
    execSync("npx prisma generate --schema prisma/schema.local.prisma", {
      cwd: root,
      stdio: "inherit",
    });
    execSync("npx prisma db push --schema prisma/schema.local.prisma", {
      cwd: root,
      stdio: "inherit",
    });
    execSync("npx tsx prisma/seed.ts", { cwd: root, stdio: "inherit" });
    console.log("✅ Banco local pronto (prisma/dev.db).");
  }
}
