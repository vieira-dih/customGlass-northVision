import express from "express"                     // importa o framework Express (criar servidor)
import cors from "cors"                           // importa o CORS (libera acesso do front-end)
import productRoutes from "./routes/productRoutes.js" // importa as rotas de produtos

const app = express()                             // cria a aplicação (servidor)

app.use(cors())                                   // permite requisições de outros domínios (ex: React rodando em outra porta)
app.use(express.json())                           // permite receber dados em JSON no body das requisições

app.use("/api", productRoutes)                    // todas rotas começam com /api (ex: /api/products)

app.get("/", (req, res) => {                      // rota raiz para teste
  res.send("API rodando 🚀")                      // resposta simples para verificar se o servidor está online
})

app.listen(3000, () => {                          // inicia o servidor na porta 3000
  console.log("Servidor rodando na porta 3000")   // mostra mensagem no terminal quando subir
})