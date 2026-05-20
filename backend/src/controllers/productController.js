// ======================================================
// Arquivo: controllers/productController.js
// ======================================================
// Controller para gerenciar produtos da loja Nuvemshop
// REFATORADO PARA USAR TOKEN DO BANCO (não do .env)
// ======================================================

import * as NuvemshopService from "../services/nuvemshopService.js"
import * as StoreModel from "../models/store.model.js"

const resolvePublicStoreId = async (requestedStoreId) => {
  if (requestedStoreId && !Number.isNaN(Number(requestedStoreId))) {
    return Number(requestedStoreId)
  }

  if (process.env.PUBLIC_STORE_ID && !Number.isNaN(Number(process.env.PUBLIC_STORE_ID))) {
    return Number(process.env.PUBLIC_STORE_ID)
  }

  const latestStore = await StoreModel.getLatestStore()
  if (!latestStore) {
    throw new Error("Nenhuma loja integrada encontrada")
  }

  return latestStore.id
}

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
// FUNÇÃO: Listar Produtos para vitrine pública
// ======================================================
// GET /api/public/products?storeId=1
// Retorna: Array de produtos sem exigir JWT

export const listarProdutosPublicos = async (req, res) => {
  try {
    const { storeId } = req.query
    const internalStoreId = await resolvePublicStoreId(storeId)

    console.log(`🌐 Controller: Buscando produtos públicos para loja ${internalStoreId}`)

    const produtos = await NuvemshopService.getProducts(internalStoreId)

    res.json({
      mensagem: `${produtos.length} produto(s) encontrado(s)`,
      storeId: internalStoreId,
      produtos,
    })
  } catch (error) {
    console.error("❌ Erro ao listar produtos públicos:", error.message)

    res.status(500).json({
      erro: "Erro ao buscar produtos públicos",
      mensagem: error.message,
    })
  }
}

// ======================================================
// FUNÇÃO: Gerar link de checkout da loja
// ======================================================
// POST /api/public/checkout-link
// Body: { nuvemshopProductId, customizacao, storeId? }
// Cria um pedido rascunho na Nuvemshop com a armação selecionada
// e as lentes escolhidas como observação do pedido.

export const gerarCheckoutLinkPublico = async (req, res) => {
  try {
    const { customizacao, storeId, nuvemshopProductId, contato } = req.body || {}

    if (!nuvemshopProductId) {
      return res.status(400).json({
        erro: "Parâmetro obrigatório",
        mensagem: "Informe nuvemshopProductId (ID do produto na Nuvemshop)",
      })
    }

    const internalStoreId = await resolvePublicStoreId(storeId)

    // Montar texto de observação com todas as escolhas do cliente
    const linhas = []
    if (customizacao?.tipoArmacao) linhas.push(`Tipo de armação: ${customizacao.tipoArmacao}`)
    if (customizacao?.corArmacao)  linhas.push(`Cor da armação: ${customizacao.corArmacao}`)
    if (customizacao?.lentes?.length > 0) {
      linhas.push(`Lentes escolhidas: ${customizacao.lentes.join(", ")}`)
    }
    const observacoes = linhas.join(" | ")

    console.log(`📝 Observações do pedido: "${observacoes}"`)

    const { checkoutUrl } = await NuvemshopService.criarPedidoPersonalizado(
      internalStoreId,
      nuvemshopProductId,
      observacoes,
      contato,
      customizacao
    )

    res.json({
      mensagem: "URL de checkout gerada com sucesso",
      storeId: internalStoreId,
      checkoutUrl,
    })
  } catch (error) {
    console.error("❌ Erro ao gerar checkout personalizado:", error.message)

    res.status(500).json({
      erro: "Erro ao criar pedido na loja",
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
