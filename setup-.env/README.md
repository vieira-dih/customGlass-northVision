# Backend - Custom Glass North Vision

## 🚀 Setup Inicial

### 1. Clonar repositório e instalar dependências

```bash
git clone <seu-repositorio>
cd customGlass-northVision/backend
npm install
```

### 2. Configurar variáveis de ambiente

```bash
# Copiar o template
cp .env.example .env

# Editar .env com seus valores reais
nano .env  # ou use seu editor favorito
```

### 3. Preencher as variáveis obrigatórias

**Banco de Dados:**
- `DB_HOST`: localhost (ou seu servidor PostgreSQL)
- `DB_PORT`: 5432 (padrão PostgreSQL)
- `DB_NAME`: custom_glass_db (criar antes)
- `DB_USER`: postgres (ou seu usuário)
- `DB_PASSWORD`: sua senha PostgreSQL

**OAuth Nuvemshop:**
- `NUVEMSHOP_CLIENT_ID`: Obter em https://www.nuvemshop.com.br/admin/apps
- `NUVEMSHOP_CLIENT_SECRET`: Obter em https://www.nuvemshop.com.br/admin/apps
- `NUVEMSHOP_REDIRECT_URI`: Deve ser http://localhost:3000/auth/callback

**JWT:**
- `JWT_SECRET`: Gerar chave segura com:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 4. Criar banco de dados

```bash
psql -U postgres
CREATE DATABASE custom_glass_db;
```

### 5. Aplicar schema

```bash
psql -U postgres -d custom_glass_db -f src/database/schema.sql
```

### 6. Iniciar servidor

```bash
npm run dev
```

O servidor estará em `http://localhost:3000`

---

## 📁 Estrutura de Pastas

```
backend/
├── src/
│   ├── config/           # Configuração de banco de dados
│   ├── controllers/      # Lógica dos endpoints
│   ├── middleware/       # Autenticação JWT
│   ├── models/           # Funções de banco de dados
│   ├── routes/           # Definição de rotas
│   ├── services/         # Lógica de negócio
│   ├── database/         # Schema SQL
│   └── server.js         # Entrada da aplicação
├── package.json
├── .env                  # ⚠️ NÃO commitar (em .gitignore)
├── .env.example          # ✅ Template para novo setup
└── .gitignore
```

---

## 🔐 Variáveis de Ambiente

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `DB_HOST` | Host do PostgreSQL | localhost |
| `DB_PORT` | Porta do PostgreSQL | 5432 |
| `DB_NAME` | Nome do banco | custom_glass_db |
| `DB_USER` | Usuário PostgreSQL | postgres |
| `DB_PASSWORD` | Senha PostgreSQL | minha_senha |
| `NUVEMSHOP_CLIENT_ID` | ID do app Nuvemshop | 28015 |
| `NUVEMSHOP_CLIENT_SECRET` | Secret do app | abc123... |
| `NUVEMSHOP_REDIRECT_URI` | URL callback OAuth | http://localhost:3000/auth/callback |
| `JWT_SECRET` | Chave para assinar JWT | abc123def456... |
| `PORT` | Porta do servidor | 3000 |
| `NODE_ENV` | Ambiente | development |
| `FRONTEND_URL` | URL do frontend | http://localhost:5173 |

---

## 🛠️ Scripts Disponíveis

```bash
npm run dev      # Iniciar com nodemon (reload automático)
npm run start    # Iniciar em produção
npm test         # Rodar testes (se configurado)
```

---

## ⚠️ Importante

- ❌ **Nunca commitar `.env`** - está em `.gitignore`
- ✅ **Sempre commitar `.env.example`** - para documentar quais variáveis são necessárias
- 🔐 **Manter `NUVEMSHOP_CLIENT_SECRET` seguro** - nunca compartilhar
- 🛡️ **Em produção:** usar variáveis de ambiente do servidor, não arquivo `.env`

---

## 🐛 Troubleshooting

**Erro: "autenticação do tipo senha falhou"**
- Verifique se `DB_PASSWORD` está correto
- Confirme que PostgreSQL está rodando: `sudo service postgresql status`

**Erro: "NUVEMSHOP_CLIENT_ID is undefined"**
- Copie `.env.example` para `.env`
- Preencha as credenciais do Nuvemshop

**Erro: "Cannot find module 'pg'"**
- Rode `npm install` novamente

---

## 📞 Suporte

Para mais informações, consulte os arquivos de documentação:
- `SETUP_OAUTH_POSTGRESQL.md` - Setup inicial
- `ANALISE_OAUTH_MIGRATION.md` - Arquitetura
- `docs/GUIA_ARQUIVOS_COMENTADO.md` - Explicação dos arquivos
