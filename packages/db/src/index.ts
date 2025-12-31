import dotenv from "dotenv";
import { PrismaClient } from "../generated/client";
import { getAdapter } from "./adapter";

dotenv.config();

export const adapter = getAdapter();
export const client = new PrismaClient({ adapter });

export * from "../generated/client";
export * from "./node";
export * from "./pin";
export * from "./rule";
export * from "./plan";
export * from "./adapter";
