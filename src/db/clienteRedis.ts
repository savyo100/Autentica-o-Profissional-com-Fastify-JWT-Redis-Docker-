import { createClient } from "redis";

const useRedis = process.env.USE_REDIS === "true";

let client: ReturnType<typeof createClient> | null = null;

if (useRedis) {
  client = createClient({
    url: process.env.REDIS_URL || "redis://127.0.0.1:6379",
    socket: {
      reconnectStrategy: (retries) => {
        if (retries > 3) {
          console.error("Redis indisponível após 3 tentativas");
          return false; // para de tentar
        }
        return 1000; // tenta novamente em 1s
      }
    }
  });

  client.on("connect", () => {
    console.log(" Redis conectado");
  });

  client.on("error", (err) => {
    console.error(" Erro no Redis:", err.message);
  });

  client.connect().catch(() => {
    // evita crash da aplicação
  });
}

export default client;
