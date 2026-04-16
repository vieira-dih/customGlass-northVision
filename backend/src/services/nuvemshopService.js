// ======================================================
// Arquivo: services/nuvemshopService.js
// ======================================================
// Integração com API Nuvemshop para operações de negócio
// 
// DIFERENÇA COM VERSÃO ANTERIOR:
// - Antes: Token vinha do .env (estático, uma loja)
// - Agora: Token vem do banco (dinâmico, múltiplas lojas)
// ======================================================

import axios from "axios"
import dotenv from "dotenv"
import * as AuthService from "./auth.service.js"
import * as StoreModel from "../models/store.model.js"

dotenv.config()

// ======================================================
// CONSTANTE: URL Base da API Nuvemshop
// ======================================================
const NUVEMSHOP_API_BASE = "https://api.nuvemshop.com.br/v1"

// ======================================================
// HELPER: Criar cliente Axios para uma loja específica
// ======================================================
// Configura headers com o token da loja automaticamente

const createNuvemshopClient = (storeId, accessToken) => {
  return axios.create({
    // URL base inclui o store_id
    baseURL: `${NUVEMSHOP_API_BASE}/${storeId}`,
    
    // Headers obrigatórios da Nuvemshop
    headers: {
      // Token de acesso OAuth
      "Authorization": `bearer ${accessToken}`,
      
      // Identificar a aplicação (obrigatório)
      "User-Agent": "CustomGlassNorthVision (integrations@customglass.com)",
      
      // Tipo de conteúdo
      "Content-Type": "application/json",
    },
  })
}

// ======================================================
// FUNÇÃO: Buscar Produtos de uma Loja
// ======================================================
// Agora recebe storeId em vez de usar .env

export const getProducts = async (storeId) => {
  try {
    console.log(`📦 Buscando produtos da loja ${storeId}...`)
    
    // Passo 1: Buscar access token do banco
    const accessToken = await AuthService.getAccessTokenForStore(storeId)
    console.log(`🔑 Token recuperado (primeiros 20 chars):`, accessToken.substring(0, 20) + "...")
    
    // Passo 2: Obter store_id da Nuvemshop
    const store = await StoreModel.getStoreById(storeId)
    console.log(`🏪 Store info:`, { id: store.id, nuvemshop_store_id: store.nuvemshop_store_id })
    
    // Passo 3: Criar cliente Axios com token
    const client = createNuvemshopClient(store.nuvemshop_store_id, accessToken)
    
    // Passo 4: Fazer requisição GET /products com parametrizações
    try {
      const response = await client.get("/products?limit=100")
      console.log(`✅ ${response.data.length} produto(s) encontrado(s)`)
      return response.data
    } catch (innerError) {
      // Se falhar com query params, tenta sem eles
      console.log("⚠️ Tentando sem parametrizações...")
      const response = await client.get("/products")
      console.log(`✅ ${response.data.length} produto(s) encontrado(s)`)
      return response.data
    }
  } catch (error) {
    console.error("❌ Erro ao buscar produtos:")
    console.error("   Status:", error.response?.status)
    console.error("   Dados:", error.response?.data)
    console.error("   Mensagem:", error.message)
    console.error("   Config:", {
      baseURL: error.config?.baseURL,
      url: error.config?.url,
      method: error.config?.method,
      headers: error.config?.headers,
    })
    throw error
  }
}

// ======================================================
// FUNÇÃO: Buscar um Produto Específico
// ======================================================
// Retorna informações detalhadas de um produto

export const getProductById = async (storeId, productId) => {
  try {
    console.log(`🔍 Buscando produto ${productId} da loja ${storeId}...`)
    
    // Buscar access token
    const accessToken = await AuthService.getAccessTokenForStore(storeId)
    const store = await StoreModel.getStoreById(storeId)
    
    // Criar cliente e fazer requisição
    const client = createNuvemshopClient(store.nuvemshop_store_id, accessToken)
    const response = await client.get(`/products/${productId}`)
    
    console.log(`✅ Produto encontrado: ${response.data.name}`)
    
    return response.data
  } catch (error) {
    console.error("❌ Erro ao buscar produto:", error.response?.data || error.message)
    throw error
  }
}

// ======================================================
// FUNÇÃO: Criar Variant de Produto (Cores, Tamanhos, etc)
// ======================================================
// Útil para os óculos com diferentes lentes

