import "dotenv/config";
import Fastify from "fastify";
import cors from "@fastify/cors";
import authRoutes from "./routes/authRoutes";

const app = Fastify({ logger: true });

app.register(cors);
app.register(authRoutes);

// Rota GET /
app.get("/", async (request, reply) => {
  return {
    message: "API funcionando corretamente!",
  };
});

app
  .listen({ port: Number(process.env.PORT) || 3000 })
  .then(() =>
    console.log("Servidor rodando na porta " + (process.env.PORT || 3000))
  )
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
