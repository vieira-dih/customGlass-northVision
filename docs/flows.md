# Fluxos de Dados — CustomGlass North Vision

Neste documento estão os principais fluxos do sistema descritos com diagramas Mermaid.

## Fluxo 1 — Vitrine Pública

```mermaid
sequenceDiagram
  participant Browser
  participant Frontend
  participant Backend
  participant DB
  participant Nuvemshop

  Browser->>Frontend: Acessa /
  Frontend->>Backend: GET /api/public/products
  Backend->>DB: resolvePublicStoreId() / getLatestStore()
  Backend->>Nuvemshop: GET /v1/{store}/products?per_page=200&page=1
  Nuvemshop-->>Backend: retorna lista de produtos
  Backend-->>Frontend: JSON com produtos públicos
  Frontend-->>Browser: renderiza ProductCard
```

## Fluxo 2 — OAuth 2.0 (Instalação pelo lojista)

```mermaid
sequenceDiagram
  participant Browser
  participant Frontend
  participant Backend
  participant Nuvemshop
  participant DB

  Browser->>Frontend: clica "Conectar loja"
  Frontend->>Backend: GET /auth/nuvemshop
  Backend->>Nuvemshop: redireciona para URL de autorização
  Nuvemshop-->>Browser: redireciona para /auth/callback?code=...&store_id=...
  Browser->>Backend: GET /auth/callback?code=...&store_id=...
  Backend->>Nuvemshop: POST /apps/authorize/token
  Nuvemshop-->>Backend: retorna access_token
  Backend->>DB: salva token em stores
  Backend-->>Browser: redireciona para /auth-callback?token=...&storeId=...
  Browser->>Frontend: AuthCallback.jsx salva token e storeId localmente
```

## Fluxo 3 — Checkout Personalizado

```mermaid
sequenceDiagram
  participant Browser
  participant Frontend
  participant Backend
  participant DB
  participant Nuvemshop

  Browser->>Frontend: escolhe 5 lentes e envia contato
  Frontend->>Backend: POST /api/public/checkout-link
  Backend->>DB: getStoreById(storeId) / getAccessTokenForStore(storeId)
  Backend->>Nuvemshop: POST /draft_orders
  Nuvemshop-->>Backend: retorna checkoutUrl
  Backend-->>Frontend: JSON { checkoutUrl }
  Frontend->>Browser: window.location.href = checkoutUrl
```

## Fluxo 4 — Produtos Autenticados do Lojista

```mermaid
sequenceDiagram
  participant Browser
  participant Frontend
  participant Backend
  participant DB
  participant Nuvemshop

  Browser->>Frontend: acessa área lojista e pede produtos
  Frontend->>Backend: GET /api/products/:storeId
  Backend->>Backend: authenticateJWT(req)
  Backend->>DB: getStoreById(storeId)
  Backend->>Nuvemshop: GET /v1/{store}/products
  Nuvemshop-->>Backend: retorna produtos
  Backend-->>Frontend: JSON produtos
  Frontend-->>Browser: exibe lista segura
```

## Observações

- O frontend usa `localStorage` para armazenar `authToken` e `storeId` após o OAuth.
- O backend mantém o `access_token` da Nuvemshop só no banco, evitando exposição ao navegador.
- A autenticação JWT é usada apenas para rotas protegidas, enquanto as rotas públicas podem ser acessadas sem token.