export const createProductVariant = async (storeId, productId, variantData) => {
  try {
    console.log(`➕ Criando variant para produto ${productId}...`)
    
    // Buscar access token
    const accessToken = await AuthService.getAccessTokenForStore(storeId)
    const store = await StoreModel.getStoreById(storeId)
    
    // Criar cliente e fazer requisição POST
    const client = createNuvemshopClient(store.nuvemshop_store_id, accessToken)
    const response = await client.post(`/products/${productId}/variants`, variantData)
    
    console.log(`✅ Variant criada: ${response.data.id}`)
    
    return response.data
  } catch (error) {
    console.error("❌ Erro ao criar variant:", error.response?.data || error.message)
    throw error
  }
}

// ======================================================
// FUNÇÃO: Buscar Categorias
// ======================================================
// Retorna todas as categorias de produtos

export const getCategories = async (storeId) => {
  try {
    console.log(`📂 Buscando categorias da loja ${storeId}...`)
    
    const accessToken = await AuthService.getAccessTokenForStore(storeId)
    const store = await StoreModel.getStoreById(storeId)
    
    const client = createNuvemshopClient(store.nuvemshop_store_id, accessToken)
    const response = await client.get("/categories")
    
    console.log(`✅ ${response.data.length} categoria(s) encontrada(s)`)
    
    return response.data
  } catch (error) {
    console.error("❌ Erro ao buscar categorias:", error.response?.data || error.message)
    throw error
  }
}

// ======================================================
// FUNÇÃO: Buscar Cliente (Customer) pelo Email
// ======================================================
// Verifica se um cliente já existe

export const getCustomerByEmail = async (storeId, email) => {
  try {
    console.log(`🔍 Buscando cliente com email ${email}...`)
    
    const accessToken = await AuthService.getAccessTokenForStore(storeId)
    const store = await StoreModel.getStoreById(storeId)
    
    const client = createNuvemshopClient(store.nuvemshop_store_id, accessToken)
    
    // Buscar com query parameter
    const response = await client.get("/customers", {
      params: {
        email: email,
      },
    })
    
    if (response.data.length > 0) {
      console.log(`✅ Cliente encontrado: ${response.data[0].name}`)
      return response.data[0]
    }
    
    console.log("⚠️ Cliente não encontrado")
    return null
  } catch (error) {
    console.error("❌ Erro ao buscar cliente:", error.response?.data || error.message)
    throw error
  }
}

// ======================================================
// FUNÇÃO: Criar Cliente (Customer)
// ======================================================
// Necessário para fazer compras/carrinho

export const createCustomer = async (storeId, customerData) => {
  try {
    console.log(`👤 Criando cliente ${customerData.email}...`)
    
    const accessToken = await AuthService.getAccessTokenForStore(storeId)
    const store = await StoreModel.getStoreById(storeId)
    
    const client = createNuvemshopClient(store.nuvemshop_store_id, accessToken)
    const response = await client.post("/customers", customerData)
    
    console.log(`✅ Cliente criado: ID ${response.data.id}`)
    
    return response.data
  } catch (error) {
    console.error("❌ Erro ao criar cliente:", error.response?.data || error.message)
    throw error
  }
}

// ======================================================
// FUNÇÃO: Buscar Todos os Clientes
// ======================================================
// Paginated, retorna com limite

export const getAllCustomers = async (storeId, limit = 50, page = 1) => {
  try {
    console.log(`👥 Buscando clientes (página ${page})...`)
    
    const accessToken = await AuthService.getAccessTokenForStore(storeId)
    const store = await StoreModel.getStoreById(storeId)
    
    const client = createNuvemshopClient(store.nuvemshop_store_id, accessToken)
    const response = await client.get("/customers", {
      params: {
        limit,
        page,
      },
    })
    
    console.log(`✅ ${response.data.length} cliente(s) encontrado(s)`)
    
    return response.data
  } catch (error) {
    console.error("❌ Erro ao buscar clientes:", error.response?.data || error.message)
    throw error
  }
}

// ======================================================
// FUNÇÃO: Obter Informações da Loja
// ======================================================
// Nome, descrição, endereço, etc

export const getStoreInfo = async (storeId) => {
  try {
    console.log(`ℹ️ Buscando informações da loja ${storeId}...`)
    
    const accessToken = await AuthService.getAccessTokenForStore(storeId)
    const store = await StoreModel.getStoreById(storeId)
    
    const client = createNuvemshopClient(store.nuvemshop_store_id, accessToken)
    const response = await client.get("/store")
    
    console.log(`✅ Loja: ${response.data.name}`)
    
    return response.data
  } catch (error) {
    console.error("❌ Erro ao buscar info da loja:", error.response?.data || error.message)
    throw error
  }
}
