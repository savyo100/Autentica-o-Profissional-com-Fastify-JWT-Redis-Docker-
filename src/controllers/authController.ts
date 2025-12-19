import { FastifyReply, FastifyRequest } from "fastify";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import users from "../users.json";
import { User } from "../types/user";

import {
  generateAccessToken,
  generateRefreshToken,
  saveTokenInCache,
  getTokenFromCache,
  deleteTokenFromCache,
} from "../services/tokenServices";

/* ===========================
   LOGIN
=========================== */

export async function loginProfissional(
  req: FastifyRequest,
  reply: FastifyReply
) {
  const { email, password } = req.body as {
    email?: string;
    password?: string;
  };

  if (!email || !password) {
    return reply.code(400).send({
      error: "Email e senha são obrigatórios",
    });
  }

  const user = (users as User[]).find((u) => u.email === email);
  if (!user) {
    return reply.code(401).send({ error: "Credenciais inválidas" });
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return reply.code(401).send({ error: "Senha incorreta" });
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  await saveTokenInCache(
    user.id,
    accessToken,
    Number(process.env.ACCESS_TTL_SECONDS) || 30
  );

  return reply.send({ accessToken, refreshToken });
}

/* ===========================
   ROTA PROTEGIDA
=========================== */

export async function protectedProfissional(
  req: FastifyRequest,
  reply: FastifyReply
) {
  const auth = req.headers.authorization;

  if (!auth) {
    return reply.code(401).send({ error: "Token não informado" });
  }

  const token = auth.replace("Bearer ", "");

  try {
    const decoded = jwt.verify(
      token,
      process.env.ACCESS_SECRET || "segredo"
    ) as jwt.JwtPayload;

    const cachedToken = await getTokenFromCache(decoded.id);
    if (!cachedToken || cachedToken !== token) {
      return reply.code(401).send({ error: "Token expirado ou invalidado" });
    }

    return reply.send({
      message: "Acesso autorizado",
      user: decoded,
    });
  } catch {
    return reply.code(401).send({ error: "Token inválido ou expirado" });
  }
}

/* ===========================
   REFRESH TOKEN
=========================== */

export async function refresh(req: FastifyRequest, reply: FastifyReply) {
  const { refreshToken } = req.body as {
    refreshToken?: string;
  };

  if (!refreshToken) {
    return reply.code(400).send({
      error: "Refresh token é obrigatório",
    });
  }

  try {
    const decoded = jwt.verify(
      refreshToken,
      process.env.REFRESH_SECRET || "refresh-secreto"
    ) as jwt.JwtPayload;

    const user = (users as User[]).find((u) => u.id === decoded.id);
    if (!user) {
      return reply.code(401).send({ error: "Usuário não encontrado" });
    }

    const newAccessToken = generateAccessToken(user);
    await saveTokenInCache(
      user.id,
      newAccessToken,
      Number(process.env.ACCESS_TTL_SECONDS) || 30
    );

    return reply.send({ accessToken: newAccessToken });
  } catch {
    return reply
      .code(401)
      .send({ error: "Refresh token inválido ou expirado" });
  }
}

export async function logoutProfissional(
  req: FastifyRequest,
  reply: FastifyReply
) {
  const auth = req.headers.authorization;
  if (!auth) {
    return reply.code(400).send({ error: "Token não informado" });
  }
  const token = auth.replace("Bearer ", "");
  try {
    const decoded = jwt.verify(
      token,
      process.env.ACCESS_SECRET || "segredo"
    ) as jwt.JwtPayload;
    await deleteTokenFromCache(decoded.id);
    return reply.send({ message: "Logout realizado" });
  } catch {
    return reply.code(401).send({ error: "Token inválido" });
  }
}
