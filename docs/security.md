# Segurança — CustomGlass North Vision

Este documento resume as práticas de segurança e proteção de dados adotadas no projeto.

## 1. Uso de variáveis de ambiente

Todas as credenciais e segredos são carregados por meio de `.env`:

- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`
- `NUVEMSHOP_CLIENT_ID`, `NUVEMSHOP_CLIENT_SECRET`
- `NUVEMSHOP_REDIRECT_URI`
- `JWT_SECRET`
- `ADMIN_SECRET`
- `FRONTEND_URL`

O arquivo `.env` deve ser mantido fora do controle de versão e listado no `.gitignore`.

## 2. OAuth 2.0 com state parameter

O fluxo de autenticação com a Nuvemshop utiliza OAuth 2.0. O backend gera um `state` aleatório para prevenir ataques CSRF.

## 3. Tokens e segredos no servidor

- O `access_token` da Nuvemshop é salvo apenas no banco de dados PostgreSQL.
- O frontend nunca recebe o `access_token` da loja.
- O frontend recebe apenas um JWT assinado pelo backend.

## 4. Autenticação com JWT

- O JWT é gerado em `backend/src/services/auth.service.js`.
- Algoritmo: `HS256`.
- Expiração: `24h`.
- O middleware valida o token para rotas protegidas.

## 5. Proteção de rotas

- Rotas públicas: `GET /api/public/products`, `POST /api/public/checkout-link`.
- Rotas protegidas: `GET /api/products/:storeId`, `GET /api/categories/:storeId`, `GET /api/store-info/:storeId`, `GET /auth/verify`, `GET /auth/stores`, `DELETE /auth/stores/:storeId`.
- O middleware verifica o `Authorization: Bearer {token}`.

## 6. Validação de entrada

- O backend valida campos obrigatórios e tipos básicos.
- O endpoint `POST /auth/lojista/criar` valida senha com requisitos mínimos:
  - pelo menos 8 caracteres
  - pelo menos 1 letra maiúscula
  - pelo menos 1 número
  - pelo menos 1 caractere especial

## 7. SQL parametrizado

Todas as queries ao PostgreSQL usam parâmetros preparados (`$1`, `$2`, etc.) para evitar SQL Injection.

## 8. CORS restrito

O backend configura CORS apenas para o frontend autorizado via `FRONTEND_URL`.

## 9. Limpeza de sessão no frontend

Quando a API retorna `401` ou `403`, o frontend remove `authToken` e `storeId` do `localStorage`.
