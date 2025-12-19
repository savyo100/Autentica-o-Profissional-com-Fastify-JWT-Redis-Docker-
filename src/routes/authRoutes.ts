import { FastifyInstance } from "fastify";
import {
  loginProfissional,
  protectedProfissional,
  refresh,
  logoutProfissional,
} from "../controllers/authController";

export default async function authRoutes(fastify: FastifyInstance) {
  fastify.post("/auth/login", loginProfissional);
  fastify.get("/auth/protected", protectedProfissional);
  fastify.post("/auth/refresh", refresh);
  fastify.post("/auth/logout", logoutProfissional);
}
