import jwt from "jsonwebtoken";
import redis from "../db/clienteRedis";
import { User } from "../types/user";

const ACCESS_SECRET: jwt.Secret = process.env.ACCESS_SECRET || "segredo";
const REFRESH_SECRET: jwt.Secret =
  process.env.REFRESH_SECRET || "refresh-secreto";
const ACCESS_EXPIRES_IN = process.env.ACCESS_EXPIRES_IN || "30s";
const REFRESH_EXPIRES_IN = process.env.REFRESH_EXPIRES_IN || "10m";

/* ===========================
   TOKENS
=========================== */

export function generateAccessToken(user: User) {
  return jwt.sign({ id: user.id, email: user.email }, ACCESS_SECRET, {
    expiresIn: ACCESS_EXPIRES_IN,
  } as jwt.SignOptions);
}

export function generateRefreshToken(user: User) {
  return jwt.sign({ id: user.id }, REFRESH_SECRET, {
    expiresIn: REFRESH_EXPIRES_IN,
  } as jwt.SignOptions);
}

/* ===========================
   REDIS (CACHE / BLACKLIST)
=========================== */

export async function saveTokenInCache(
  userId: number,
  token: string,
  ttl: number
) {
  if (!redis) return; // Redis desativado

  await redis.set(`token:${userId}`, token, {
    EX: ttl,
  });
}

export async function getTokenFromCache(userId: number) {
  if (!redis) return null;

  return redis.get(`token:${userId}`);
}

export async function deleteTokenFromCache(userId: number) {
  if (!redis) return;
  await redis.del(`token:${userId}`);
}
