// ======================================================
// Arquivo: controllers/productController.js
// ======================================================
// Controller para gerenciar produtos da loja Nuvemshop
// REFATORADO PARA USAR TOKEN DO BANCO (não do .env)
// ======================================================

import * as NuvemshopService from "../services/nuvemshopService.js"

// ======================================================
// FUNÇÃO: Listar Produtos da Loja
// ======================================================
// GET /api/products/:storeId
// Retorna: Array de produtos da loja

export const listarProdutos = async (req, res) => {
  try {
    // Pegar storeId dos parâmetros da URL
    const { storeId } = req.params
    
    console.log(`📦 Controller: Buscando produtos para loja ${storeId}`)
    
    // Validar storeId
    if (!storeId || isNaN(storeId)) {
      return res.status(400).json({
        erro: "ID da loja inválido",
      })
    }
    
    // Chamar serviço para buscar produtos
    // O serviço cuida de buscar o token do banco
    const produtos = await NuvemshopService.getProducts(storeId)
    
    // Retornar produtos
    res.json({
      mensagem: `${produtos.length} produto(s) encontrado(s)`,
      produtos,
    })
  } catch (error) {
    console.error("❌ Erro ao listar produtos:", error.message)
    
    res.status(500).json({
      erro: "Erro ao buscar produtos",
      mensagem: error.message,
    })
  }
}

// ======================================================
// FUNÇÃO: Buscar um Produto Específico
// ======================================================
// GET /api/products/:storeId/:productId
// Retorna: Detalhes completos do produto

export const obterProduto = async (req, res) => {
  try {
    const { storeId, productId } = req.params
    
    console.log(`🔍 Controller: Buscando produto ${productId} da loja ${storeId}`)
    
    // Validações
    if (!storeId || !productId || isNaN(storeId) || isNaN(productId)) {
      return res.status(400).json({
        erro: "IDs inválidos",
      })
    }
    
    // Buscar produto via serviço
    const produto = await NuvemshopService.getProductById(storeId, productId)
    
    res.json({
      mensagem: "Produto encontrado",
      produto,
    })
  } catch (error) {
    console.error("❌ Erro ao buscar produto:", error.message)
    
    res.status(500).json({
      erro: "Erro ao buscar produto",
      mensagem: error.message,
    })
  }
}

// ======================================================
// FUNÇÃO: Buscar Categorias
// ======================================================
// GET /api/categories/:storeId
// Retorna: Array de categorias

export const listarCategorias = async (req, res) => {
  try {
    const { storeId } = req.params
    
    console.log(`📂 Controller: Buscando categorias da loja ${storeId}`)
    
    if (!storeId || isNaN(storeId)) {
      return res.status(400).json({
        erro: "ID da loja inválido",
      })
    }
    
    // Buscar categorias
    const categorias = await NuvemshopService.getCategories(storeId)
    
    res.json({
      mensagem: `${categorias.length} categoria(s) encontrada(s)`,
      categorias,
    })
  } catch (error) {
    console.error("❌ Erro ao listar categorias:", error.message)
    
    res.status(500).json({
      erro: "Erro ao buscar categorias",
      mensagem: error.message,
    })
  }
}

// ======================================================
// FUNÇÃO: Buscar Informações da Loja
// ======================================================
// GET /api/store-info/:storeId
// Retorna: Nome, descrição, etc da loja

export const obterInfoLoja = async (req, res) => {
  try {
    const { storeId } = req.params
    
    console.log(`ℹ️ Controller: Buscando info da loja ${storeId}`)
    
    if (!storeId || isNaN(storeId)) {
      return res.status(400).json({
        erro: "ID da loja inválido",
      })
    }
    
    // Buscar informações
    const info = await NuvemshopService.getStoreInfo(storeId)
    
    res.json({
      mensagem: "Informações da loja",
      loja: info,
    })
  } catch (error) {
    console.error("❌ Erro ao buscar info loja:", error.message)
    
    res.status(500).json({
      erro: "Erro ao buscar informações da loja",
      mensagem: error.message,
    })
  }
}
