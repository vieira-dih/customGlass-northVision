// ======================================================
// Arquivo: config/database.js
// ======================================================
// Configuração de conexão com PostgreSQL
// Exporta um pool de conexões que reutiliza conexões
// =======================================================

import pkg from "pg"
import dotenv from "dotenv"

// Carregar variáveis de ambiente do arquivo .env
dotenv.config()

const { Pool } = pkg

// ======================================================
// CONFIGURAÇÃO DO POOL DE CONEXÕES
// ======================================================
// Pool permite reutilizar conexões e melhorar performance
// Sem pool, cada query criaria uma nova conexão

const pool = new Pool({
  // Host do servidor PostgreSQL
  host: process.env.DB_HOST || "localhost",
  
  // Porta do PostgreSQL (padrão: 5432)
  port: process.env.DB_PORT || 5432,
  
  // Nome do banco de dados
  database: process.env.DB_NAME || "custom_glass_db",
  
  // Usuário do PostgreSQL
  user: process.env.DB_USER || "postgres",
  
  // Senha do usuário
  password: process.env.DB_PASSWORD || "postgres",
  
  // Máximo de conexões simultâneas no pool
  max: 20,
  
  // Tempo mínimo que uma conexão fica ociosa antes de fechar (ms)
  idleTimeoutMillis: 30000,
  
  // Timeout para conectar ao servidor (ms)
  connectionTimeoutMillis: 2000,
})

// ======================================================
// EVENT LISTENERS - Monitorar estado do pool
// ======================================================

// Quando uma nova conexão é estabelecida
pool.on("connect", () => {
  console.log("✅ Nova conexão PostgreSQL estabelecida")
})

// Se houver erro na conexão
pool.on("error", (err) => {
  console.error("❌ Erro no pool de conexões PostgreSQL:", err)
  process.exit(-1)
})

// ======================================================
// FUNÇÃO: Executar Query
// ======================================================
// Wrapper para executar queries no banco
// Trata erros e logging automático

export const query = async (text, params = []) => {
  const start = Date.now()
  
  try {
    // Executar query com parâmetros (preparados contra SQL injection)
    const result = await pool.query(text, params)
    
    // Log com tempo de execução (útil para performance)
    const duration = Date.now() - start
    console.log(`📊 Query executada em ${duration}ms`)
    
    return result
  } catch (error) {
    console.error("❌ Erro ao executar query:", error)
    console.error("Query:", text)
    console.error("Parâmetros:", params)
    throw error
  }
}

// ======================================================
// FUNÇÃO: Verificar Conexão com Banco
// ======================================================
// Útil para testar se o banco está acessível

export const testConnection = async () => {
  try {
    const result = await query("SELECT NOW()")
    console.log("✅ Conexão com banco de dados OK")
    console.log("Hora do servidor:", result.rows[0].now)
    return true
  } catch (error) {
    console.error("❌ Erro ao conectar com banco de dados:", error.message)
    return false
  }
}

// ======================================================
// EXPORTAR POOL E FUNÇÕES
// ======================================================

export { pool }

// Exportação padrão
export default {
  query,
  testConnection,
  pool,
}
