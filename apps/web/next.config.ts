import dotEnv from "dotenv";
import { connectToBroker } from "mqtt-network";
import type { NextConfig } from "next";

dotEnv.config();

connectToBroker({ clientId: "web" });
const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;
