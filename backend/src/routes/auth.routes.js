// ======================================================
// Arquivo: routes/auth.routes.js
// ======================================================
// Define todas as rotas relacionadas a autenticação
// e integração com Nuvemshop
// ======================================================

import express from "express"
import * as AuthController from "../controllers/authController.js"
import { authenticateJWT, logRequest } from "../middleware/auth.middleware.js"

const router = express.Router()

// ======================================================
// ROTAS PÚBLICAS (Sem autenticação necessária)
// ======================================================

// Rota 1: Iniciar fluxo OAuth
// GET /auth/nuvemshop
// Redireciona o usuário para autorizar no Nuvemshop
router.get("/nuvemshop", AuthController.initiateOAuth)

// Rota 2: Callback do OAuth
// GET /auth/callback?code=...&store_id=...
// Recebe o código do Nuvemshop e troca por token
router.get("/callback", AuthController.handleOAuthCallback)

// ======================================================
// ROTAS PROTEGIDAS (Requer JWT válido)
// ======================================================

// Aplicar log a todas as rotas protegidas
router.use(logRequest)

// Rota 3: Verificar se token é válido
// GET /auth/verify
// Retorna: Informações do usuário e da loja
router.get("/verify", authenticateJWT, AuthController.verifyToken)

// Rota 4: Listar todas as lojas do usuário
// GET /auth/stores
// Retorna: Array de lojas integradas
router.get("/stores", authenticateJWT, AuthController.getUserStores)

// Rota 5: Validar token com API da Nuvemshop
// GET /auth/validate-with-nuvemshop
// Faz uma chamada à API Nuvemshop para testar o token
router.get(
  "/validate-with-nuvemshop",
  authenticateJWT,
  AuthController.validateTokenWithNuvemshop
)

// Rota 6: Desconectar uma loja
// DELETE /auth/stores/:storeId
// Remove a integração do banco
router.delete("/stores/:storeId", authenticateJWT, AuthController.disconnectStore)

// ======================================================
// ROTAS DE DIAGNÓSTICO (Públicas - sem autenticação)
// ======================================================

// Rota 7: Testar token e diagnosticar problemas
// POST /auth/test-token
// Body: { accessToken, storeId }
// Testa se o token funciona com o store_id fornecido
router.post("/test-token", AuthController.testTokenDiagnostic)

// ======================================================
// Exportar router
// ======================================================

export default router
