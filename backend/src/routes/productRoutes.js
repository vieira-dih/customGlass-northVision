// ======================================================
// Arquivo: routes/productRoutes.js
// ======================================================
// Rotas para gerenciar produtos da Nuvemshop
// Possui rotas públicas e rotas protegidas por JWT
// ======================================================

import express from "express"
import * as ProductController from "../controllers/productController.js"
import { authenticateJWT, logRequest } from "../middleware/auth.middleware.js"

const router = express.Router()

// ======================================================
// ROTAS PÚBLICAS (Sem JWT)
// ======================================================

// Rota pública 1: vitrine de produtos
// GET /api/public/products?storeId=1
router.get("/public/products", ProductController.listarProdutosPublicos)

// Rota pública 2: gerar link para finalizar compra na loja
// POST /api/public/checkout-link
router.post("/public/checkout-link", ProductController.gerarCheckoutLinkPublico)

// ======================================================
// APLICAR MIDDLEWARE DE AUTENTICAÇÃO
// ======================================================
// Todas as rotas daqui em diante requerem JWT válido

router.use(authenticateJWT)
router.use(logRequest)

// ======================================================
// ROTAS DE PRODUTOS
// ======================================================

// Rota 1: Listar todos os produtos de uma loja
// GET /api/products/:storeId
// Retorna: Array de produtos
router.get("/products/:storeId", ProductController.listarProdutos)

// Rota 2: Buscar um produto específico
// GET /api/products/:storeId/:productId
// Retorna: Detalhes do produto
router.get("/products/:storeId/:productId", ProductController.obterProduto)

// ======================================================
// ROTAS DE CATEGORIAS
// ======================================================

// Rota 3: Listar categorias
// GET /api/categories/:storeId
// Retorna: Array de categorias
router.get("/categories/:storeId", ProductController.listarCategorias)

// ======================================================
// ROTAS DE INFORMAÇÕES DA LOJA
// ======================================================

// Rota 4: Obter informações da loja
// GET /api/store-info/:storeId
// Retorna: Nome, descrição, endereço, etc
router.get("/store-info/:storeId", ProductController.obterInfoLoja)

// ======================================================
// Exportar router
// ======================================================

export default router
