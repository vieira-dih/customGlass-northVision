// ======================================================
// Arquivo: models/store.model.js
// ======================================================
// Modelo Store: Contém todas as queries para a tabela
// 'stores' no banco de dados
// Segue padrão: uma função por operação (Create, Read, Update, Delete)
// ======================================================

import { query } from "../config/database.js"

// ======================================================
// CRIAR: Guardar loja integrada no banco
// ======================================================
// Chamado após receber o access_token do OAuth
// Armazena: store_id, access_token, user_id

export const createStore = async (
  userId,                    // ID do usuário no nosso sistema
  nuvemshopStoreId,         // ID da loja na Nuvemshop
  accessToken,              // Token de acesso OAuth
  storeName = null          // Nome da loja (opcional)
) => {
  try {
    const text = `
      INSERT INTO stores (user_id, nuvemshop_store_id, nuvemshop_access_token, store_name)
      VALUES ($1, $2, $3, $4)
      RETURNING id, user_id, nuvemshop_store_id, store_name, created_at
    `
    
    const values = [userId, nuvemshopStoreId, accessToken, storeName]
    const result = await query(text, values)
    
    console.log("✅ Loja integrada com sucesso:", result.rows[0])
    return result.rows[0]
  } catch (error) {
    console.error("❌ Erro ao criar store:", error)
    throw error
  }
}

// ======================================================
// LER: Buscar loja por ID de integração
// ======================================================
// Retorna as informações completas da loja integrada

export const getStoreById = async (storeId) => {
  try {
    const text = `
      SELECT 
        id,
        user_id,
        nuvemshop_store_id,
        nuvemshop_access_token,
        store_name,
        created_at,
        updated_at
      FROM stores
      WHERE id = $1
    `
    
    const result = await query(text, [storeId])
    
    // Se encontrou a loja, retorna ela
    if (result.rows.length > 0) {
      console.log("✅ Loja encontrada:", result.rows[0].store_name)
      return result.rows[0]
    }
    
    // Se não encontrou, retorna null
    console.log("⚠️ Loja não encontrada com ID:", storeId)
    return null
  } catch (error) {
    console.error("❌ Erro ao buscar store:", error)
    throw error
  }
}

// ======================================================
// LER: Buscar loja pelo Nuvemshop Store ID
// ======================================================
// Útil quando vem um callback da Nuvemshop com store_id

export const getStoreByNuvemshopId = async (nuvemshopStoreId) => {
  try {
    const text = `
      SELECT 
        id,
        user_id,
        nuvemshop_store_id,
        nuvemshop_access_token,
        store_name,
        created_at,
        updated_at
      FROM stores
      WHERE nuvemshop_store_id = $1
    `
    
    const result = await query(text, [nuvemshopStoreId])
    
    if (result.rows.length > 0) {
      return result.rows[0]
    }
    
    return null
  } catch (error) {
    console.error("❌ Erro ao buscar store por Nuvemshop ID:", error)
    throw error
  }
}

// ======================================================
// LER: Buscar todas as lojas de um usuário
// ======================================================
// Um usuário pode ter múltiplas lojas integradas

export const getStoresByUserId = async (userId) => {
  try {
    const text = `
      SELECT 
        id,
        user_id,
        nuvemshop_store_id,
        nuvemshop_access_token,
        store_name,
        created_at,
        updated_at
      FROM stores
      WHERE user_id = $1
      ORDER BY created_at DESC
    `
    
    const result = await query(text, [userId])
    
    console.log(`✅ ${result.rows.length} loja(s) encontrada(s) para usuário ${userId}`)
    return result.rows
  } catch (error) {
    console.error("❌ Erro ao buscar lojas por usuário:", error)
    throw error
  }
}

// ======================================================
// LER: Buscar a loja integrada mais recente
// ======================================================
// Útil para fluxo público quando não há storeId explícito

export const getLatestStore = async () => {
  try {
    const text = `
      SELECT
        id,
        user_id,
        nuvemshop_store_id,
        nuvemshop_access_token,
        store_name,
        created_at,
        updated_at
      FROM stores
      ORDER BY updated_at DESC, created_at DESC
      LIMIT 1
    `

    const result = await query(text)
    return result.rows[0] || null
  } catch (error) {
    console.error("❌ Erro ao buscar loja mais recente:", error)
    throw error
  }
}

// ======================================================
// ATUALIZAR: Access token de uma loja
// ======================================================
// Pode ser necessário renovar o token periodicamente

export const updateAccessToken = async (storeId, newAccessToken) => {
  try {
    const text = `
      UPDATE stores
      SET nuvemshop_access_token = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING id, nuvemshop_store_id, updated_at
    `
    
    const result = await query(text, [newAccessToken, storeId])
    
    if (result.rows.length > 0) {
      console.log("✅ Token atualizado para loja:", result.rows[0].nuvemshop_store_id)
      return result.rows[0]
    }
    
    throw new Error(`Loja com ID ${storeId} não encontrada`)
  } catch (error) {
    console.error("❌ Erro ao atualizar token:", error)
    throw error
  }
}

// ======================================================
// ATUALIZAR: Nome da loja
// ======================================================
// Pode ser útil para organizar múltiplas integração

export const updateStoreName = async (storeId, storeName) => {
  try {
    const text = `
      UPDATE stores
      SET store_name = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING id, store_name, updated_at
    `
    
    const result = await query(text, [storeName, storeId])
    
    if (result.rows.length > 0) {
      console.log("✅ Nome da loja atualizado:", result.rows[0].store_name)
      return result.rows[0]
    }
    
    throw new Error(`Loja com ID ${storeId} não encontrada`)
  } catch (error) {
    console.error("❌ Erro ao atualizar nome da loja:", error)
    throw error
  }
}

// ======================================================
// DELETAR: Remover integração de uma loja
// ======================================================
// Desconectar uma loja do sistema

export const deleteStore = async (storeId) => {
  try {
    const text = `
      DELETE FROM stores
      WHERE id = $1
      RETURNING id, nuvemshop_store_id
    `
    
    const result = await query(text, [storeId])
    
    if (result.rows.length > 0) {
      console.log("✅ Loja desintegrada com sucesso")
      return true
    }
    
    console.log("⚠️ Loja não encontrada para deletar")
    return false
  } catch (error) {
    console.error("❌ Erro ao deletar store:", error)
    throw error
  }
}

// ======================================================
// VERIFICAR: Se uma loja já está integrada
// ======================================================
// Evitar duplicatas no banco

export const storeExists = async (nuvemshopStoreId) => {
  try {
    const text = `
      SELECT id FROM stores WHERE nuvemshop_store_id = $1 LIMIT 1
    `
    
    const result = await query(text, [nuvemshopStoreId])
    
    return result.rows.length > 0
  } catch (error) {
    console.error("❌ Erro ao verificar se store existe:", error)
    throw error
  }
}
