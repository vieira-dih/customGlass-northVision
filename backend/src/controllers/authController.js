// ======================================================
// Arquivo: controllers/authController.js
// ======================================================
// Controller para o fluxo OAuth 2.0
// Endpoints:
//   GET /auth/nuvemshop        → Redireciona para Nuvemshop
//   GET /auth/callback         → Recebe code do OAuth
//   POST /auth/connect         → Completa a integração
// ======================================================

import * as AuthService from "../services/auth.service.js"
import * as StoreModel from "../models/store.model.js"

// ======================================================
// ETAPA 1: Iniciar Fluxo OAuth
// ======================================================
// Rota: GET /auth/nuvemshop
// 
// Quando user clica em "Conectar com Nuvemshop"
// Retorna: Redireciona para URL de autorização do Nuvemshop

export const initiateOAuth = (req, res) => {
  try {
    console.log("🔄 Iniciando fluxo OAuth...")
    
    // Gerar URL de autorização do Nuvemshop
    const authUrl = AuthService.generateAuthorizationUrl()
    
    // Redirecionar o usuário para o Nuvemshop
    // Lá ele verá um botão "Autorizar" para sua loja
    res.redirect(authUrl)
  } catch (error) {
    console.error("❌ Erro ao iniciar OAuth:", error)
    
    res.status(500).json({
      erro: "Erro ao iniciar integração com Nuvemshop",
      mensagem: error.message,
    })
  }
}

// ======================================================
// ETAPA 2: Callback do OAuth
// ======================================================
// Rota: GET /auth/callback
// Parâmetros: code, store_id (vêm da Nuvemshop)
// 
// Após user autorizar, Nuvemshop redireciona aqui
// Retorna: Página HTML que redireciona para frontend com JWT

