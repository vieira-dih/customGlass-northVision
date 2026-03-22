# 🛒 Integração Nuvem Shop - Guia Completo

## 📋 Visão Geral

Este projeto agora possui integração completa com **Nuvem Shop API**, permitindo:
- ✅ Buscar produtos da sua loja Nuvem Shop
- ✅ Criar carrinhos com dados de clientes
- ✅ Adicionar/remover produtos do carrinho
- ✅ Atualizar quantidades
- ✅ Gerenciar carrinho no frontend

---

## 🔐 Configuração das Credenciais

### Passo 1: Obter Token e ID da Loja

1. Acesse [Nuvem Shop](https://www.nuvemshop.com.br)
2. Vá em **Painel Administrativo > Configurações > Aplicações e Integrações > Tokens de Acesso**
3. Clique em **Criar Novo Token**
4. Copie o **Token** e o **ID da Loja**

### Passo 2: Configurar .env

1. Abra `backend/.env`
2. Preencha com seus dados:

```env
NUVEMSHOP_TOKEN=seu_token_aqui
NUVEMSHOP_STORE_ID=seu_id_aqui
```

3. Salve o arquivo

⚠️ **NUNCA** commite o arquivo `.env` no Git! Ele já está no `.gitignore`

---

## 🚀 Iniciando os Servidores

### Terminal 1 - Backend

```bash
cd backend
npm install  # Apenas na primeira vez
npm run dev
```

Você deve ver: `Servidor rodando na porta 3000`

### Terminal 2 - Frontend

```bash
cd frontend
npm install  # Apenas na primeira vez
npm run dev
```

Você deve ver algo como: `Local: http://localhost:5173`

---

## 📡 Endpoints da API

### Produtos

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/products` | Lista todos os produtos |
| GET | `/api/products/:id` | Obtém um produto específico |

### Carrinho

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/cart` | Cria novo carrinho |
| POST | `/api/cart/:customerId/:cartId/items` | Adiciona produto |
| GET | `/api/cart/:customerId/:cartId` | Obtém carrinho |
| PUT | `/api/cart/:customerId/:cartId/items/:itemId` | Atualiza quantidade |
| DELETE | `/api/cart/:customerId/:cartId/items/:itemId` | Remove produto |

---

## ✅ Testando a Integração

### Teste 1: Produtos (Direto no Browser)

Abra no navegador:
```
http://localhost:3000/api/products
```

Você deve ver um JSON com os produtos da sua loja Nuvem Shop.

### Teste 2: Verificar Frontend

1. Abra `http://localhost:5173` (página inicial)
2. Você deve ver o catálogo carregando os produtos reais
3. Se der erro, confira:
   - Backend está rodando?
   - As credenciais estão corretas?
   - Console do navegador (F12) mostra algum erro?

### Teste 3: Criar Carrinho (com Postman/Insomnia)

**Requisição:**
```
POST http://localhost:3000/api/cart
Content-Type: application/json

{
  "name": "João Silva",
  "email": "joao@example.com",
  "cpf": "12345678900",
  "phone": "11999999999"
}
```

**Resposta esperada:**
```json
{
  "mensagem": "Carrinho criado com sucesso",
  "customerId": 123456,
  "cartId": 789012,
  "cart": { ... }
}
```

⚠️ Salve os valores de `customerId` e `cartId` para os próximos testes!

### Teste 4: Adicionar ao Carrinho

**Requisição:**
```
POST http://localhost:3000/api/cart/123456/789012/items
Content-Type: application/json

{
  "product_id": 1,
  "quantity": 1,
  "variant_id": null
}
```

(Substitua os IDs pelos valores reais)

---

## 📁 Estrutura de Arquivos

```
backend/
├── src/
│   ├── server.js                 ← Servidor principal
│   ├── controllers/
│   │   └── productController.js  ← Lógica dos endpoints
│   ├── routes/
│   │   └── productRoutes.js      ← Definição de rotas
│   └── services/
│       └── nuvemshopService.js   ← Integração com API Nuvem Shop
├── .env                          ← Credenciais (não commitar!)
└── .env.example                  ← Template

frontend/
├── src/
│   ├── services/
│   │   └── api.js                ← Cliente HTTP para o backend
│   └── pages/
│       └── Home/
│           └── Home.jsx          ← Página que busca produtos
```

---

## 🔧 Estrutura de Dados

### Objeto Produto (Nuvem Shop)

```javascript
{
  id: 1,
  name: "Radar EV",
  slug: "radar-ev",
  price: 199.90,
  image: {
    src: "https://..."
  },
  images: [
    { src: "https://..." }
  ],
  description: "...",
  visibility: "visible"
}
```

### Objeto Cliente (ao criar carrinho)

```javascript
{
  name: "João Silva",
  email: "joao@example.com",
  cpf: "12345678900",
  phone: "11999999999"
}
```

### Objeto Item do Carrinho

```javascript
{
  product_id: 1,
  quantity: 2,
  variant_id: null,  // Para produtos com variações
  price: 199.90,
  subtotal: 399.80
}
```

---

## 🎯 Próximas Implementações

- [ ] Integrar carrinho na página ProductPage
- [ ] Salvar carrinho em LocalStorage no navegador
- [ ] Criar página de Carrinho com resumo de compras
- [ ] Implementar checkout com Nuvem Shop
- [ ] Adicionar sistema de cupons
- [ ] Integrar formas de pagamento

---

## ❌ Troubleshooting

### "Erro ao buscar produtos"

**Solução:**
1. Verifique se backend está rodando: `npm run dev` no terminal
2. Verifique .env: `NUVEMSHOP_TOKEN` e `NUVEMSHOP_STORE_ID` estão preenchidos?
3. Verifique console do navegador (F12) para mais detalhes

### "CORS Error"

**Solução:**
- O CORS já está configurado no backend (`app.use(cors())`)
- Se persistir, reinicie o servidor

### "401 Unauthorized"

**Solução:**
- Token ou ID da loja estão incorretos
- Gere um novo token nas configurações da Nuvem Shop

### "Carrinho não está salvando"

**Solução:**
- `customerId` e `cartId` precisam estar corretos
- Verifique se o cliente foi criado com sucesso (status 201)

---

## 📚 Documentação Oficial

- [API Nuvem Shop](https://nuvemshop.com.br/developers)
- [Postman Collection](https://www.postman.com/nuvemshop/workspace)

---

## 💡 Dicas

- Use Postman ou Insomnia para testar endpoints rapidamente
- Ative DevTools (F12) no navegador para ver erros
- Verifique os logs do terminal do backend para debugging
- Todos os valores `customerId` e `cartId` são únicos por cliente

---

**Status**: ✅ Integração completa e funcional

Alguma dúvida? Revise a seção de Troubleshooting ou consulte a documentação oficial da Nuvem Shop!
