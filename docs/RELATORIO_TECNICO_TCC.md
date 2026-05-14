# Relatório Técnico — CustomGlass North Vision
## Roteiro para Apresentação de Banca de TCC

---

## SLIDE 1 — Visão Geral do Sistema

**Nome do Projeto:** CustomGlass North Vision
**Objetivo:** Plataforma web de personalização de óculos esportivos com integração direta ao e-commerce do cliente via API Nuvemshop, permitindo que o consumidor final escolha lentes e seja redirecionado ao checkout da loja oficial.

**Versão do Backend:** 2.0.0 — OAuth 2.0 com PostgreSQL
**Frontend:** React 19 + Vite 7
**Repositório:** Monorepo com pastas `/frontend` e `/backend`

---

## SLIDE 2 — Arquitetura do Sistema

**Padrão:** Client-Server em camadas (Layered Architecture) com separação MVC no backend.

```
┌─────────────────────────────────────────────────────┐
│  CLIENTE (Browser)                                  │
│  React 19 SPA — Vite 7 — React Router DOM v7        │
└────────────────────┬────────────────────────────────┘
                     │ HTTP / Fetch API
                     │ JWT Bearer Token
┌────────────────────▼────────────────────────────────┐
│  BACKEND (Node.js + Express 5)                      │
│  ┌──────────┐ ┌────────────┐ ┌────────────────────┐ │
│  │  Routes  │→│Controllers │→│    Services        │ │
│  └──────────┘ └────────────┘ └────────┬───────────┘ │
│                                       │             │
│  ┌────────────────┐   ┌───────────────▼───────────┐ │
│  │  PostgreSQL DB │   │  API Nuvemshop (externa)  │ │
│  │  (stores/users)│   │  REST v1 + OAuth 2.0      │ │
│  └────────────────┘   └───────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

**Organização de diretórios:**

| Camada | Localização | Responsabilidade |
|--------|-------------|-----------------|
| Rotas | `backend/src/routes/` | Definição de endpoints e aplicação de middlewares |
| Controllers | `backend/src/controllers/` | Validação de entrada e montagem de resposta HTTP |
| Services | `backend/src/services/` | Lógica de negócio, OAuth, integração Nuvemshop |
| Models | `backend/src/models/` | Acesso ao banco — padrão Repository |
| Config | `backend/src/config/` | Pool de conexão PostgreSQL |
| Middleware | `backend/src/middleware/` | JWT, autorização, logging |
| Frontend | `frontend/src/pages/` | Pages por rota; `components/` reutilizáveis; `services/` para HTTP |

---

## SLIDE 3 — Fluxo de Dados Completo

### Fluxo 1 — Vitrine Pública (Home → Catálogo)

```
1. Usuário acessa /
2. Home.jsx → buscarProdutosPublicos() [api.js]
3. GET /api/public/products → productController.listarProdutosPublicos()
4. resolvePublicStoreId() → busca storeId no banco (fallback automático)
5. nuvemshopService.getProducts() → GET /products?per_page=200&page=N
6. Paginação automática até trazer todos os produtos
7. Frontend filtra por nome exato dos 7 produtos autorizados
8. Renderiza ProductCard com imagem, nome e slug
```

### Fluxo 2 — OAuth 2.0 (Instalação pelo Lojista)

```
1. Lojista clica em "Instalar" → GET /auth/nuvemshop
2. Backend gera URL Nuvemshop com state (anti-CSRF)
3. Nuvemshop redireciona para /auth/callback?code=XXX&store_id=YYY
4. Backend troca code por access_token via POST /apps/authorize/token
5. Token salvo criptografado no PostgreSQL (tabela stores)
6. Backend gera JWT (24h, HS256) e redireciona ao frontend
7. Frontend armazena JWT + storeId no localStorage
8. GET /auth-callback → AuthCallback.jsx processa e redireciona ao admin
```

### Fluxo 3 — Checkout Personalizado

```
1. Cliente escolhe 5 lentes na ProductPage
2. Preenche modal com nome, sobrenome, e-mail
3. POST /api/public/checkout-link com { nuvemshopProductId, customizacao, contato }
4. Backend monta observações: "Lentes: Preta, Azul Claro, Verde..."
5. nuvemshopService.criarPedidoPersonalizado() → POST /orders na Nuvemshop
6. Recebe URL de checkout normalizada (/comprar/:pedidoId)
7. Frontend redireciona: window.location.href = checkoutUrl
```

---

## SLIDE 4 — Stack Tecnológica Justificada

### Backend

| Tecnologia | Versão | Justificativa no Código |
|-----------|--------|------------------------|
| **Node.js + Express 5** | 5.2.1 | Assincronismo nativo com `async/await`; ideal para múltiplas chamadas à API Nuvemshop sem bloquear o event loop |
| **PostgreSQL + pg** | 8.20.0 | Persistência de tokens OAuth e dados de loja; Connection Pool (`max: 20`) para suportar múltiplas requisições simultâneas |
| **JWT (jsonwebtoken)** | 9.0.3 | Autenticação stateless; token expira em 24h com algoritmo HS256; não exige sessão no servidor |
| **bcryptjs** | 3.0.3 | Hash de senhas de lojistas; sem armazenamento de senha em plaintext |
| **axios** | 1.13.6 | Cliente HTTP com factory pattern para criar clientes Nuvemshop configurados por loja; suporte a interceptors |
| **dotenv** | 17.3.1 | Isolamento de credenciais do código-fonte; arquivo `.env.example` documentado |

### Frontend

| Tecnologia | Versão | Justificativa no Código |
|-----------|--------|------------------------|
| **React 19** | 19.2.0 | Hooks (`useState`, `useEffect`) para gerenciamento de estado local sem Redux; renderização reativa |
| **Vite 7** | 7.3.1 | Build com HMR (Hot Module Replacement); bundling otimizado de assets (imagens `.png` de lentes) |
| **React Router DOM v7** | 7.13.1 | SPA com rotas dinâmicas (`/produto/:slug`); sem reload de página |
| **CSS Modules / Vanilla CSS** | — | Escopo de estilos por página; `clamp()` para tipografia responsiva; `flex`/`grid` para layout |

---

## SLIDE 5 — Protocolos de Segurança

### 1. Variáveis de Ambiente
Todas as credenciais são carregadas via `.env`:
```
NUVEMSHOP_CLIENT_ID, NUVEMSHOP_CLIENT_SECRET
JWT_SECRET, ADMIN_SECRET
DB_HOST, DB_PASSWORD
FRONTEND_URL, STORE_PUBLIC_URL
```
O arquivo `.env.example` documenta as variáveis sem expor valores reais.

### 2. OAuth 2.0 com State Parameter (Anti-CSRF)
```javascript
const state = Math.random().toString(36).substring(2, 15) +
              Math.random().toString(36).substring(2, 15)
