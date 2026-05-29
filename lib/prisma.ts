import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createClient() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    // Neon coupe les connexions inactives — ces options évitent le P1017
    max: 1, // 1 seule connexion en dev (évite la saturation)
    idleTimeoutMillis: 10000, // libère après 10s d'inactivité
    connectionTimeoutMillis: 10000, // timeout si pas de connexion en 10s
  });

  pool.on("error", (err) => {
    console.error("Pool error — reconnexion automatique", err.message);
  });

  const adapter = new PrismaPg(pool);
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
