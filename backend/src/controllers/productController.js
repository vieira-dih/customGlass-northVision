import { 
  getProducts,
  getProductById,
  createCart,
  addProductToCart,
  getCart,
  removeProductFromCart,
  updateCartItem
} from "../services/nuvemshopService.js"

// ============= PRODUTOS =============

export const listarProdutos = async (req, res) => {
  try {
    const produtos = await getProducts()
    res.json(produtos)
  } catch (error) {
    console.log(error.response?.data || error.message)
    res.status(500).json({ erro: "Erro ao buscar produtos" })
  }
}

export const obterProduto = async (req, res) => {
  try {
    const { id } = req.params
    const produto = await getProductById(id)
    res.json(produto)
  } catch (error) {
    console.log(error.response?.data || error.message)
    res.status(500).json({ erro: "Erro ao buscar produto" })
  }
}

// ============= CARRINHO =============

export const criarCarrinho = async (req, res) => {
  try {
    const { name, email, cpf, phone } = req.body
    
    const carrinho = await createCart({
      name,
      email,
      cpf,
      phone
    })
    
    res.status(201).json({
      mensagem: "Carrinho criado com sucesso",
      customerId: carrinho.customerId,
      cartId: carrinho.cartId,
      cart: carrinho.cart
    })
  } catch (error) {
    console.log(error.response?.data || error.message)
    res.status(500).json({ erro: "Erro ao criar carrinho" })
  }
}

export const adicionarAoCarrinho = async (req, res) => {
  try {
    const { customerId, cartId } = req.params
    const { product_id, quantity, variant_id } = req.body
    
    const item = await addProductToCart(customerId, cartId, {
      product_id,
      quantity,
      variant_id
    })
    
    res.status(201).json({
      mensagem: "Produto adicionado ao carrinho",
      item
    })
  } catch (error) {
    console.log(error.response?.data || error.message)
    res.status(500).json({ erro: "Erro ao adicionar produto ao carrinho" })
  }
}

export const obterCarrinho = async (req, res) => {
  try {
    const { customerId, cartId } = req.params
    
    const carrinho = await getCart(customerId, cartId)
    res.json(carrinho)
  } catch (error) {
    console.log(error.response?.data || error.message)
    res.status(500).json({ erro: "Erro ao buscar carrinho" })
  }
}

export const removerDoCarrinho = async (req, res) => {
  try {
    const { customerId, cartId, itemId } = req.params
    
    await removeProductFromCart(customerId, cartId, itemId)
    res.json({ mensagem: "Produto removido do carrinho com sucesso" })
  } catch (error) {
    console.log(error.response?.data || error.message)
    res.status(500).json({ erro: "Erro ao remover produto do carrinho" })
  }
}

export const atualizarCarrinho = async (req, res) => {
  try {
    const { customerId, cartId, itemId } = req.params
    const { quantity } = req.body
    
    const item = await updateCartItem(customerId, cartId, itemId, quantity)
    res.json({
      mensagem: "Quantidade atualizada",
      item
    })
  } catch (error) {
    console.log(error.response?.data || error.message)
    res.status(500).json({ erro: "Erro ao atualizar quantidade" })
  }
}