// State enviado na URL e verificado no callback
```

### 3. JWT com Expiração e Verificação de Escopo
```javascript
// Middleware verifica se o storeId do token bate com o da requisição
if (req.user.storeId !== requestedStoreId) {
  return res.status(403).json({ erro: "Acesso negado" })
}
```

### 4. Queries Parametrizadas (Anti-SQL Injection)
```sql
INSERT INTO stores (user_id, nuvemshop_store_id, nuvemshop_access_token)
VALUES ($1, $2, $3)  -- Parâmetros nunca concatenados como string
```

### 5. Backend como Proxy de API
O `access_token` da Nuvemshop **nunca chega ao frontend**. O fluxo é:
```
Frontend → Backend (JWT) → Backend busca token no DB → Nuvemshop
```
A chave de integração permanece exclusivamente no banco PostgreSQL.

### 6. CORS Configurado
```javascript
app.use(cors({ origin: process.env.FRONTEND_URL }))
// Apenas o frontend autorizado pode consumir a API
```

### 7. Sessão Expirada com Limpeza Automática
```javascript
if (response.status === 401 || response.status === 403) {
  clearAuthSession() // Remove authToken e storeId do localStorage
  throw new Error("Sessão expirada...")
}
```

### 8. Validação de ADMIN_SECRET para criação de lojistas
```javascript
if (adminSecret !== process.env.ADMIN_SECRET) {
  return res.status(403).json({ erro: "Não autorizado" })
}
if (senha.length < 8) {
  return res.status(400).json({ erro: "Senha mínima de 8 caracteres" })
}
```

---

## SLIDE 6 — Infraestrutura e Deploy

O projeto não possui Dockerfile no repositório — o ambiente de desenvolvimento é local com os processos rodando diretamente via Node.js e Vite. A infraestrutura de produção é definida por:

| Componente | Ferramenta | Configuração |
|-----------|-----------|-------------|
| Backend | Node.js processo direto | `npm run dev` (nodemon) / `node src/server.js` |
| Frontend | Vite Dev Server | Porta 5173, strictPort: true |
| Banco | PostgreSQL local | Pool de 20 conexões, `schema.sql` para setup |
| Variáveis | `.env` | Documentadas em `.env.example` |

**Processo de setup documentado** em `SETUP_OAUTH_POSTGRESQL.md`:
1. `npm install` (backend e frontend)
2. `psql -f schema.sql` para criar tabelas
3. Configurar `.env` com credenciais Nuvemshop
4. Criar lojista via `POST /auth/lojista/criar` com `ADMIN_SECRET`
5. Instalar app na loja para disparar fluxo OAuth

---

## SLIDE 7 — Performance e Experiência do Usuário

### Mobile First
```css
/* Layout responsivo com CSS Grid e Flex */
.produtos {
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
}

