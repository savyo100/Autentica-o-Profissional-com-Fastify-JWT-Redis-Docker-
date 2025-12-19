API de Autenticação com Fastify, JWT e Redis

Este projeto implementa um fluxo completo de autenticação, conforme visto em sala de aula, utilizando Fastify, JWT (Access Token + Refresh Token) e Redis (executado via Docker) para gerenciamento de sessão com TTL.

O objetivo é demonstrar, de forma prática, boas práticas de autenticação, controle de sessão e invalidação de tokens.

🚀 Tecnologias Utilizadas

Node.js + TypeScript

Fastify – framework backend

JWT (jsonwebtoken) – autenticação baseada em tokens

Redis – cache de sessão com TTL

Docker / Docker Compose – execução do Redis em container

🎯 Funcionalidades Implementadas

Login com Access Token (curta duração)

Geração e uso de Refresh Token (longa duração)

Armazenamento do Access Token no Redis com TTL

Validação de token e sessão em rotas protegidas

Renovação de sessão via Refresh Token

Invalidação manual da sessão (Logout)

Tratamento de erros e boas práticas de segurança

📌 Endpoints
🔐 POST /auth/login

Realiza o login do profissional e gera os tokens de autenticação.

Body:

{
  "email": "aluno@ifpi.edu.br",
  "password": "123456"
}

Retorno:

{
  "accessToken": "...",
  "refreshToken": "..."
}

Implementação: src/controllers/authController.ts (linhas 19–54)

🔒 GET /auth/protected

Rota protegida que valida:

JWT (Access Token)

Sessão ativa no Redis (token existente e válido)

Header:

Authorization: Bearer <accessToken>

Implementação: src/controllers/authController.ts (linhas 60–90)

🔁 POST /auth/refresh

Renova a sessão utilizando o Refresh Token.

Body:

{
  "refreshToken": "..."
}

Comportamento:

Valida o Refresh Token

Gera um novo Access Token

Atualiza a sessão no Redis com novo TTL

Implementação: src/controllers/authController.ts (linhas 96–126)

🚪 POST /auth/logout

Encerra a sessão do usuário.

Header:

Authorization: Bearer <accessToken>

Comportamento:

Remove a chave token:<userId> do Redis

Invalida a sessão ativa

Implementação: src/controllers/authController.ts (linhas 133–152)

🧪 Exemplos de Uso (cURL)
🔑 Login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"aluno@ifpi.edu.br","password":"123456"}'
🔒 Rota protegida
curl http://localhost:3000/auth/protected \
  -H "Authorization: Bearer <accessToken>"
🔁 Refresh Token
curl -X POST http://localhost:3000/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"<refreshToken>"}'
🚪 Logout
curl -X POST http://localhost:3000/auth/logout \
  -H "Authorization: Bearer <accessToken>"
🧠 Fluxo de Autenticação e Sessões
🔑 Geração de Tokens

Access Token: src/services/tokenServices.ts (linhas 15–19)

Refresh Token: src/services/tokenServices.ts (linhas 21–25)

🗄️ Armazenamento de Sessão no Redis

Função: saveTokenInCache(userId, token, ttl)

Arquivo: src/services/tokenServices.ts (linhas 31–41)

O TTL é controlado pela constante ACCESS_TTL_SECONDS, que acompanha o tempo de expiração do Access Token.

✅ Validação de Token e Sessão

Verificação do JWT + checagem do token no Redis

Implementação: src/controllers/authController.ts (linhas 72–81)

🔁 Renovação de Sessão

Validação do Refresh Token

Emissão de novo Access Token

Salvamento no Redis com novo TTL

Implementação: src/controllers/authController.ts (linhas 118–125)

❌ Invalidação de Sessão (Logout)

Função: deleteTokenFromCache(userId)

Arquivo: src/services/tokenServices.ts (linhas 49–52)

Utilizada no endpoint de logout
