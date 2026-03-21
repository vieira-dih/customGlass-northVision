import express from "express"
import { 
  listarProdutos,
  obterProduto,
  criarCarrinho,
  adicionarAoCarrinho,
  obterCarrinho,
  removerDoCarrinho,
  atualizarCarrinho
} from "../controllers/productController.js"

const router = express.Router()

// ============= ROTAS DE PRODUTOS =============
router.get("/products", listarProdutos)                           // GET /api/products - lista todos os produtos
router.get("/products/:id", obterProduto)                         // GET /api/products/:id - obtém um produto específico

// ============= ROTAS DE CARRINHO =============
router.post("/cart", criarCarrinho)                               // POST /api/cart - cria novo carrinho e cliente
router.post("/cart/:customerId/:cartId/items", adicionarAoCarrinho)  // POST /api/cart/:customerId/:cartId/items - adiciona item
router.get("/cart/:customerId/:cartId", obterCarrinho)            // GET /api/cart/:customerId/:cartId - obtém carrinho
router.delete("/cart/:customerId/:cartId/items/:itemId", removerDoCarrinho)  // DELETE - remove item
router.put("/cart/:customerId/:cartId/items/:itemId", atualizarCarrinho)    // PUT - atualiza quantidade

export default router