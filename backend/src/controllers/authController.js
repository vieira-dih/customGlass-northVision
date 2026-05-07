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
// LOGIN DO LOJISTA
// ======================================================
// POST /auth/lojista/login
// Body: { email, senha }

export const loginLojista = async (req, res) => {
  try {
    const { email, senha } = req.body || {}

    if (!email || !senha) {
      return res.status(400).json({ erro: "Email e senha são obrigatórios" })
    }

    const { token, nome, userId } = await AuthService.loginLojista(email, senha)

    return res.json({ token, nome, userId })
  } catch (error) {
    return res.status(401).json({ erro: error.message })
  }
}

// ======================================================
// CRIAR LOJISTA (uso interno / primeiro setup)
// ======================================================
// POST /auth/lojista/criar
// Body: { nome, email, senha, adminSecret }

export const criarLojista = async (req, res) => {
  try {
    const { nome, email, senha, adminSecret } = req.body || {}

    if (adminSecret !== process.env.ADMIN_SECRET) {
      return res.status(403).json({ erro: "Não autorizado" })
    }

    if (!nome || !email || !senha) {
      return res.status(400).json({ erro: "nome, email e senha são obrigatórios" })
    }

    if (senha.length < 8) {
      return res.status(400).json({ erro: "A senha deve ter no mínimo 8 caracteres" })
    }

    const user = await AuthService.criarLojista(nome, email, senha)
    return res.status(201).json({ mensagem: "Lojista criado com sucesso", user })
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({ erro: "Este email já está cadastrado" })
    }
    return res.status(500).json({ erro: error.message })
  }
}

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
    const { url: authUrl, state } = AuthService.generateAuthorizationUrl()
    
    // Armazenar state na sessão para verificar depois (CSRF protection)
    req.session = req.session || {}
    req.session.oauthState = state
    
    console.log("🔄 Redirecionando para Nuvemshop...")
    console.log("   URL:", authUrl)
    
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
    const frontendUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth-callback?token=${jwt}&storeId=${storeId}&isNew=${isNew}`
    
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
    const errorUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth-callback?error=${encodeURIComponent(error.message)}`
    
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

// ======================================================
// DIAGNOSTIC: Teste de Token com Store ID
// ======================================================
// Rota: POST /auth/test-token (PÚBLICA - sem JWT)
// Body: { accessToken, storeId }
// 
// Endpoint para diagnosticar problemas com a API Nuvemshop

export const testTokenDiagnostic = async (req, res) => {
  try {
    const { accessToken, storeId } = req.body
    
    if (!accessToken || !storeId) {
      return res.status(400).json({
        erro: "Parâmetros inválidos",
        mensagem: "Informe: accessToken, storeId",
      })
    }
    
    console.log("🔧 DIAGNÓSTICO: Testando token e store_id...")
    console.log("   StoreId recebido:", storeId)
    console.log("   Token:", accessToken.substring(0, 20) + "...")
    
    // Chamar função de validação completa
    const validation = await AuthService.validateTokenWithAPI(storeId, accessToken)
    
    res.json({
      mensagem: "Diagnóstico completo",
      resultado: validation,
      recomendacoes: validation.valid 
        ? "✅ Token e endpoint funcionando!"
        : "❌ Verifique: (1) Store ID correto? (2) Escopos no app? (3) Token expirado?"
    })
  } catch (error) {
    console.error("❌ Erro no diagnóstico:", error)
    
    res.status(500).json({
      erro: "Erro ao realizar diagnóstico",
      mensagem: error.message,
    })
  }
}
