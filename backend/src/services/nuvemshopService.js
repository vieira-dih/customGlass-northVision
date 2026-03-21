import axios from "axios"                                     // importa o axios (faz requisições HTTP)
import dotenv from "dotenv"                                   // importa dotenv (lê variáveis do .env)

dotenv.config()                                               // ativa o uso do arquivo .env

const api = axios.create({
  baseURL: `https://api.nuvemshop.com.br/v1/${process.env.NUVEMSHOP_STORE_ID}`, // define a URL base da API com o ID da loja
  headers: {
    "Authentication": `bearer ${process.env.NUVEMSHOP_TOKEN}`, // envia o token de acesso para autenticação
    "User-Agent": "northvision (seuemail@email.com)",          // identifica sua aplicação para a API
    "Content-Type": "application/json"                         // define que os dados enviados/recebidos são em JSON
  }
})

// ============= PRODUTOS =============

export const getProducts = async () => {
  const response = await api.get("/products")                 // faz requisição GET para /products (lista produtos)
  return response.data                                        // retorna apenas os dados da resposta (sem meta info)
}

export const getProductById = async (productId) => {
  const response = await api.get(`/products/${productId}`)    // busca um produto específico pelo ID
  return response.data
}

// ============= CARRINHO =============

export const createCart = async (customerData) => {
  try {
    // Cria ou obtém um cliente (customer)
    const customerResponse = await api.post("/customers", {
      name: customerData.name || "Cliente",
      email: customerData.email || "cliente@email.com",
      identification: customerData.cpf || "",
      phone: customerData.phone || ""
    })
    
    const customerId = customerResponse.data.id
    
    // Cria um novo carrinho para o cliente
    const cartResponse = await api.post(`/customers/${customerId}/carts`, {})
    
    return {
      customerId,
      cartId: cartResponse.data.id,
      cart: cartResponse.data
    }
  } catch (error) {
    console.error("Erro ao criar carrinho:", error.response?.data || error.message)
    throw error
  }
}

export const addProductToCart = async (customerId, cartId, productData) => {
  try {
    const response = await api.post(`/customers/${customerId}/carts/${cartId}/items`, {
      product_id: productData.product_id,
      quantity: productData.quantity || 1,
      variant_id: productData.variant_id || null  // para produtos com variações
    })
    return response.data
  } catch (error) {
    console.error("Erro ao adicionar produto ao carrinho:", error.response?.data || error.message)
    throw error
  }
}

export const getCart = async (customerId, cartId) => {
  try {
    const response = await api.get(`/customers/${customerId}/carts/${cartId}`)
    return response.data
  } catch (error) {
    console.error("Erro ao buscar carrinho:", error.response?.data || error.message)
    throw error
  }
}

export const removeProductFromCart = async (customerId, cartId, itemId) => {
  try {
    const response = await api.delete(`/customers/${customerId}/carts/${cartId}/items/${itemId}`)
    return response.data
  } catch (error) {
    console.error("Erro ao remover produto do carrinho:", error.response?.data || error.message)
    throw error
  }
}

export const updateCartItem = async (customerId, cartId, itemId, quantity) => {
  try {
    const response = await api.put(`/customers/${customerId}/carts/${cartId}/items/${itemId}`, {
      quantity
    })
    return response.data
  } catch (error) {
    console.error("Erro ao atualizar quantidade:", error.response?.data || error.message)
    throw error
  }
}