export const handleOAuthCallback = async (req, res) => {
  try {
    console.log("🔄 Recebendo callback da Nuvemshop...")
    
    // Extrair parâmetros da URL
    const { code, store_id } = req.query
    
    // Validar que recebemos o code
    if (!code) {
      console.error("❌ Code não recebido da Nuvemshop")
      
      return res.status(400).json({
        erro: "Código de autorização não recebido",
        mensagem: "O Nuvemshop não forneceu o código necessário",
      })
    }
    
    console.log("✅ Code recebido:", code.substring(0, 10) + "...")
    console.log("✅ Store ID recebido:", store_id)
    
    // POR ENQUANTO: Usar um user_id padrão
    // DEPOIS: Implementar sistema de usuários com login/JWT separado
    const defaultUserId = 1
    
    // Trocar code por access_token e salvar no banco
    const { storeId, nuvemshopStoreId, isNew } = await AuthService.completeOAuthFlow(
      code,
      defaultUserId
    )
    
    // Gerar JWT para o frontend
    const jwt = AuthService.generateJWT(defaultUserId, storeId)
    
    console.log(`✅ OAuth completado! ${isNew ? "Nova" : "Existente"} integração`)
    
    // Retornar HTML que redireciona para frontend com JWT na URL
    // O frontend irá capturar o JWT e armazenar em LocalStorage
    const frontendUrl = `http://localhost:5173/auth-callback?token=${jwt}&storeId=${storeId}&isNew=${isNew}`
    
    // HTML que redireciona automaticamente
    const htmlResponse = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Conectando com Nuvemshop...</title>
          <script>
            // Redirecionar para frontend com token
            window.location.href = "${frontendUrl}";
          </script>
        </head>
        <body>
          <h1>Finalizando integração...</h1>
          <p>Você será redirecionado em alguns segundos.</p>
          <a href="${frontendUrl}">Clique aqui se não for redirecionado automaticamente</a>
        </body>
      </html>
    `
    
    res.send(htmlResponse)
  } catch (error) {
    console.error("❌ Erro ao processar callback:", error)
    
    // Redirecionar para frontend com erro
    const errorUrl = `http://localhost:5173/auth-callback?error=${encodeURIComponent(error.message)}`
    
    const htmlResponse = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Erro na integração</title>
          <script>
            window.location.href = "${errorUrl}";
          </script>
        </head>
        <body>
          <h1>Erro ao integrar com Nuvemshop</h1>
          <p>${error.message}</p>
          <a href="${errorUrl}">Voltar ao app</a>
        </body>
      </html>
    `
    
    res.send(htmlResponse)
  }
}

// ======================================================
// VALIDAR: Verificar se token é válido
// ======================================================
// Rota: GET /auth/verify
// Headers: Authorization: Bearer JWT
// 
// Retorna: Informações do usuário/loja se válido

export const verifyToken = async (req, res) => {
  try {
    // req.user vem do middleware authenticateJWT
    const { userId, storeId } = req.user
    
    console.log("🔍 Verificando token para usuário:", userId)
    
    // Buscar informações da loja no banco
    const store = await StoreModel.getStoreById(storeId)
    
    if (!store) {
      return res.status(404).json({
        erro: "Loja não encontrada",
        mensagem: "A loja associada a este token não existe mais",
      })
    }
    
    // Retornar dados da loja
    res.json({
      mensagem: "Token válido",
      usuario: {
        id: userId,
      },
      loja: {
        id: store.id,
        nuvemshopId: store.nuvemshop_store_id,
        name: store.store_name,
        integratedAt: store.created_at,
      },
    })
  } catch (error) {
    console.error("❌ Erro ao verificar token:", error)
    
    res.status(500).json({
      erro: "Erro ao verificar token",
      mensagem: error.message,
    })
  }
}

// ======================================================
// LISTAR: Todas as lojas do usuário
// ======================================================
// Rota: GET /auth/stores
// Headers: Authorization: Bearer JWT
// 
// Retorna: Array de lojas integradas

export const getUserStores = async (req, res) => {
  try {
    const { userId } = req.user
    
    console.log("📦 Buscando lojas do usuário:", userId)
    
    // Buscar todas as lojas do usuário no banco
    const stores = await StoreModel.getStoresByUserId(userId)
    
    // Formatar resposta
    const formattedStores = stores.map((store) => ({
      id: store.id,
      nuvemshopId: store.nuvemshop_store_id,
      name: store.store_name,
      integratedAt: store.created_at,
      lastUpdated: store.updated_at,
    }))
    
    res.json({
      mensagem: `${formattedStores.length} loja(s) encontrada(s)`,
      lojas: formattedStores,
    })
  } catch (error) {
    console.error("❌ Erro ao listar lojas:", error)
    
    res.status(500).json({
      erro: "Erro ao listar lojas",
      mensagem: error.message,
    })
  }
}

// ======================================================
// DESCONECTAR: Remover integração
// ======================================================
// Rota: DELETE /auth/stores/:storeId
// Headers: Authorization: Bearer JWT
// 
// Remove a loja do banco (desonectar integração)

export const disconnectStore = async (req, res) => {
  try {
    const { storeId } = req.params
    const { userId } = req.user
    
    console.log("🔌 Desconectando loja:", storeId)
    
    // Verificar se a loja existe e pertence ao usuário
    const store = await StoreModel.getStoreById(storeId)
    
    if (!store) {
      return res.status(404).json({
        erro: "Loja não encontrada",
      })
    }
    
    if (store.user_id !== userId) {
      return res.status(403).json({
        erro: "Acesso negado",
        mensagem: "Você não pode desconectar uma loja que não pertence a você",
      })
    }
    
    // Deletar a loja do banco
    await StoreModel.deleteStore(storeId)
    
    res.json({
      mensagem: "Loja desconectada com sucesso",
    })
  } catch (error) {
    console.error("❌ Erro ao desconectar loja:", error)
    
    res.status(500).json({
      erro: "Erro ao desconectar loja",
      mensagem: error.message,
    })
  }
}

// ======================================================
// TESTE: Validar token com Nuvemshop
// ======================================================
// Rota: GET /auth/validate-with-nuvemshop
// Headers: Authorization: Bearer JWT
// 
// Faz uma chamada à API Nuvemshop para verificar se token é válido

export const validateTokenWithNuvemshop = async (req, res) => {
  try {
    const { storeId } = req.user
    
    console.log("🔍 Validando token com API Nuvemshop...")
    
    // Buscar access token no banco
    const accessToken = await AuthService.getAccessTokenForStore(storeId)
    
    // Obter store_id do banco para chamar a API
    const store = await StoreModel.getStoreById(storeId)
    
    // Validar com a API
    const validation = await AuthService.validateTokenWithAPI(
      store.nuvemshop_store_id,
      accessToken
    )
    
    res.json({
      mensagem: "Validação completa",
      resultado: validation,
    })
  } catch (error) {
    console.error("❌ Erro ao validar token:", error)
    
    res.status(500).json({
      erro: "Erro ao validar token com Nuvemshop",
      mensagem: error.message,
    })
  }
}
