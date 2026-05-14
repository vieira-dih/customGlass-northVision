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
import bcrypt from "bcryptjs"
import * as StoreModel from "../models/store.model.js"
import { query } from "../config/database.js"
import dotenv from "dotenv"

dotenv.config()

// ======================================================
// CONSTANTES - URLs da Nuvemshop OAuth
// ======================================================

// URL base de autorização - o client_id vai NO PATH, não como query param
// Formato: https://www.nuvemshop.com.br/apps/{client_id}/authorize
const NUVEMSHOP_AUTHORIZE_BASE = "https://www.nuvemshop.com.br/apps"

// URL para trocar code por token (com www!)
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
    // Gerar um state único para segurança (previne CSRF)
    // O state será incluído na URL de callback e deve ser verificado
    const state = Math.random().toString(36).substring(2, 15) + 
                  Math.random().toString(36).substring(2, 15)
    
    // Construir parâmetros da URL (SEM client_id - ele vai no path)
    const params = new URLSearchParams({
      // Onde retornar após autorização (MUST estar registrado no Nuvemshop)
      redirect_uri: process.env.NUVEMSHOP_REDIRECT_URI,
      
      // Tipo de resposta sempre é 'code' (OAuth 2.0)
      response_type: "code",
      
      // State parameter para segurança (CSRF prevention)
      state: state,
    })
    
    // Montar URL completa: /apps/{client_id}/authorize?params
    const clientId = process.env.NUVEMSHOP_CLIENT_ID
    const authUrl = `${NUVEMSHOP_AUTHORIZE_BASE}/${clientId}/authorize?${params.toString()}`
    
    console.log("✅ URL de autorização gerada")
    
    return { url: authUrl, state }
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
    
    // DEBUG: Ver estrutura completa da resposta
    console.log("📦 Resposta completa do Nuvemshop:")
    console.log(response.data)
    
    // Extrair dados importantes da resposta
    const {
      access_token,    // Token de acesso para chamar API da Nuvemshop
      user_id,         // ID do usuário no Nuvemshop
      store_id,        // ID da loja no Nuvemshop (IMPORTANTE!)
    } = response.data
    
    console.log("✅ Token recebido do Nuvemshop")
    
    // Se store_id não veio na resposta, buscar da API
    let finalStoreId = store_id
    if (!finalStoreId) {
      console.log("🔄 Store ID não recebido, buscando da API Nuvemshop...")
      
      try {
        // Primeira tentativa: endpoint de store sem store_id
        console.log("   Tentativa 1: GET /v1/store")
        const storeResponse = await axios.get(
          `${NUVEMSHOP_API_BASE}/${user_id}/store`,
          {
            headers: {
              "Authentication": `bearer ${access_token}`,
              "User-Agent": "CustomGlassNorthVision (integrations@customglass.com)",
              "Content-Type": "application/json",
            },
          }
        )
        
        finalStoreId = storeResponse.data.id
        console.log("✅ Store ID obtido da API")
      } catch (apiError) {
        console.error("❌ GET /v1/store retornou:", {
          status: apiError.response?.status,
          statusText: apiError.response?.statusText,
          data: apiError.response?.data,
        })
        
        // Fallback: se API falhar, tentar usar user_id como store_id
        finalStoreId = user_id
        console.log("⚠️ Fallback: usando user_id como store_id")
      }
    }
    
    return {
      access_token,
      user_id,
      store_id: finalStoreId,
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
    
    console.log("✅ Token recuperado do banco")
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
    
    // TESTE 1: GET /v1/{storeId}/store - Formato correto da API Nuvemshop
    console.log("\n   📌 TESTE 1: GET /v1/{storeId}/store")
    try {
      const response1 = await axios.get(
        `${NUVEMSHOP_API_BASE}/${storeId}/store`,
        {
          headers: {
            "Authentication": `bearer ${accessToken}`,
            "User-Agent": "CustomGlassNorthVision (integrations@customglass.com)",
            "Content-Type": "application/json",
          },
        }
      )
      
      console.log("   ✅ Sucesso! Store data:")
      console.log("      ID:", response1.data.id)
      console.log("      Name:", response1.data.name)
      console.log("      Domain:", response1.data.domain)
      
      return {
        valid: true,
        method: "/v1/store",
        storeName: response1.data.name,
        actualStoreId: response1.data.id,
        data: response1.data,
      }
    } catch (error1) {
      console.error("   ❌ TESTE 1 falhou:", error1.response?.status, error1.response?.data?.message)
    }
    
    // TESTE 2: GET /v1/{storeId}/store (com Authentication header)
    console.log("\n   📌 TESTE 2: GET /v1/{storeId}/store (Authentication header)")
    try {
      const response2 = await axios.get(
        `${NUVEMSHOP_API_BASE}/${storeId}/store`,
        {
          headers: {
            "Authentication": `bearer ${accessToken}`,
            "User-Agent": "CustomGlassNorthVision (integrations@customglass.com)",
            "Content-Type": "application/json",
          },
        }
      )
      
      console.log("   ✅ Sucesso! Store data:")
      console.log("      ID:", response2.data.id)
      console.log("      Name:", response2.data.name)
      
      return {
        valid: true,
        method: `/v1/${storeId}/store`,
        storeName: response2.data.name,
        actualStoreId: response2.data.id,
        data: response2.data,
      }
    } catch (error2) {
      console.error("   ❌ TESTE 2 falhou:", error2.response?.status, error2.response?.data?.message)
    }
    
    // TESTE 3: GET /v1/{storeId}/products (formato esperado)
    console.log("\n   📌 TESTE 3: GET /v1/{storeId}/products (com limite)")
    try {
      const response3 = await axios.get(
        `${NUVEMSHOP_API_BASE}/${storeId}/products?limit=10`,
        {
          headers: {
            "Authentication": `bearer ${accessToken}`,
            "User-Agent": "CustomGlassNorthVision (integrations@customglass.com)",
            "Content-Type": "application/json",
          },
        }
      )
      
      console.log("   ✅ Sucesso! Produtos encontrados:", response3.data.length)
      
      return {
        valid: true,
        method: `/v1/${storeId}/products`,
        productsCount: response3.data.length,
        data: response3.data,
      }
    } catch (error3) {
      console.error("   ❌ TESTE 3 falhou:", error3.response?.status, error3.response?.data?.message)
    }
    
    // Se chegou aqui, nenhum teste passou
    console.error("❌ TODOS OS TESTES FALHARAM")
    console.error("   Possíveis causas:")
    console.error("   1. Token inválido ou expirado")
    console.error("   2. Store ID incorreto")
    console.error("   3. Escopos insuficientes no app Nuvemshop")
    console.error("   4. API rejeitando requisições da nossa aplicação") 
    
    return {
      valid: false,
      error: "Token validation failed on all endpoints",
      message: "Nenhum endpoint respondeu com sucesso",
    }
  } catch (error) {
    console.error("❌ Erro inesperado ao validar token:", error.message)
    return {
      valid: false,
      error: error.message,
    }
  }
}

// ======================================================
// LOGIN DO LOJISTA: Autenticar com email + senha
// ======================================================
export const loginLojista = async (email, senha) => {
  const result = await query(
    "SELECT id, nome, email, password_hash FROM users WHERE email = $1 LIMIT 1",
    [email.toLowerCase().trim()]
  )

  const user = result.rows[0]
  if (!user) throw new Error("Credenciais inválidas")

  const senhaCorreta = await bcrypt.compare(senha, user.password_hash)
  if (!senhaCorreta) throw new Error("Credenciais inválidas")

  const token = jwt.sign(
    { userId: user.id, role: "lojista" },
    process.env.JWT_SECRET,
    { expiresIn: "8h", algorithm: "HS256" }
  )

  return { token, nome: user.nome, userId: user.id }
}

// ======================================================
// CRIAR LOJISTA: Registrar novo usuário lojista
// ======================================================
export const criarLojista = async (nome, email, senha) => {
  const hash = await bcrypt.hash(senha, 12)
  const result = await query(
    `INSERT INTO users (nome, email, password_hash)
     VALUES ($1, $2, $3)
     RETURNING id, nome, email`,
    [nome.trim(), email.toLowerCase().trim(), hash]
  )
  return result.rows[0]
}