/* Tipografia escala com a viewport */
.custom-right h1 {
  font-size: clamp(20px, 2vw, 32px);
}

/* Breakpoint mobile */
@media (max-width: 900px) {
  .custom-container { flex-direction: column; }
}
```

### Carregamento Eficiente de Assets
- **Imagens de lentes** importadas estaticamente no JSX → Vite gera hash no build (`lens-preta.a3f2c.png`) para cache busting automático
- **Vídeo do banner** servido da pasta `public/` → não passa pelo bundler, servido diretamente pelo servidor HTTP sem processamento extra
- **Paginação no backend** (`per_page=200`) evita múltiplas requisições desnecessárias à API Nuvemshop

### UX da Personalização
- `onMouseEnter` → preview da lente em tempo real sem clique
- `onMouseLeave` → retorna à última lente selecionada
- Tooltip com `position: absolute` e `opacity` para transição suave sem reflow de layout
- `sticky` no preview da lente para acompanhar o scroll na área de seleção

---

## SLIDE 8 — Diferenciais Técnicos para a Banca

| Diferencial | Evidência no Código |
|------------|-------------------|
| **OAuth 2.0 real com loja ativa** | `auth.service.js` — fluxo completo de authorization code com troca de tokens |
| **Multi-tenant** | Cada loja tem seu token isolado no banco; sistema preparado para múltiplos clientes |
| **Paginação automática** | `while (continuarBuscando)` em `nuvemshopService.js` |
| **Checkout integrado** | Pedido criado programaticamente na Nuvemshop com observações de personalização |
| **Separação de tokens** | `access_token` da API nunca exposto ao browser |
| **React 19 + Vite 7** | Versões de ponta; Vite 7 lançado em 2025 |
| **Express 5** | Versão mais recente do framework; suporte nativo a async error handling |

---

## SLIDE 9 — Mapa Completo de Funções do Sistema

> Esta seção lista **onde está cada função**, em qual arquivo, qual endpoint/rota ela atende e o que ela faz. Use como referência rápida para responder perguntas da banca.

---

### BACKEND — `backend/src/`

---

#### `config/database.js` — Conexão com o Banco de Dados

| Função | O que faz |
|--------|-----------|
| `query(text, params)` | Wrapper que executa qualquer SQL no PostgreSQL via pool. Recebe a query e um array de parâmetros preparados (previne SQL Injection). Retorna o resultado e loga o tempo de execução. |
| `testConnection()` | Executa `SELECT NOW()` para verificar se o banco está acessível. Usada na inicialização do servidor. |
| `pool` (objeto exportado) | Instância do `pg.Pool` com `max: 20` conexões simultâneas. Reutiliza conexões abertas em vez de abrir uma nova por requisição. |

**Por que está aqui:** toda comunicação com o PostgreSQL passa por este módulo. Se o banco cair, o erro é rastreado a partir daqui.

---

#### `middleware/auth.middleware.js` — Camada de Segurança HTTP

| Função | Aplicada em | O que faz |
|--------|-------------|-----------|
| `authenticateJWT(req, res, next)` | Todas as rotas protegidas | Lê o header `Authorization: Bearer TOKEN`, verifica a assinatura JWT com `verifyJWT()`, e injeta os dados decodificados em `req.user`. Retorna 401 se o token for inválido ou ausente. |
| `authorizeStoreAccess(req, res, next)` | Rotas com `:storeId` | Compara o `storeId` do JWT com o `storeId` da URL. Retorna 403 se um lojista tentar acessar dados de outra loja. |
| `logRequest(req, res, next)` | Opcional em qualquer rota | Registra método HTTP, path e usuário em cada requisição. Útil para debug. |

**Por que está aqui:** separar a lógica de autenticação dos controllers mantém o código limpo (princípio Single Responsibility).

---

#### `models/store.model.js` — Acesso ao Banco (Padrão Repository)

| Função | SQL executado | O que faz |
|--------|--------------|-----------|
| `createStore(userId, nuvemshopStoreId, accessToken, storeName)` | `INSERT INTO stores` | Persiste uma nova integração de loja com o token OAuth recebido. |
| `getStoreById(storeId)` | `SELECT ... WHERE id = $1` | Busca loja pelo ID interno do sistema. Usada pela maioria dos services. |
| `getStoreByNuvemshopId(nuvemshopStoreId)` | `SELECT ... WHERE nuvemshop_store_id = $1` | Busca loja pelo ID que vem da Nuvemshop no callback OAuth. |
| `getStoresByUserId(userId)` | `SELECT ... WHERE user_id = $1` | Lista todas as lojas de um lojista. Suporte a múltiplos clientes (multi-tenant). |
| `getLatestStore()` | `SELECT ... ORDER BY updated_at DESC LIMIT 1` | Retorna a loja mais recentemente integrada. Usada como fallback público quando nenhum `storeId` é informado. |
| `updateAccessToken(storeId, newAccessToken)` | `UPDATE stores SET nuvemshop_access_token = $1` | Renova o token quando o lojista reinstala o app. |
| `updateStoreName(storeId, storeName)` | `UPDATE stores SET store_name = $1` | Atualiza nome amigável da loja. |
| `deleteStore(storeId)` | `DELETE FROM stores WHERE id = $1` | Remove integração (desinstala o app). |
| `storeExists(nuvemshopStoreId)` | `SELECT id ... LIMIT 1` | Verifica se a loja já está cadastrada antes de criar duplicata. |

**Por que está aqui:** a camada Model isola todas as queries SQL. Se o schema do banco mudar, só este arquivo precisa ser editado.

---

#### `controllers/authController.js` — Rotas de Autenticação

| Função | Rota HTTP | O que faz |
|--------|-----------|-----------|
| `loginLojista(req, res)` | `POST /auth/lojista/login` | Recebe `{ email, senha }`, delega validação ao `auth.service.loginLojista()`, retorna JWT + nome do lojista. |
| `criarLojista(req, res)` | `POST /auth/lojista/criar` | Cria novo lojista apenas se `adminSecret` bater com a variável de ambiente `ADMIN_SECRET`. Valida senha mínima de 8 caracteres. |
| `initiateOAuth(req, res)` | `GET /auth/nuvemshop` | Gera a URL de autorização da Nuvemshop com parâmetro `state` (anti-CSRF) e redireciona o lojista para ela. |
| `handleOAuthCallback(req, res)` | `GET /auth/callback` | Recebe `code` e `store_id` da Nuvemshop após autorização. Chama `completeOAuthFlow()`, gera JWT e devolve HTML que redireciona para o frontend com o token na URL. |
| `verifyToken(req, res)` | `GET /auth/verify` | Valida o JWT enviado pelo frontend (via middleware) e retorna os dados da loja associada. Usado pelo painel do lojista na inicialização. |

**Por que está aqui:** o controller só faz validação de entrada e monta a resposta HTTP. A lógica de negócio fica no service.

---

#### `controllers/productController.js` — Rotas de Produtos e Checkout

| Função | Rota HTTP | O que faz |
|--------|-----------|-----------|
| `resolvePublicStoreId(requestedStoreId)` | *(helper interno)* | Tenta usar o `storeId` da query; se ausente, usa `PUBLIC_STORE_ID` do `.env`; se ainda ausente, chama `getLatestStore()`. Garante que rotas públicas sempre tenham uma loja para consultar. |
| `listarProdutos(req, res)` | `GET /api/products/:storeId` | Rota autenticada (exige JWT). Chama `NuvemshopService.getProducts()` e retorna o array completo. |
| `listarProdutosPublicos(req, res)` | `GET /api/public/products` | Rota pública (sem JWT). Usa `resolvePublicStoreId()` e retorna produtos para a vitrine da Home. |
| `gerarCheckoutLinkPublico(req, res)` | `POST /api/public/checkout-link` | Recebe `{ nuvemshopProductId, customizacao, contato }`, monta texto com lentes escolhidas e chama `criarPedidoPersonalizado()`. Retorna a URL de checkout da Nuvemshop. |
| `obterProduto(req, res)` | `GET /api/products/:storeId/:productId` | Busca detalhes de um produto específico pelo ID. |
| `listarCategorias(req, res)` | `GET /api/categories/:storeId` | Retorna todas as categorias da loja via Nuvemshop. |

---

#### `services/auth.service.js` — Lógica de Autenticação e OAuth

| Função | O que faz |
|--------|-----------|
| `generateAuthorizationUrl()` | Monta a URL `https://www.nuvemshop.com.br/apps/{clientId}/authorize?...` com parâmetros OAuth e um `state` aleatório para prevenção de CSRF. |
| `exchangeCodeForToken(code)` | Faz `POST /apps/authorize/token` na Nuvemshop enviando `client_id`, `client_secret` e `code`. Recebe o `access_token` e o `store_id`. |
| `completeOAuthFlow(code, localUserId)` | Orquestra as 3 etapas: 1) troca `code` por token, 2) verifica se a loja já existe no banco, 3) cria ou atualiza o registro. Retorna o `storeId` interno e `isNew`. |
| `loginLojista(email, senha)` | Busca lojista pelo email na tabela `users`, compara senha com `bcrypt.compare()`, gera e retorna JWT. |
| `criarLojista(nome, email, senha)` | Faz hash da senha com `bcrypt` (12 rounds) e insere na tabela `users`. |
| `generateJWT(userId, storeId)` | Assina um token JWT com `JWT_SECRET` (variável de ambiente), com expiração de 24h. Payload: `{ userId, storeId }`. |
| `verifyJWT(token)` | Verifica assinatura e expiração do JWT. Retorna o payload decodificado ou `null` se inválido. |
| `getAccessTokenForStore(storeId)` | Busca o `nuvemshop_access_token` da loja no banco via `getStoreById()`. Usado por todo o `nuvemshopService` antes de fazer chamadas à API. |

