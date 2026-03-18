import express from "express"                                // importa o framework Express
import { listarProdutos } from "../controllers/productController.js" // importa a função que busca os produtos

const router = express.Router()                              // cria um "mini servidor" de rotas

router.get("/products", listarProdutos)                      // quando acessar GET /products, executa listarProdutos

export default router                                        // exporta as rotas para usar no server.js