# Guia Comentado do Projeto

Este guia resume a funcao de cada arquivo principal para manutencao e apresentacao.

## Backend

- backend/src/server.js
  - Sobe servidor Express, configura CORS, middlewares globais e registra rotas.
- backend/src/config/database.js
  - Configura pool PostgreSQL e helper query().
- backend/src/routes/auth.routes.js
  - Rotas OAuth e validacao de autenticacao.
- backend/src/routes/productRoutes.js
  - Rotas publicas de vitrine/checkout e rotas protegidas de produtos.
- backend/src/controllers/authController.js
  - Fluxo OAuth: inicio, callback, validacao de token e gestao de lojas.
- backend/src/controllers/productController.js
  - Busca produtos/categorias e gera URL de checkout para o frontend.
- backend/src/services/auth.service.js
  - Regras de OAuth, JWT e validacao de token com a API da Nuvemshop.
- backend/src/services/nuvemshopService.js
  - Cliente HTTP da Nuvemshop para produtos, loja e categorias.
- backend/src/middleware/auth.middleware.js
  - Valida JWT nas rotas protegidas.
- backend/src/models/store.model.js
  - Queries SQL da tabela stores.
- backend/src/database/schema.sql
  - Estrutura de tabelas e indices do banco.
- backend/.env
  - Variaveis de ambiente (OAuth, DB, JWT, URL publica da loja).

## Frontend

- frontend/src/main.jsx
  - Ponto de entrada React (renderizacao do App no root).
- frontend/src/App.jsx
  - Definicao de rotas da aplicacao.
- frontend/src/services/api.js
  - Todas as chamadas HTTP do frontend para backend.
- frontend/src/pages/Home/Home.jsx
  - Carrega vitrine publica e renderiza cards de produtos.
- frontend/src/pages/ProductPage/productPage.jsx
  - Personalizacao do produto e redirecionamento para checkout.
- frontend/src/pages/AuthCallback/AuthCallback.jsx
  - Recebe token da integracao OAuth e salva no localStorage.
- frontend/src/components/Header.jsx
  - Cabecalho com navegacao e botao da area do lojista.
- frontend/src/components/OAuthButton.jsx
  - Aciona fluxo OAuth no backend.
- frontend/src/components/ProductCard.jsx
  - Card reutilizavel de produto.
- frontend/src/components/Footer.jsx
  - Rodape do site.
- frontend/src/data/products.js
  - Dados locais de apoio para navegacao/personalizacao.
- frontend/src/styles/*.css
  - Estilos globais e estilos por pagina/componente.

## Fluxo para explicar ao professor

1. Usuario acessa Home e ve produtos pela rota publica.
2. Ao abrir um produto, escolhe personalizacao no ProductPage.
3. Botao Finalizar chama API publica para gerar URL de checkout.
4. Backend monta URL da loja e devolve ao frontend.
5. Frontend redireciona para Nuvemshop para concluir compra.

## Onde mexer para alteracoes futuras

- Alterar URL/porta backend frontend: backend/.env e frontend/src/services/api.js
- Alterar fluxo OAuth: backend/src/controllers/authController.js e backend/src/services/auth.service.js
- Alterar regras do checkout: backend/src/controllers/productController.js
- Alterar layout/estilo: frontend/src/pages/* e frontend/src/styles/*
