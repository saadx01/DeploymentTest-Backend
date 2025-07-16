import { createClient } from "redis";

const redisClient = createClient({
  url: "redis://default:CS6cZZxyGNVODRjQrNPedzHseUy3ATRR@redis-18513.c44.us-east-1-2.ec2.redns.redis-cloud.com:18513"
});

redisClient.on("error", (err) => console.error("❌ Redis Error:", err));
redisClient.on("connect", () => console.log("✅ Redis Connected"));

await redisClient.connect();

export default redisClient;
