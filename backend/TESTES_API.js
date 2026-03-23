/**
 * GUIA DE TESTES - Integração Nuvem Shop
 * 
 * Este arquivo documenta como testar os endpoints da integração com Nuvem Shop
 * Use uma ferramenta como Postman, Insomnia ou Thunder Client para fazer as requisições
 */

// ============= VERIFICAÇÃO PRÉ-TESTES =============

/*
ANTES DE COMEÇAR OS TESTES:

1. Verifique se as variáveis de ambiente estão configuradas:
   - Abra o arquivo: backend/.env
   - Certifique-se de que NUVEMSHOP_TOKEN e NUVEMSHOP_STORE_ID estão preenchidos
   - Se não tiver:
     a) Acesse: https://www.nuvemshop.com.br
     b) Vá em: Configurações > Aplicações e Integrações > Tokens de Acesso
     c) Gere um novo token e copie o ID da loja

2. Inicie o servidor backend:
   cd backend
   npm install  (se não tiver feito)
   npm run dev
   
   Você deve ver: "Servidor rodando na porta 3000"

3. Se estiver testando o frontend, inicie em outro terminal:
   cd frontend
   npm install  (se não tiver feito)
   npm run dev
   
   Você deve ver algo como: "Local: http://localhost:5173"
*/

// ============= TESTES DE PRODUTOS =============

/**
 * ✅ TESTE 1: Listar todos os produtos
 * 
 * Método: GET
 * URL: http://localhost:3000/api/products
 * Headers: Nenhum adicional necessário
 * Body: Vazio
 * 
 * Resposta esperada: Array de objetos com produtos
 * {
 *   "products": [
 *     {
 *       "id": 1,
 *       "name": "Radar EV",
 *       "slug": "radar-ev",
 *       "image": { "src": "..." }
 *     },
 *     ...
 *   ]
 * }
 */

/**
 * ✅ TESTE 2: Obter um produto específico
 * 
 * Método: GET
 * URL: http://localhost:3000/api/products/1
 * (Troque o "1" pelo ID real de um produto da sua loja)
 * Headers: Nenhum adicional necessário
 * Body: Vazio
 * 
 * Resposta esperada: Objeto do produto
 */

// ============= TESTES DE CARRINHO =============

/**
 * ✅ TESTE 3: Criar um novo carrinho
 * 
 * Método: POST
 * URL: http://localhost:3000/api/cart
 * Headers:
 *   Content-Type: application/json
 * 
 * Body (JSON):
 * {
 *   "name": "João Silva",
 *   "email": "joao@example.com",
 *   "cpf": "12345678900",
 *   "phone": "11999999999"
 * }
 * 
 * Resposta esperada:
 * {
 *   "mensagem": "Carrinho criado com sucesso",
 *   "customerId": 123456,      ← GUARDE ESTE VALOR
 *   "cartId": 789012,           ← GUARDE ESTE VALOR
 *   "cart": { ... }
 * }
 * 
 * ⚠️ IMPORTANTE: Você precisará dos valores customerId e cartId para os próximos testes!
 */

/**
 * ✅ TESTE 4: Adicionar produto ao carrinho
 * 
 * Método: POST
 * URL: http://localhost:3000/api/cart/{customerId}/{cartId}/items
 * (Substitua {customerId} e {cartId} pelos valores obtidos no TESTE 3)
 * 
 * Headers:
 *   Content-Type: application/json
 * 
 * Body (JSON):
 * {
 *   "product_id": 1,     ← ID de um produto real da sua loja
 *   "quantity": 1,
 *   "variant_id": null
 * }
 * 
 * Resposta esperada:
 * {
 *   "mensagem": "Produto adicionado ao carrinho",
 *   "item": { ... }
 * }
 */

/**
 * ✅ TESTE 5: Obter detalhes do carrinho
 * 
 * Método: GET
 * URL: http://localhost:3000/api/cart/{customerId}/{cartId}
 * (Substitua pelos valores do seu carrinho)
 * 
 * Headers: Nenhum adicional necessário
 * Body: Vazio
 * 
 * Resposta esperada:
 * {
 *   "id": 789012,
 *   "items": [
 *     {
 *       "id": "item123",
 *       "product_id": 1,
 *       "quantity": 1,
 *       "price": 99.90
 *     }
 *   ],
 *   "subtotal": 99.90,
 *   "total": 99.90
 * }
 */

/**
 * ✅ TESTE 6: Atualizar quantidade no carrinho
 * 
 * Método: PUT
 * URL: http://localhost:3000/api/cart/{customerId}/{cartId}/items/{itemId}
 * 
 * Headers:
 *   Content-Type: application/json
 * 
 * Body (JSON):
 * {
 *   "quantity": 5
 * }
 * 
 * Resposta esperada:
 * {
 *   "mensagem": "Quantidade atualizada",
 *   "item": { "quantity": 5, ... }
 * }
 */

/**
 * ✅ TESTE 7: Remover produto do carrinho
 * 
 * Método: DELETE
 * URL: http://localhost:3000/api/cart/{customerId}/{cartId}/items/{itemId}
 * 
 * Headers: Nenhum adicional necessário
 * Body: Vazio
 * 
 * Resposta esperada:
 * {
 *   "mensagem": "Produto removido do carrinho com sucesso"
 * }
 */

// ============= TESTES DO FRONTEND =============

/*
Para testar a integração no frontend:

1. Frontend deve buscar produtos automaticamente quando a Home carregar
2. Se os produtos aparecerem na página, a integração está funcionando!
3. Se der erro, verifique:
   - Backend está rodando na porta 3000?
   - As variáveis de ambiente estão corretas?
   - Há erro no console do navegador (F12)?
   - Há erro no terminal do backend?

4. Futuros testes (após implementar carrinho no ProductPage):
   - Clique em "Personalizar" de um produto
   - Selecione as variações desejadas
   - Clique em "Adicionar ao carrinho"
   - Verifique se aparece mensagem de sucesso
*/

export default {}
