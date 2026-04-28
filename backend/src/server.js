// ======================================================
// Arquivo: server.js
// ======================================================
// Arquivo principal da aplicação Express
// Configuração de server, middlewares e rotas
// ======================================================

import express from "express"
import cors from "cors"
import dotenv from "dotenv"

// Importar configuração do banco de dados
import { testConnection } from "./config/database.js"

// Importar rotas
import productRoutes from "./routes/productRoutes.js"
import authRoutes from "./routes/auth.routes.js"

// Carregar variáveis de ambiente
dotenv.config()

// ======================================================
// CRIAR APLICAÇÃO EXPRESS
// ======================================================

const app = express()
const PORT = process.env.PORT || 3000
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173"

// ======================================================
// CONFIGURAR MIDDLEWARES GLOBAIS
// ======================================================

// Middleware 1: CORS
// Permite requisições do frontend
app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true,
  })
)

// Middleware 2: Parse JSON
// Permite receber dados em JSON no body
app.use(express.json())

// Middleware 3: Parse URL-encoded
// Permite receber dados de formulários HTML
app.use(express.urlencoded({ extended: true }))

// Middleware 4: Log de requisições (opcional)
// Imprime método + path de cada requisição
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`)
  next()
})

// ======================================================
// DEFINIR ROTAS
// ======================================================

// Rota de saúde (health check)
// GET /
// Retorna: Status do servidor
app.get("/", (req, res) => {
  res.json({
    mensagem: "✅ API Custom Glass North Vision rodando",
    versao: "2.0.0",
    status: "OAuth 2.0 com PostgreSQL",
  })
})

// Rotas de Autenticação OAuth
// GET /auth/nuvemshop
// GET /auth/callback
// GET /auth/verify
// etc...
app.use("/auth", authRoutes)

// Rotas de Produtos (Protegidas por JWT)
// GET /api/products/:storeId
// GET /api/categories/:storeId
// etc...
app.use("/api", productRoutes)

// ======================================================
// TRATAMENTO DE ERROS 404
// ======================================================

app.use((req, res) => {
  res.status(404).json({
    erro: "Rota não encontrada",
    path: req.path,
    metodo: req.method,
  })
})

// ======================================================
// INICIAR SERVIDOR
// ======================================================

const startServer = async () => {
  try {
    console.log("🔧 Iniciando servidor...")
    
    // Testar conexão com banco de dados
    console.log("🔌 Testando conexão com PostgreSQL...")
    const dbConnected = await testConnection()
    
    if (!dbConnected) {
      console.error("❌ Falha ao conectar com banco de dados")
      console.error("⚠️ Certifique-se de que PostgreSQL está rodando")
      console.error("⚠️ Verifique credenciais em .env")
      process.exit(1)
    }
    
    // Iniciar servidor
    app.listen(PORT, () => {
      console.log("=" . repeat(60))
      console.log("✅ Servidor rodando com sucesso!")
      console.log("=" . repeat(60))
      console.log(`🚀 Porta: ${PORT}`)
      console.log(`🔗 URL: http://localhost:${PORT}`)
      console.log(`📚 Documentação: http://localhost:${PORT}/`)
      console.log("")
      console.log("📍 Rotas principais:")
      console.log(`   - GET  /                        (Health check)`)
      console.log(`   - GET  /auth/nuvemshop          (Iniciar OAuth)`)
      console.log(`   - GET  /auth/callback           (Callback OAuth)`)
      console.log(`   - GET  /auth/verify             (Verificar JWT)`)
      console.log(`   - GET  /auth/stores             (Listar lojas)`)
      console.log(`   - GET  /api/products/:storeId   (Listar produtos)`)
      console.log(`   - GET  /api/categories/:storeId (Listar categorias)`)
      console.log("")
      console.log("=" . repeat(60))
    })
  } catch (error) {
    console.error("❌ Erro ao iniciar servidor:", error)
    process.exit(1)
  }
}

// Executar função de inicialização
startServer()

// ======================================================
// TRATAMENTO DE ERROS NÃO CAPTURADOS
// ======================================================

process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ Promise rejeitada não tratada:", reason)
})

process.on("uncaughtException", (error) => {
  console.error("❌ Exceção não capturada:", error)
  process.exit(1)
})

// ======================================================
// Exportar app para testes (se necessário)
// ======================================================

export default app
