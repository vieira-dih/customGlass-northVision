// ======================================================
// Arquivo: routes/productRoutes.js
// ======================================================
// Rotas para gerenciar produtos da Nuvemshop
// TODAS REQUEREM: JWT válido no header
// ======================================================

import express from "express"
import * as ProductController from "../controllers/productController.js"
import { authenticateJWT, logRequest } from "../middleware/auth.middleware.js"

const router = express.Router()

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