---

#### `services/nuvemshopService.js` — Integração com a API da Nuvemshop

| Função | O que faz |
|--------|-----------|
| `createNuvemshopClient(storeId, accessToken)` | Factory que retorna uma instância Axios pré-configurada com `baseURL = https://api.nuvemshop.com.br/v1/{storeId}`, header `Authentication: bearer {token}` e `User-Agent` obrigatório. |
| `getProducts(storeId)` | Busca produtos com paginação automática: loop `while` chamando `/products?per_page=200&page=N` até a página retornar menos de 200 itens. Retorna array completo. |
| `getProductById(storeId, productId)` | `GET /products/{productId}` — retorna detalhes completos de um produto específico. |
| `createProductVariant(storeId, productId, variantData)` | `POST /products/{productId}/variants` — cria uma nova variante (ex.: cor de lente). |
| `getCategories(storeId)` | `GET /categories` — retorna todas as categorias de produtos da loja. |
| `getCustomerByEmail(storeId, email)` | `GET /customers?email={email}` — verifica se um cliente já está cadastrado na loja. |
| `createCustomer(storeId, customerData)` | `POST /customers` — cria novo cliente na loja Nuvemshop. |
| `criarPedidoPersonalizado(storeId, productId, observacoes, contato, customizacao)` | Etapa central do checkout: cria ou encontra o cliente, depois faz `POST /orders` com o produto selecionado e as lentes como observação do pedido. Retorna a `checkoutUrl`. |

