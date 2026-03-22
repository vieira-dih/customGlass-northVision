# 🚀 Guia de Implementação: OAuth 2.0 + PostgreSQL

## ✅ O que foi implementado?

Uma arquitetura OAuth 2.0 profissional com:
- ✅ Fluxo de autorização seguro com Nuvemshop
- ✅ PostgreSQL para armazenar tokens com segurança
- ✅ JWT para autenticação de usuários
- ✅ Middleware de proteção de rotas
- ✅ Arquitetura em camadas (Controllers, Services, Models)
- ✅ Suporte a múltiplas lojas por usuário (Multi-tenant)

---

## 🗄️ PASSO 1: Configurar PostgreSQL

### 1.1 Instalar PostgreSQL

**Windows:**
1. Download: https://www.postgresql.org/download/windows/
2. Execute o instalador
3. Anote a senha do usuário `postgres`
4. Deixar porta padrão: 5432

**macOS (com Homebrew):**
```bash
brew install postgresql
brew services start postgresql
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt-get install postgresql postgresql-contrib
sudo service postgresql start
```

### 1.2 Criar o banco de dados

Abra o terminal ou PowerShell:

```bash
# Conectar ao PostgreSQL com usuário admin
psql -U postgres

# Quando pedir senha, digitar a senha do PostgreSQL
```

Dentro do `psql`, execute:

```sql
-- Criar usuário para a aplicação
CREATE USER custom_glass WITH PASSWORD 'senha_segura_aqui';

-- Dar privilégios ao usuário
ALTER USER custom_glass SUPERUSER;

-- Criar banco de dados
CREATE DATABASE custom_glass_db OWNER custom_glass;

-- Listar bancos para verificar
\l

-- Sair do psql
\q
```

### 1.3 Criar as tabelas (schema)

```bash
# Conectar ao banco novo
psql -U custom_glass -d custom_glass_db

# Copiar e colar o conteúdo do arquivo: backend/src/database/schema.sql
# Ou executar direto:

psql -U custom_glass -d custom_glass_db -f backend/src/database/schema.sql
```

Resultado esperado:
```
CREATE TABLE
CREATE TABLE
CREATE TABLE
CREATE INDEX
...
```

### 1.4 Verificar se funcionou

```bash
# Conectar ao banco
psql -U custom_glass -d custom_glass_db

# Ver tabelas
\dt

# Sair
\q
```

Você deve ver:
```
 public | products_cache | table | custom_glass
 public | stores         | table | custom_glass
 public | users          | table | custom_glass
```

---

## 🔐 PASSO 2: Configurar Credenciais OAuth

### 2.1 Configurar variáveis de ambiente

Abra `backend/.env` e preencha:

```env
# ===== NUVEMSHOP OAUTH 2.0 =====
NUVEMSHOP_CLIENT_ID=SEU_CLIENT_ID_AQUI
NUVEMSHOP_CLIENT_SECRET=SEU_CLIENT_SECRET_AQUI
NUVEMSHOP_REDIRECT_URI=http://localhost:3000/auth/callback

# ===== POSTGRESQL =====
DB_HOST=localhost
DB_PORT=5432
DB_NAME=custom_glass_db
DB_USER=custom_glass
DB_PASSWORD=senha_segura_aqui

# ===== JWT =====
JWT_SECRET=chave_super_secreta_mudarprodution_12345

# ===== AMBIENTE =====
NODE_ENV=development
PORT=3000
```

⚠️ **IMPORTANTE**: Mude `JWT_SECRET` para algo seguro!

```bash
# Gerar JWT_SECRET seguro no terminal:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## ✅ PASSO 3: Testar a Implementação

### 3.1 Iniciar o servidor

```bash
cd backend
npm run dev
```

Você deve ver:
```
✅ Servidor rodando com sucesso!
🚀 Porta: 3000
🔗 URL: http://localhost:3000
```

Se der erro de conexão com banco:
```
❌ Falha ao conectar com banco de dados
```

Verifique:
- PostgreSQL está rodando?
- Credenciais em `.env` estão corretas?
- Banco `custom_glass_db` existe?

### 3.2 Testar Health Check

```bash
curl http://localhost:3000/
```

Resposta esperada:
```json
{
  "mensagem": "✅ API Custom Glass North Vision rodando",
  "versao": "2.0.0",
  "status": "OAuth 2.0 com PostgreSQL"
}
```

---

## 🔑 PASSO 4: Testar Fluxo OAuth

### 4.1 Obter Client ID e Secret

1. Acesse: https://www.nuvemshop.com.br/apps/authorize
2. Crie uma nova aplicação
3. Copie o `CLIENT_ID` e `CLIENT_SECRET`
4. Registre a URL: `http://localhost:3000/auth/callback`

