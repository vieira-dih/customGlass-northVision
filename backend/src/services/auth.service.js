// ======================================================
// Arquivo: services/auth.service.js
// ======================================================
// Lógica principal do fluxo OAuth 2.0 com Nuvemshop
// 
// Fluxo:
// 1. Gerar URL de autorização
// 2. Usuário redireciona para Nuvemshop
// 3. Usuário autoriza o app
// 4. Nuvemshop redireciona de volta com 'code'
// 5. Trocar 'code' por 'access_token'
// 6. Salvar token no banco de dados
// ======================================================

import axios from "axios"
import jwt from "jsonwebtoken"
import * as StoreModel from "../models/store.model.js"
import dotenv from "dotenv"

dotenv.config()

// ======================================================
// CONSTANTES - URLs da Nuvemshop OAuth
// ======================================================

// URL onde o usuário autoriza a aplicação
const NUVEMSHOP_AUTHORIZE_URL = "https://www.nuvemshop.com.br/apps/authorize"

// URL para trocar code por token
const NUVEMSHOP_TOKEN_URL = "https://www.nuvemshop.com.br/apps/authorize/token"

// API base da Nuvemshop para chamadas autenticadas
const NUVEMSHOP_API_BASE = "https://api.nuvemshop.com.br/v1"

// ======================================================
// PASSO 1: Gerar URL de Autorização
// ======================================================
// Redireciona o usuário para o Nuvemshop para autorizar
// Retorna: URL para redirecionar o usuário

export const generateAuthorizationUrl = () => {
  try {
    // Construir parâmetros da URL
    const params = new URLSearchParams({
      // ID da aplicação registrada na Nuvemshop
      client_id: process.env.NUVEMSHOP_CLIENT_ID,
      
      // Onde retornar após autorização (MUST estar registrado no Nuvemshop)
      redirect_uri: process.env.NUVEMSHOP_REDIRECT_URI,
      
      // Tipo de resposta sempre é 'code' (OAuth 2.0)
      response_type: "code",
    })
    
    // Montar URL completa
    const authUrl = `${NUVEMSHOP_AUTHORIZE_URL}?${params.toString()}`
    
    console.log("✅ URL de autorização gerada")
    return authUrl
  } catch (error) {
    console.error("❌ Erro ao gerar URL de autorização:", error)
    throw error
  }
}

// ======================================================
// PASSO 2: Trocar Code por Access Token
// ======================================================
// Chamado pelo /auth/callback
// Recebe: code (do OAuth)
// Retorna: access_token, user_id, store_id

export const exchangeCodeForToken = async (code) => {
  try {
    console.log("🔄 Iniciando troca de code por token...")
    
    // Preparar dados para enviar ao Nuvemshop
    const tokenRequestData = {
      // ID da aplicação
      client_id: process.env.NUVEMSHOP_CLIENT_ID,
      
      // Senha da aplicação (NÃO EXPOR NO FRONTEND!)
      client_secret: process.env.NUVEMSHOP_CLIENT_SECRET,
      
      // Sempre 'authorization_code' neste fluxo
      grant_type: "authorization_code",
      
      // Code recebido do OAuth
      code: code,
    }
    
    // Fazer requisição POST para Nuvemshop
    const response = await axios.post(NUVEMSHOP_TOKEN_URL, tokenRequestData, {
      headers: {
        "Content-Type": "application/json",
      },
    })
    
    // Extrair dados importantes da resposta
    const {
      access_token,    // Token de acesso para chamar API da Nuvemshop
      user_id,         // ID do usuário no Nuvemshop
      store_id,        // ID da loja no Nuvemshop (IMPORTANTE!)
    } = response.data
    
    console.log("✅ Token recebido do Nuvemshop")
    console.log("   Store ID:", store_id)
    console.log("   User ID:", user_id)
    
    return {
      access_token,
      user_id,
      store_id,
    }
  } catch (error) {
    console.error("❌ Erro ao trocar code por token:", error.response?.data || error.message)
    throw error
  }
}

// ======================================================
// PASSO 3: Salvar Store no Banco e Gerar JWT
// ======================================================
// Após ter o access_token, salva no banco e cria JWT
// Retorna: JWT para o frontend armazenar

