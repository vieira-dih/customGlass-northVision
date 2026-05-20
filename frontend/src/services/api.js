// ======================================================
// Arquivo: services/api.js
// ======================================================
// Camada unica de comunicacao HTTP do frontend com o backend.
// Organizacao:
// 1) Produtos protegidos (JWT)
// 2) Produtos publicos
// 3) Checkout personalizado
// 4) Operacoes de carrinho
// ======================================================

const API_URL = "http://localhost:3000/api"

const normalizeStoreCheckoutUrl = (rawUrl) => {
  if (!rawUrl) return rawUrl

  try {
    const url = new URL(rawUrl)

    // Em algumas lojas Nuvemshop, /checkout retorna 404.
    // O caminho válido é /comprar/.
    if (url.pathname === "/checkout") {
      url.pathname = "/comprar/"
    }

    return url.toString()
  } catch {
    return rawUrl
  }
}

const clearAuthSession = () => {
  // Limpa credenciais locais quando o backend informar sessao invalida
  localStorage.removeItem("authToken")
  localStorage.removeItem("storeId")
}

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
      if (response.status === 401 || response.status === 403) {
        clearAuthSession()
        throw new Error("Sessão expirada ou inválida. Clique em 'Conectar loja' para autenticar novamente.")
      }

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

export const buscarProdutosPublicos = async (storeId = null) => {
  try {
    const query = storeId ? `?storeId=${storeId}` : ""
    const response = await fetch(`${API_URL}/public/products${query}`)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.mensagem || `Erro ${response.status} ao buscar produtos`)
    }

    const data = await response.json()
    return data.produtos || []
  } catch (error) {
    console.error("Erro na requisição pública de produtos:", error)
    throw error
  }
}

export const gerarCheckoutPersonalizado = async ({ productSlug, customizacao, storeId = null, nuvemshopProductId = null, contato = null }) => {
  try {
    const response = await fetch(`${API_URL}/public/checkout-link`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        productSlug,
        nuvemshopProductId,
        customizacao,
        storeId,
        contato,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.mensagem || `Erro ${response.status} ao gerar checkout`)
    }

    const data = await response.json()

    if (data?.checkoutUrl) {
      // Normaliza fallback de lojas que nao possuem /checkout
      data.checkoutUrl = normalizeStoreCheckoutUrl(data.checkoutUrl)
    }

    return data
  } catch (error) {
    console.error("Erro ao gerar checkout personalizado:", error)
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