---

#### `criar-lojista.js` — Script de Linha de Comando

| Função | O que faz |
|--------|-----------|
| `perguntar(pergunta)` | Wrapper de `readline` que transforma a pergunta interativa em uma `Promise`. |
| `perguntarSenha(pergunta)` | Igual ao anterior, mas usa `process.stdin.setRawMode` para ocultar os caracteres digitados (exibe `*` no lugar). |
| `criar()` | Função principal: pede nome, e-mail e senha; valida; faz hash com bcrypt; insere na tabela `users` via SQL direto. Não exige o servidor rodando. |

**Uso:** `node criar-lojista.js` — executado uma vez na configuração inicial da plataforma.

---

### FRONTEND — `frontend/src/`

---

#### `App.jsx` — Roteamento Global

| Função/Elemento | O que faz |
|----------------|-----------|
| `App()` | Componente raiz. Define todas as rotas SPA com React Router: `/` (Home), `/produto/:slug` (ProductPage dinâmica), `/auth-callback` (OAuth), `/lojista/login`, `/lojista/admin`, `/admin`. |

---

#### `components/Header.jsx` e `components/Footer.jsx`

| Componente | O que faz |
|-----------|-----------|
| `Header()` | Exibe logo e link de navegação para Home. Presente em todas as páginas públicas. |
| `Footer()` | Exibe copyright e link discreto para `/lojista/login` (área restrita). |

