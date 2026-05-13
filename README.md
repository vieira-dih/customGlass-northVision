# Custom Glass North Vision — Guia Completo de Instalação

Aplicação fullstack para catálogo de óculos com integração OAuth 2.0 à Nuvemshop.  
**Backend:** Node.js + Express + PostgreSQL  
**Frontend:** React + Vite

---

## Pré-requisitos

Instale as ferramentas abaixo antes de começar:

| Ferramenta | Versão mínima | Download |
|---|---|---|
| Node.js | 18+ | https://nodejs.org |
| npm | 9+ | (incluso no Node.js) |
| PostgreSQL | 14+ | https://www.postgresql.org/download |
| Git | qualquer | https://git-scm.com |

---

## 1. Clonar o repositório

```bash
git clone https://github.com/vieira-dih/customGlass-northVision.git
```
```bash
cd customGlass-northVision
```

---

## 2. Configurar o banco de dados PostgreSQL

### 2.1 Acessar o PostgreSQL

**Linux/macOS:**
```bash
sudo -u postgres psql
```

**Windows (via CMD ou PowerShell como Administrador):**
```Bash
psql -U postgres
```

### 2.2 Criar o banco de dados

```sql
CREATE DATABASE custom_glass_db;
\q
```

### 2.3 Aplicar o schema (tabelas e índices)

Execute o arquivo de schema a partir da **raiz do projeto**:

```bash
psql -U postgres -d custom_glass_db -f backend/src/database/schema.sql
```

Isso criará as tabelas:
- `users` — usuários da aplicação
- `stores` — lojas Nuvemshop conectadas
- `products_cache` — cache de produtos da API Nuvemshop

---

## 3. Configurar as variáveis de ambiente

O backend carrega o arquivo `.env` da **raiz do projeto** (`customGlass-northVision/.env`).

### 3.1 Criar o arquivo `.env`

Copie o template de exemplo:

```bash
# Linux/macOS
cp setup-guide/.env.example .env
```
```bash
# Windows (PowerShell)
Copy-Item setup-guide\.env.example .env
```

### 3.2 Gerar a chave JWT

Execute o comando abaixo para gerar uma chave segura de 64 caracteres hexadecimais:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copie o valor gerado — ele será usado em `JWT_SECRET`.

### 3.3 Preencher o arquivo `.env`

Abra `.env` na raiz do projeto e preencha **todas** as variáveis:

```env
# ==========================================
# BANCO DE DADOS
# ==========================================
DB_HOST=localhost
DB_PORT=5432
DB_NAME=custom_glass_db
DB_USER=postgres
DB_PASSWORD=SUA_SENHA_DO_POSTGRES_AQUI

# ==========================================
# NUVEMSHOP OAuth
# ==========================================
# Obter em: https://www.nuvemshop.com.br/admin/apps → sua app
NUVEMSHOP_CLIENT_ID=SEU_CLIENT_ID_AQUI
NUVEMSHOP_CLIENT_SECRET=SEU_CLIENT_SECRET_AQUI

# URL de callback registrada no painel da Nuvemshop
NUVEMSHOP_REDIRECT_URI=http://localhost:3000/auth/callback

# URL pública da loja Nuvemshop (para checkout)
STORE_PUBLIC_URL=https://sua-loja.lojavirtualnuvem.com.br

# ==========================================
# JWT
# ==========================================
# Cole aqui o valor gerado no passo 3.2
JWT_SECRET=CHAVE_GERADA_NO_PASSO_3_2_AQUI

# ==========================================
# SERVIDOR
# ==========================================
PORT=3000
NODE_ENV=development

# ==========================================
# FRONTEND
# ==========================================
FRONTEND_URL=http://localhost:5173
```

> **Nunca** commite o arquivo `.env` no Git. Ele já deve estar no `.gitignore`.

---

## 4. Obter credenciais da Nuvemshop

Se você ainda não tem um app criado na Nuvemshop:

1. Acesse **https://partners.nuvemshop.com.br**
2. crie sua conta 
3. Clique em **"Criar aplicativo"**
4. Preencha nome e descrição
5. Em **"URLs de redirecionamento"**, adicione exatamente:
   ```
   http://localhost:3000/auth/callback
   ```
6. Salve e copie o **Client ID** e **Client Secret** para o `.env`

---

## 5. Instalar dependências

### Backend

```bash
cd backend
```
```bash
npm install
```
### Frontend

```bash
cd frontend
```
```bash
npm install
```
---

## 6. Iniciar a aplicação

Abra **dois terminais** separados.

### Terminal 1 — Backend

```bash
cd backend
```
```bash
npm run dev
```
Saída esperada:
```
✅ Nova conexão PostgreSQL estabelecida
🚀 Servidor rodando em http://localhost:3000
```

### Terminal 2 — Frontend

```bash
cd frontend
```
```bash
npm run dev
```

Saída esperada:
```
  VITE v7.x.x  ready in ...ms
  ➜  Local:   http://localhost:5173/
```

---

## 7. Verificar se está funcionando

### Health check do backend

Abra no navegador ou use curl:

```bash
curl http://localhost:3000
```

Resposta esperada:
```json
{
  "mensagem": "✅ API Custom Glass North Vision rodando",
  "versao": "2.0.0",
  "status": "OAuth 2.0 com PostgreSQL"
}
```

