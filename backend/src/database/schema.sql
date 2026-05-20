-- ======================================================
-- SCHEMA DATABASE - CUSTOM GLASS NORTH VISION
-- ======================================================
-- All tables needed for OAuth 2.0 integration with Nuvemshop

-- ======================================================
-- TABLE: users
-- ======================================================
-- Stores user information
-- Each user can have multiple integrated stores
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255),
  nome VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ======================================================
-- TABLE: stores (Nuvemshop integrated stores)
-- ======================================================
-- Stores information of connected Nuvemshop stores
-- Each store is linked to a specific user
CREATE TABLE IF NOT EXISTS stores (
  id SERIAL PRIMARY KEY,
  nuvemshop_store_id INTEGER NOT NULL UNIQUE,
  nuvemshop_access_token VARCHAR(500) NOT NULL,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  store_name VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_stores_user FOREIGN KEY (user_id) REFERENCES users(id)
);

-- ======================================================
-- TABLE: products_cache (Product Cache)
-- ======================================================
-- Store product cache from the store
-- Avoids constant API calls
CREATE TABLE IF NOT EXISTS products_cache (
  id SERIAL PRIMARY KEY,
  store_id INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  nuvemshop_product_id INTEGER NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2),
  image_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(store_id, nuvemshop_product_id)
);

-- ======================================================
-- INDEXES FOR PERFORMANCE
-- ======================================================

CREATE INDEX IF NOT EXISTS idx_stores_user_id ON stores(user_id);
CREATE INDEX IF NOT EXISTS idx_stores_nuvemshop_id ON stores(nuvemshop_store_id);
CREATE INDEX IF NOT EXISTS idx_products_cache_store_id ON products_cache(store_id);
CREATE INDEX IF NOT EXISTS idx_products_cache_product_id ON products_cache(nuvemshop_product_id);

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