---

#### `components/ProductCard.jsx`

| Função | O que faz |
|--------|-----------|
| `ProductCard({ nome, imagem, slug, nuvemshopId })` | Renderiza card de produto com imagem, nome e botão "Personalizar". Monta o link para `/produto/{slug}?pid={nuvemshopId}&nome={nome}` para que a ProductPage saiba qual produto abrir e qual ID usar no checkout. |

---

#### `components/OAuthButton.jsx`

| Função | O que faz |
|--------|-----------|
| `OAuthButton({ label })` | Renderiza botão que ao ser clicado executa `iniciarOAuth()`. |
| `iniciarOAuth()` | Faz `window.location.href = "http://localhost:3000/auth/nuvemshop"` — redireciona o browser para o backend iniciar o fluxo OAuth. O backend então redireciona para a Nuvemshop. |

---

#### `pages/Home/Home.jsx` — Vitrine Pública

| Função | O que faz |
|--------|-----------|
| `Home()` | Componente da página inicial. Exibe vídeo banner e grade de produtos. |
| `carregarProdutos()` *(dentro do useEffect)* | Chama `buscarProdutosPublicos()` do `api.js`. Filtra o resultado mantendo apenas os 7 produtos autorizados (comparação por nome em lowercase). Transforma o formato da API para `{ id, nuvemshopId, nome, imagem, slug }` antes de renderizar. |

