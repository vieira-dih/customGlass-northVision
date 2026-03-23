// ======================================================
// Arquivo: middleware/auth.middleware.js
// ======================================================
// Middleware para proteger rotas
// Verifica se o JWT é válido antes de permitir acesso
// 
// Uso:
// app.get("/api/protected-route", authenticateJWT, controller)
// ======================================================

import { verifyJWT } from "../services/auth.service.js"

// ======================================================
// MIDDLEWARE: Autenticar JWT
// ======================================================
// Valida token JWT e extrai dados do usuário/loja
// Se inválido, retorna erro 401

export const authenticateJWT = (req, res, next) => {
  try {
    // Pegar token do header Authorization
    // Formato: "Bearer TOKEN_AQUI"
    const authHeader = req.headers["authorization"]
    
    if (!authHeader) {
      console.log("⚠️ Nenhum token fornecido")
      return res.status(401).json({
        erro: "Token não fornecido",
        mensagem: "Faça login primeiro",
      })
    }
    
    // Extrair apenas o token (remove "Bearer ")
    // "Bearer abc123def456" → "abc123def456"
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.slice(7)
      : authHeader
    
    // Verificar se o token é válido
    const decoded = verifyJWT(token)
    
    // Se inválido, decoded será null
    if (!decoded) {
      console.log("❌ Token inválido ou expirado")
      return res.status(401).json({
        erro: "Token inválido ou expirado",
        mensagem: "Faça login novamente",
      })
    }
    
    // Se válido, armazenar dados no request para próximas funções
    // Agora req.user contém: { userId, storeId, iat, exp }
    req.user = decoded
    
    console.log(`✅ JWT válido para usuário ${decoded.userId}`)
    
    // Passar para próximo middleware/controller
    next()
  } catch (error) {
    console.error("❌ Erro no middleware de autenticação:", error)
    
    return res.status(500).json({
      erro: "Erro ao validar token",
      mensagem: error.message,
    })
  }
}

// ======================================================
// MIDDLEWARE: Verificar se usuário é proprietário da loja
// ======================================================
// Evita que um usuário acesse dados de outra loja
// Opcional, mas recomendado para segurança

export const authorizeStoreAccess = (req, res, next) => {
  try {
    // Obter ID da loja dos parâmetros da rota
    // Exemplo: /api/stores/:storeId/products
    const requestedStoreId = parseInt(req.params.storeId)
    
    // Comparar com a loja do JWT
    if (req.user.storeId !== requestedStoreId) {
      console.log(
        `⚠️ Usuário ${req.user.userId} tentou acessar loja ${requestedStoreId} (só tem acesso a ${req.user.storeId})`
      )
      
      return res.status(403).json({
        erro: "Acesso negado",
        mensagem: "Você não tem permissão para acessar esta loja",
      })
    }
    
    // Permitir acesso
    console.log(`✅ Acesso autorizado para loja ${requestedStoreId}`)
    next()
  } catch (error) {
    console.error("❌ Erro no middleware de autorização:", error)
    
    return res.status(500).json({
      erro: "Erro ao verificar autorização",
      mensagem: error.message,
    })
  }
}

// ======================================================
// MIDDLEWARE: Log de Requisições (Opcional)
// ======================================================
// Log automático de todas requisições (útil para debug)

export const logRequest = (req, res, next) => {
  const timestamp = new Date().toISOString()
  const method = req.method
  const path = req.path
  const userId = req.user?.userId || "anônimo"
  
  console.log(`[${timestamp}] ${method} ${path} (usuário: ${userId})`)
  
  next()
}
