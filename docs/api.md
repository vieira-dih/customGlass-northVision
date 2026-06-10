# API do Projeto — CustomGlass North Vision

Este documento descreve os endpoints disponíveis no backend e os contratos de requisição/resposta.

## Base URL

- Backend local: `http://localhost:3000`
- API pública principal: `http://localhost:3000/api`

## Endpoints de Autenticação / OAuth

### `GET /auth/nuvemshop`

- Inicia o fluxo OAuth com a Nuvemshop.
- Redireciona o usuário para a URL de autorização da Nuvemshop.

### `GET /auth/callback`

- Recebe `code` e `store_id` da Nuvemshop.
- Troca `code` por `access_token` e salva o token no banco.
- Gera um JWT e retorna um HTML que redireciona para o frontend.

### `GET /auth/verify`

- Validação de token JWT.
- Requer header: `Authorization: Bearer {token}`.
- Retorna informações do usuário/loja associada.

### `GET /auth/stores`

- Lista as lojas integradas do usuário autenticado.
- Requer JWT.

### `DELETE /auth/stores/:storeId`

- Desconecta uma loja do sistema.
- Requer JWT.

### `POST /auth/test-token`

- Endpoint de diagnóstico público.
- Body esperado: `{ accessToken, storeId }`.
- Verifica se o token é válido na API Nuvemshop.

### `POST /auth/lojista/login`

- Autenticação do lojista.
- Body: `{ email, senha }`.
- Retorna: `{ token, nome, userId }`.

### `POST /auth/lojista/criar`

- Cria um lojista inicial.
- Body: `{ nome, email, senha, adminSecret }`.
- Requer `adminSecret` igual a `process.env.ADMIN_SECRET`.

## Endpoints de Produtos

### `GET /api/public/products`

- Retorna produtos públicos para o catálogo da home.
- Não requer autenticação.
- Usa fallback para a loja mais recente se `storeId` não for informado.

### `POST /api/public/checkout-link`

- Gera link de checkout personalizado na Nuvemshop.
- Body esperado:
  ```json
  {
    "productSlug": "...",
    "nuvemshopProductId": 123,
    "customizacao": { "lentes": ["Preta", "Azul Claro"] },
    "contato": {
      "nome": "...",
      "sobrenome": "...",
      "email": "..."
    },
    "storeId": 1
  }
  ```
- Retorna: `{ checkoutUrl }`.

## Endpoints Protegidos (JWT)

### `GET /api/products/:storeId`

- Retorna todos os produtos da loja autenticada.
- Requer header: `Authorization: Bearer {token}`.

### `GET /api/products/:storeId/:productId`

- Retorna detalhes de um produto específico.
- Requer JWT.

### `GET /api/categories/:storeId`

- Retorna categorias da loja.
- Requer JWT.

### `GET /api/store-info/:storeId`

- Retorna informações da loja (nome, descrição, etc.).
- Requer JWT.

## Observações

- O backend é responsável por manter o `access_token` da Nuvemshop apenas no servidor/banco de dados.
- O frontend consome a API usando `fetch` e, quando necessário, envia `Authorization: Bearer {token}`.
- As rotas públicas são pensadas para permitir navegação inicial sem login, enquanto as rotas autenticadas expõem dados de loja e ações administrativas.