**Lista dos 7 produtos autorizados** (hardcoded em `Home.jsx`):
```
"kit radar ev 5 lentes brilho curvo"
"kit radar ev 5 lentes transparente brilho curvo"
"radar ev bege kit 5 lentes brilho curvo"
"kit radar ev 5 lentes - branca brilho curvo"
"kit radar ev 5 lentes - cinza brilho curvo"
"kit 5 lentes - radar ev marrom - brilho curvo"
"kit 5 lentes - radar ev transparente fosco - brilho curvo -"
```

---

#### `pages/ProductPage/productPage.jsx` — Personalização e Checkout

| Função | O que faz |
|--------|-----------|
| `ProductPage()` | Componente da página de personalização. Lê `slug` da URL e `pid` (nuvemshopProductId) dos query params. |
| `toggleLente(lente)` | Adiciona ou remove a lente do array `lentesSelecionadas`. Se a lente já está na lista, remove; se não está e o limite de 5 ainda não foi atingido, adiciona. Atualiza o preview da imagem. |
| `handleComprarPersonalizado()` | Valida se exatamente 5 lentes foram selecionadas. Se sim, abre o modal de dados de contato. |
| `handleConfirmarContato()` | Valida nome, sobrenome e e-mail. Chama `gerarCheckoutPersonalizado()` do `api.js` com as lentes e os dados de contato. Ao receber a `checkoutUrl`, executa `window.location.href` para redirecionar ao checkout da loja. |

---

#### `pages/AuthCallback/AuthCallback.jsx` — Processamento OAuth no Frontend

| Função | O que faz |
|--------|-----------|
| `AuthCallback()` | Página de transição OAuth. Exibe spinner durante o processamento. |
| `processCallback()` *(dentro do useEffect)* | Lê todos os query params da URL. **Cenário A:** se tem `token` (vindo do backend como redirect), salva `authToken` e `storeId` no `localStorage` e redireciona para Home. **Cenário B:** se tem `code` (vindo direto da Nuvemshop), envia para o backend processar e extrai a URL de redirect do HTML retornado. **Cenário C:** se tem `error`, exibe mensagem e redireciona. |

---

#### `pages/Lojista/LojistaLogin.jsx` — Autenticação do Lojista

| Função | O que faz |
|--------|-----------|
| `LojistaLogin()` | Página com duas abas: "Entrar" e "Criar conta". Gerencia o estado do formulário. |
| `handleLogin(e)` | `POST /auth/lojista/login` com `{ email, senha }`. Salva `lojistaToken` e `lojistaNome` no `localStorage`. Redireciona para `/lojista/admin`. |
| `handleCadastro(e)` | `POST /auth/lojista/criar` com `{ nome, email, senha, adminSecret }`. Após sucesso, faz login automático com as mesmas credenciais. |
| `trocarModo(novoModo)` | Alterna entre as abas login/cadastro limpando erros e o formulário. |
| `Campo(...)` *(subcomponente)* | Input reutilizável com label, tipo e hint opcional. |
| `Erro(...)` *(subcomponente)* | Parágrafo de erro com estilo visual de alerta. |

---

#### `pages/Lojista/LojistaAdmin.jsx` — Painel do Lojista

| Função | O que faz |
|--------|-----------|
| `LojistaAdmin()` | Painel principal. No `useEffect`, verifica se `lojistaToken` existe no `localStorage`; se não, redireciona para login. Faz `GET /auth/verify` para validar o token ainda ativo. Exibe status de integração Nuvemshop. |
| `sair()` | Remove `lojistaToken` e `lojistaNome` do `localStorage` e redireciona para `/lojista/login`. |
| `desconectarLoja()` | Remove `authToken` e `storeId` do `localStorage`, atualizando o estado local para exibir o botão de conectar loja novamente. |

---

#### `pages/Admin/Admin.jsx` — Área Admin (Legado)

