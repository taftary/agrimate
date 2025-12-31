import { PrismaPg } from "@prisma/adapter-pg";

export function getAdapter(): PrismaPg {
  const connectionString = `${process.env.DATABASE_URL}`;
  const adapter = new PrismaPg({ connectionString });
  return adapter;
}