### Frontend

Acesse **http://localhost:5173** no navegador.

---

## 8. Fluxo de autenticação OAuth

1. Na interface, clique em **"Instalar aplicativo"**
2. Você será redirecionado para a Nuvemshop para autorizar o app
3. Após autorizar, a Nuvemshop redireciona para `http://localhost:3000/auth/callback`
4. O backend troca o `code` por um `access_token` e emite um **JWT**
5. O JWT é salvo no `localStorage` do navegador (`authToken` e `storeId`)
6. As requisições de produtos passam o JWT no header `Authorization: Bearer <token>`

---

## 9. Estrutura do projeto

```
customGlass-northVision/
├── .env                        ← arquivo de configuração (criar no passo 3)
├── backend/
│   ├── package.json
│   └── src/
│       ├── server.js           ← ponto de entrada do Express
│       ├── config/
│       │   └── database.js     ← pool de conexão PostgreSQL
│       ├── controllers/
│       │   ├── authController.js
│       │   └── productController.js
│       ├── database/
│       │   └── schema.sql      ← script SQL das tabelas
│       ├── middleware/
│       │   └── auth.middleware.js
│       ├── models/
│       │   └── store.model.js
│       ├── routes/
│       │   ├── auth.routes.js
│       │   └── productRoutes.js
│       └── services/
│           ├── auth.service.js     ← lógica OAuth + JWT
│           └── nuvemshopService.js ← chamadas à API Nuvemshop
├── frontend/
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── App.jsx
│       ├── components/
│       ├── pages/
│       │   ├── Home/
│       │   ├── ProductPage/
│       │   └── AuthCallback/   ← página que recebe o redirect OAuth
│       └── services/
│           └── api.js          ← todas as chamadas HTTP ao backend
└── setup-guide/
    ├── .env.example            ← template de variáveis de ambiente
    └── README.md
```

---

## 10. Rotas disponíveis da API

| Método | Rota | Autenticação | Descrição |
|---|---|---|---|
| GET | `/` | Não | Health check |
| GET | `/auth/nuvemshop` | Não | Inicia fluxo OAuth |
| GET | `/auth/callback` | Não | Recebe código OAuth da Nuvemshop |
| GET | `/auth/verify` | JWT | Valida token e retorna dados da loja |
| GET | `/auth/stores` | JWT | Lista lojas conectadas do usuário |
| GET | `/auth/validate-with-nuvemshop` | JWT | Testa token na API da Nuvemshop |
| DELETE | `/auth/stores/:storeId` | JWT | Desconecta uma loja |
| POST | `/auth/test-token` | Não | Diagnóstico de token |
| GET | `/api/products/:storeId` | JWT | Busca produtos da loja |

---

## 11. Solução de problemas

### Erro: `ECONNREFUSED` ao conectar ao banco

- Verifique se o serviço PostgreSQL está rodando:
 ```bash
  # Linux
  sudo systemctl status postgresql
```
```bash
  # Windows PowerShell como Admin
  Get-Service postgresql*
  ```
- Confirme que `DB_HOST`, `DB_PORT`, `DB_USER` e `DB_PASSWORD` no `.env` estão corretos.

### Erro: `invalid_client` no OAuth

- Verifique se `NUVEMSHOP_CLIENT_ID` e `NUVEMSHOP_CLIENT_SECRET` estão corretos.
- Confirme que `NUVEMSHOP_REDIRECT_URI` no `.env` é **idêntico** ao cadastrado no painel da Nuvemshop.

### Erro: `JsonWebTokenError` / token inválido

- Confirme que `JWT_SECRET` no `.env` não está vazio.
- Se trocou o valor de `JWT_SECRET`, os tokens antigos (salvos no navegador) deixam de funcionar — limpe o `localStorage` e faça o fluxo OAuth novamente.

### Frontend não consegue falar com o backend

- Confirme que o backend está rodando na porta `3000`.
- Verifique se `FRONTEND_URL=http://localhost:5173` está no `.env` (necessário para o CORS).
- A URL da API está hardcoded em `frontend/src/services/api.js` como `http://localhost:3000/api` — não mude a porta do backend sem atualizar esse arquivo.

### Schema já existe / erro de índice duplicado

O schema usa `CREATE TABLE IF NOT EXISTS` e `CREATE INDEX IF NOT EXISTS`, portanto é seguro executá-lo novamente sem apagar dados.

---

## 12. Checklist rápido

Antes de reportar qualquer problema, confirme:

- [ ] Node.js 18+ instalado (`node --version`)
- [ ] PostgreSQL rodando e acessível
- [ ] Banco `custom_glass_db` criado
- [ ] Schema aplicado (`schema.sql`)
- [ ] Arquivo `.env` na **raiz** do projeto (não dentro de `backend/`)
- [ ] Todas as variáveis do `.env` preenchidas (sem valores `_AQUI`)
- [ ] `npm install` executado em `backend/` e em `frontend/`
- [ ] Backend rodando na porta `3000`
- [ ] Frontend rodando na porta `5173`
- [ ] URL de callback registrada na Nuvemshop exatamente como `http://localhost:3000/auth/callback`