export const completeOAuthFlow = async (code, localUserId) => {
  try {
    console.log("🔄 Completando fluxo OAuth...")
    
    // Etapa 1: Trocar code por token
    const { access_token, store_id } = await exchangeCodeForToken(code)
    
    // Etapa 2: Verificar se já existe (evitar duplicatas)
    const storeExists = await StoreModel.storeExists(store_id)
    
    if (storeExists) {
      console.log("⚠️ Loja já estava integrada, atualizando token...")
      
      // Se já existe, atualizar o token
      const existingStore = await StoreModel.getStoreByNuvemshopId(store_id)
      await StoreModel.updateAccessToken(existingStore.id, access_token)
      
      // Retornar dados da loja existente
      return {
        storeId: existingStore.id,
        nuvemshopStoreId: store_id,
        isNew: false,
      }
    }
    
    // Etapa 3: Criar nova integração no banco
    const newStore = await StoreModel.createStore(
      localUserId,        // ID do usuário no nosso sistema
      store_id,           // ID da loja na Nuvemshop
      access_token,       // Token de acesso
      `Loja ${store_id}`  // Nome padrão
    )
    
    console.log("✅ Loja armazenada no banco com sucesso")
    
    return {
      storeId: newStore.id,      // ID da integração no nosso banco
      nuvemshopStoreId: store_id, // ID da loja na Nuvemshop
      isNew: true,               // Primeira vez que integra
    }
  } catch (error) {
    console.error("❌ Erro ao completar OAuth flow:", error)
    throw error
  }
}

// ======================================================
// PASSO 4: Gerar JWT para Sessão do Usuário
// ======================================================
// Após salvar, criar token JWT para o frontend
// JWT será incluído em todas requisições subsequentes

export const generateJWT = (userId, storeId) => {
  try {
    // Dados que irão no token (payload)
    const payload = {
      userId,      // ID do usuário no nosso banco
      storeId,     // ID da integração no nosso banco
      iat: Math.floor(Date.now() / 1000), // Issued at time
    }
    
    // Gerar token
    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET,
      {
        // Token expira em 24 horas
        expiresIn: "24h",
        
        // Algoritmo de criptografia
        algorithm: "HS256",
      }
    )
    
    console.log("✅ JWT gerado com sucesso")
    return token
  } catch (error) {
    console.error("❌ Erro ao gerar JWT:", error)
    throw error
  }
}

// ======================================================
// VERIFICAR: Validar JWT (Usado no Middleware)
// ======================================================
// Valida um JWT recebido do frontend

export const verifyJWT = (token) => {
  try {
    // Verificar assinatura e expiração
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    
    console.log("✅ JWT válido para usuário:", decoded.userId)
    return decoded
  } catch (error) {
    console.error("❌ JWT inválido ou expirado:", error.message)
    return null
  }
}

// ======================================================
// BUSCAR: Access Token Salvo no Banco
// ======================================================
// Necessário para fazer chamadas à API da Nuvemshop

export const getAccessTokenForStore = async (storeId) => {
  try {
    // Buscar a loja no banco
    const store = await StoreModel.getStoreById(storeId)
    
    if (!store) {
      throw new Error(`Loja com ID ${storeId} não encontrada`)
    }
    
    console.log("✅ Access token recuperado do banco")
    return store.nuvemshop_access_token
  } catch (error) {
    console.error("❌ Erro ao buscar access token:", error.message)
    throw error
  }
}

// ======================================================
// TESTE: Validar Token com API Nuvemshop
// ======================================================
// Faz uma chamada simples à API para verificar se token é válido

export const validateTokenWithAPI = async (storeId, accessToken) => {
  try {
    console.log("🔄 Validando token com API Nuvemshop...")
    
    // Fazer requuisição simples à API (buscar informações da loja)
    const response = await axios.get(
      `${NUVEMSHOP_API_BASE}/${storeId}/store`,
      {
        headers: {
          // Authorization com Bearer token
          "Authorization": `bearer ${accessToken}`,
          
          // Identificar a aplicação
          "User-Agent": "CustomGlassNorthVision (integrations@customglass.com)",
          
          "Content-Type": "application/json",
        },
      }
    )
    
    console.log("✅ Token validado com sucesso")
    console.log("   Loja:", response.data.name)
    
    return {
      valid: true,
      storeName: response.data.name,
    }
  } catch (error) {
    console.error("❌ Erro ao validar token:", error.response?.data || error.message)
    return {
      valid: false,
      error: error.message,
    }
  }
}
