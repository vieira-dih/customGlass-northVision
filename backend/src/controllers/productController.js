import { getProducts } from "../services/nuvemshopService.js"   // importa a função que busca produtos na API

export const listarProdutos = async (req, res) => {              // cria função assíncrona que será usada na rota
  try {
    const produtos = await getProducts()                         // chama o service e espera os produtos retornarem
    res.json(produtos)                                           // envia os produtos como resposta em JSON
  } catch (error) {
    console.log(error.response?.data || error.message)           // mostra erro detalhado no terminal (API ou código)
    res.status(500).json({ erro: "Erro ao buscar produtos" })    // envia erro padrão para o front-end
  }
}