### 4.2 Iniciar fluxo OAuth (Navegador)

Abra no navegador:
```
http://localhost:3000/auth/nuvemshop
```

Você será redirecionado para Nuvemshop para autorizar.

Após autorizar, você será redirecionado para:
```
/auth/callback?code=...&store_id=...
```

E depois para o frontend com o JWT na URL.

### 4.3 Testar Endpoints com curl/Postman

**Obter novo JWT para testar:**

Após completar auth, pegue o token da URL de callback.

**Verificar JWT:**
```bash
curl -H "Authorization: Bearer SEU_JWT_AQUI" \
  http://localhost:3000/auth/verify
```

**Listar lojas do usuário:**
```bash
curl -H "Authorization: Bearer SEU_JWT_AQUI" \
  http://localhost:3000/auth/stores
```

**Listar produtos (precisa do storeId):**
```bash
curl -H "Authorization: Bearer SEU_JWT_AQUI" \
  http://localhost:3000/api/products/STORE_ID_AQUI
```

---

## 📊 Arquitetura Criada

```
backend/src/
├── config/
│   └── database.js              ← Conexão PostgreSQL
├── middleware/
│   └── auth.middleware.js       ← Validar JWT
├── models/
│   └── store.model.js           ← Queries do banco
├── services/
│   ├── auth.service.js          ← Lógica OAuth
│   └── nuvemshopService.js      ← API Nuvemshop (refatorado)
├── controllers/
│   ├── authController.js        ← Endpoints OAuth
│   └── productController.js     ← Endpoints Produtos (refatorado)
├── routes/
│   ├── auth.routes.js           ← Rotas OAuth
│   └── productRoutes.js         ← Rotas Produtos (refatorado)
├── database/
│   └── schema.sql               ← DDL tabelas
└── server.js                    ← Aplicação principal
```

---

## 🔄 Fluxo de Dados (Novo)

```
1. Frontend: "Conectar com Nuvemshop"
   ↓
2. Backend: GET /auth/nuvemshop
   ↓
3. Redireciona para: Nuvemshop (authorization URL)
   ↓
4. Usuário autoriza
   ↓
5. Nuvemshop redireciona: /auth/callback?code=...&store_id=...
   ↓
6. Backend: Troca code por access_token
   ↓
7. Backend: Salva no PostgreSQL (tabela stores)
   ↓
8. Backend: Gera JWT para frontend
   ↓
9. Frontend: Armazena JWT em LocalStorage
   ↓
10. Frontend: Incluir "Authorization: Bearer JWT" em todas requisições
    ↓
11. Backend: Valida JWT via middleware
    ↓
12. Backend: Busca access_token do banco
    ↓
13. Backend: Chama API Nuvemshop
    ↓
14. Retorna dados para frontend
```

---

## 📁 Próximas Implementações

- [ ] Sistema de login/registro de usuários
- [ ] Página de callback OAuth no frontend
- [ ] Integrar JWT no frontend (LocalStorage)
- [ ] Carrinho de compras
- [ ] Checkout com Nuvemshop
- [ ] Dashboard de lojas
- [ ] Refresh de tokens automático

---

## ❌ Troubleshooting

### "Erro ao conectar com banco de dados"

**Solução:**
```bash
# 1. Verificar se PostgreSQL está rodando
psql -U postgres

# 2. Verificar se banco existe
\l

# 3. Verificar credenciais no .env
# 4. Recrear banco se necessário
dropdb -U postgres custom_glass_db
createdb -U postgres custom_glass_db
psql -U custom_glass -d custom_glass_db -f backend/src/database/schema.sql
```

### "Token inválido"

**Solução:**
- JWT expirou? (expira em 24h)
- JWT_SECRET mudou? (regenere novo token)
- Token malformado? (copie corretamente)

### "Code not found in URL"

**Solução:**
- Nuvemshop não recebeu a requisição de autorização?
- Verifique se CLIENT_ID está correto
- Verifique se REDIRECT_URI está registrado no Nuvemshop

---

## 🎯 Status

✅ **Implementação Concluída!**

Você tem agora:
- ✅ Autenticação OAuth 2.0 segura
- ✅ JWT para sessões
- ✅ PostgreSQL para armazenamento
- ✅ Arquitetura profissional
- ✅ Pronto para adicionar mais funcionalidades

---

**Próximo passo: Integrar JWT no frontend!** 🚀
