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

export const getProducts = async () => {
  const response = await api.get("/products")                 // faz requisição GET para /products (lista produtos)
  return response.data                                        // retorna apenas os dados da resposta (sem meta info)
}