| Função | O que faz |
|--------|-----------|
| `Admin()` | Versão simplificada do painel, mantida para compatibilidade. Exibe status da loja conectada. |
| `desconectar()` | Remove `authToken` e `storeId` do `localStorage` e recarrega a página. |

---

#### `services/api.js` — Camada HTTP do Frontend

| Função | Endpoint chamado | O que faz |
|--------|-----------------|-----------|
| `normalizeStoreCheckoutUrl(rawUrl)` | *(helper interno)* | Substitui `/checkout` por `/comprar/` na URL retornada, pois algumas lojas Nuvemshop retornam 404 em `/checkout`. |
| `clearAuthSession()` | *(helper interno)* | Remove `authToken` e `storeId` do `localStorage` quando a API retorna 401/403. |
| `buscarProdutos()` | `GET /api/products/:storeId` | Leitura autenticada (usa `authToken` + `storeId` do localStorage). Para o Admin. |
| `buscarProdutosPublicos(storeId?)` | `GET /api/public/products` | Leitura pública sem autenticação. Usada pela `Home.jsx`. |
| `gerarCheckoutPersonalizado({ productSlug, customizacao, storeId, nuvemshopProductId, contato })` | `POST /api/public/checkout-link` | Envia dados do produto e da personalização para o backend criar o pedido na Nuvemshop. Normaliza a URL de retorno. |
| `buscarProduto(id)` | `GET /api/products/:id` | Busca produto individual pelo ID. |
| `criarCarrinho(dadosCliente)` | `POST /api/cart` | Cria carrinho na Nuvemshop com dados do cliente. |
| `adicionarAoCarrinho(customerId, cartId, produtoData)` | `POST /api/cart/:customerId/:cartId/items` | Adiciona item ao carrinho existente. |
| `obterCarrinho(customerId, cartId)` | `GET /api/cart/:customerId/:cartId` | Busca estado atual do carrinho. |
| `removerDoCarrinho(customerId, cartId, itemId)` | `DELETE /api/cart/:customerId/:cartId/items/:itemId` | Remove item do carrinho. |
| `atualizarCarrinho(customerId, cartId, itemId, quantidade)` | `PUT /api/cart/:customerId/:cartId/items/:itemId` | Atualiza quantidade de um item no carrinho. |

---

#### `data/products.js` — Catálogo Local (Fallback)

| Elemento | O que faz |
|---------|-----------|
| `products` (array exportado) | Lista estática de 3 produtos com `id`, `nome`, `slug` e `imagem`. Usado como fallback pela `ProductPage` para resolver o nome do produto quando a API não é consultada diretamente. A fonte de verdade de produtos é a API Nuvemshop. |

---

### Diagrama de Dependências entre Arquivos

```
App.jsx
 ├── pages/Home/Home.jsx
 │    ├── services/api.js → buscarProdutosPublicos()
 │    └── components/ProductCard.jsx
 │
 ├── pages/ProductPage/productPage.jsx
 │    ├── services/api.js → gerarCheckoutPersonalizado()
 │    └── data/products.js (fallback de nomes)
 │
 ├── pages/AuthCallback/AuthCallback.jsx
 │    └── services/api.js (processa redirect do backend)
 │
 ├── pages/Lojista/LojistaLogin.jsx
 │    └── fetch direto → POST /auth/lojista/login
 │
 └── pages/Lojista/LojistaAdmin.jsx
      ├── fetch direto → GET /auth/verify
      └── components/OAuthButton.jsx → GET /auth/nuvemshop (backend)

Backend (Express):
 routes/auth.routes.js → authController.js → auth.service.js
                                            → store.model.js → database.js

 routes/productRoutes.js → productController.js → nuvemshopService.js
                                                 → store.model.js
                                                 → auth.service.js (busca token)

 middleware/auth.middleware.js → auth.service.js → verifyJWT()
```

---

*Relatório gerado com base na análise do código-fonte em `c:\Users\User\customGlass-northVision`*
