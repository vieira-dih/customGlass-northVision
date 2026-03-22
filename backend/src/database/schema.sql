-- ======================================================
-- SCHEMA DO BANCO DE DADOS - CUSTOM GLASS NORTH VISION
-- ======================================================
-- Este arquivo contém todas as tabelas necessárias para
-- a integração OAuth 2.0 com Nuvemshop

-- ======================================================
-- TABELA: users
-- ======================================================
-- Armazena informações dos usuários do sistema
-- Cada usuário pode ter múltiplas lojas integradas
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,                          -- ID único do usuário
  email VARCHAR(255) NOT NULL UNIQUE,             -- Email único para login
  password_hash VARCHAR(255),                     -- Hash da senha (bcrypt) - opcional por enquanto
  nome VARCHAR(255) NOT NULL,                     -- Nome do usuário
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  -- Data de criação
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP   -- Data de última atualização
);

-- ======================================================
-- TABELA: stores (Lojas Nuvemshop integradas)
-- ======================================================
-- Armazena informações das lojas Nuvemshop conectadas
-- Cada loja é vinculada a um usuário específico
CREATE TABLE IF NOT EXISTS stores (
  id SERIAL PRIMARY KEY,                                  -- ID único da integração
  
  -- Identificadores da loja Nuvemshop
  nuvemshop_store_id INTEGER NOT NULL UNIQUE,            -- ID da loja na Nuvemshop
  nuvemshop_access_token VARCHAR(500) NOT NULL,          -- Token de acesso OAuth
  
  -- Relacionamento com usuário
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE, -- Proprietário da loja
  
  -- Informações da loja
  store_name VARCHAR(255),                               -- Nome da loja (opcional)
  
  -- Datas
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,        -- Quando foi integrada
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,        -- Última sincronização
  
  -- Índices para performance
  CONSTRAINT fk_stores_user FOREIGN KEY (user_id) REFERENCES users(id)
);

-- ======================================================
-- TABELA: products_cache (Cache de Produtos)
-- ======================================================
-- Opcional: Armazena cache dos produtos da loja
-- Evita chamar a API constantemente
CREATE TABLE IF NOT EXISTS products_cache (
  id SERIAL PRIMARY KEY,                       -- ID único do cache
  
  -- Relacionamento
  store_id INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE, -- Qual loja?
  nuvemshop_product_id INTEGER NOT NULL,       -- ID do produto na Nuvemshop
  
  -- Dados do produto
  name VARCHAR(255) NOT NULL,                  -- Nome do produto
  description TEXT,                            -- Descrição
  price DECIMAL(10, 2),                        -- Preço
  image_url VARCHAR(500),                      -- URL da imagem
  
  -- Metadados
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Quando foi cacheado
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Última atualização
  
  -- Índices para performance
  UNIQUE(store_id, nuvemshop_product_id)
);

-- ======================================================
-- ÍNDICES PARA PERFORMANCE
-- ======================================================

-- Índice para buscar lojas por usuário (comum)
CREATE INDEX IF NOT EXISTS idx_stores_user_id ON stores(user_id);

-- Índice para buscar lojas por store_id (comum)
CREATE INDEX IF NOT EXISTS idx_stores_nuvemshop_id ON stores(nuvemshop_store_id);

-- Índice para cache de produtos
CREATE INDEX IF NOT EXISTS idx_products_cache_store_id ON products_cache(store_id);
CREATE INDEX IF NOT EXISTS idx_products_cache_product_id ON products_cache(nuvemshop_product_id);

-- ======================================================
-- Executar este arquivo com:
-- psql -U postgres -d custom_glass_db -f schema.sql
-- ======================================================
