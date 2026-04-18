const API_URL = "http://localhost:3000/api"

// ============= PRODUTOS =============

export const buscarProdutos = async () => {
  try {
    // Obter storeId e token do localStorage
    const storeId = localStorage.getItem('storeId')
    const token = localStorage.getItem('authToken')
    
    if (!storeId) {
      throw new Error("Loja não conectada. Clique em 'Instalar aplicativo' para conectar.")
    }
    
    if (!token) {
      throw new Error("Token expirado. Clique em 'Instalar aplicativo' para reconectar.")
    }
    
    const response = await fetch(`${API_URL}/products/${storeId}`, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.mensagem || `Erro ${response.status} ao buscar produtos`)
    }
    
    const data = await response.json()
    
    // A API retorna { mensagem, produtos } - extrair o array de produtos
    return data.produtos || data
  } catch (error) {
    console.error("Erro na requisição:", error)
    throw error
  }
}

export const buscarProduto = async (id) => {
  try {
    const response = await fetch(`${API_URL}/products/${id}`)
    if (!response.ok) throw new Error("Erro ao buscar produto")
    return await response.json()
  } catch (error) {
    console.error("Erro na requisição:", error)
    throw error
  }
}

// ============= CARRINHO =============

export const criarCarrinho = async (dadosCliente) => {
  try {
    const response = await fetch(`${API_URL}/cart`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(dadosCliente)
    })
    
    if (!response.ok) throw new Error("Erro ao criar carrinho")
    return await response.json()
  } catch (error) {
    console.error("Erro ao criar carrinho:", error)
    throw error
  }
}

export const adicionarAoCarrinho = async (customerId, cartId, produtoData) => {
  try {
    const response = await fetch(`${API_URL}/cart/${customerId}/${cartId}/items`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(produtoData)
    })
    
    if (!response.ok) throw new Error("Erro ao adicionar ao carrinho")
    return await response.json()
  } catch (error) {
    console.error("Erro ao adicionar ao carrinho:", error)
    throw error
  }
}

export const obterCarrinho = async (customerId, cartId) => {
  try {
    const response = await fetch(`${API_URL}/cart/${customerId}/${cartId}`)
    if (!response.ok) throw new Error("Erro ao buscar carrinho")
    return await response.json()
  } catch (error) {
    console.error("Erro ao buscar carrinho:", error)
    throw error
  }
}

export const removerDoCarrinho = async (customerId, cartId, itemId) => {
  try {
    const response = await fetch(`${API_URL}/cart/${customerId}/${cartId}/items/${itemId}`, {
      method: "DELETE"
    })
    
    if (!response.ok) throw new Error("Erro ao remover do carrinho")
    return await response.json()
  } catch (error) {
    console.error("Erro ao remover do carrinho:", error)
    throw error
  }
}

export const atualizarCarrinho = async (customerId, cartId, itemId, quantidade) => {
  try {
    const response = await fetch(`${API_URL}/cart/${customerId}/${cartId}/items/${itemId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ quantity: quantidade })
    })
    
    if (!response.ok) throw new Error("Erro ao atualizar carrinho")
    return await response.json()
  } catch (error) {
    console.error("Erro ao atualizar carrinho:", error)
    throw error
  }
}
