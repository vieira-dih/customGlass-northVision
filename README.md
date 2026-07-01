# Custom Glass North Vision - Guia Oficial para Subida via Docker (Trilha A)

Este documento foi organizado para a apresentacao da Trilha A:
- orquestracao completa com Docker Compose
- servicos saudaveis com healthcheck
- persistencia de dados no banco
- comunicacao entre containers
- validacao por comandos reproduziveis

## 1. Escopo da entrega

Stack containerizada com 3 servicos:
- frontend: React/Vite servido por Nginx
- backend: Node.js + Express
- db: PostgreSQL 15

## 2. Arquivos que comprovam a Trilha A

- docker-compose.yml
- backend/Dockerfile
- backend/.dockerignore
- frontend/Dockerfile
- frontend/nginx.conf
- frontend/.dockerignore

## 3. Requisitos atendidos (checklist do professor)

### 3.1 Dockerfile otimizado
- base Alpine
- build em camadas eficientes
- imagens finais menores
- usuario nao-root
- healthcheck

### 3.2 Docker Compose completo
- 3 servicos: frontend, backend, db
- depends_on com condition: service_healthy
- restart: unless-stopped
- rede interna dedicada

### 3.3 Persistencia e disponibilidade
- volume nomeado do PostgreSQL
- inicializacao do schema via mount
- healthchecks nos servicos

### 3.4 Documentacao e evidencia
- passo a passo de subida
- comandos de validacao
- resultado esperado por teste
- roteiro de demonstracao

## 4. Pre-requisitos

- Docker Desktop instalado e rodando
- Docker Compose habilitado (docker compose)
- porta 80 disponivel
- arquivo .env configurado na raiz do projeto

Validacao inicial:

docker --version
docker compose version

## 5. Configuracao de ambiente

1. Copie o modelo de variaveis:

copy .env.example .env

2. Preencha no .env, no minimo, os campos abaixo:
- DB_PASSWORD
- NUVEMSHOP_CLIENT_ID
- NUVEMSHOP_CLIENT_SECRET
- NUVEMSHOP_REDIRECT_URI
- JWT_SECRET
- ADMIN_SECRET
- STORE_PUBLIC_URL

3. Se voce nao tiver conta no Nuvemshop Partners, faca isto primeiro:
- acesse o portal de desenvolvedores da Nuvemshop / Partners
- crie uma conta de desenvolvedor ou entre com sua conta existente
- crie um novo app para este projeto
- copie o Client ID e o Client Secret gerados pelo painel do app
- cadastre a URL de redirecionamento exatamente como o projeto usa

4. Como preencher cada variavel:

### DB_PASSWORD
- escolha uma senha forte para o PostgreSQL local
- esta senha vai para o .env e tambem precisa bater com o docker-compose.yml
- se quiser gerar uma senha forte, use:

node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

### NUVEMSHOP_CLIENT_ID
- pegue no painel do app criado dentro do Nuvemshop Partners
- normalmente aparece na tela de configuracao do app como Client ID ou App ID

### NUVEMSHOP_CLIENT_SECRET
- pegue no mesmo painel do app
- este valor e secreto e nao deve ser compartilhado em print, commit ou README

### NUVEMSHOP_REDIRECT_URI
- use exatamente a URL cadastrada no app da Nuvemshop
- para este projeto local, a URL esperada e:

http://localhost:3000/auth/callback

- se mudar essa URL, o backend e o app da Nuvemshop precisam ficar iguais

### STORE_PUBLIC_URL
- informe a URL publica da loja Nuvemshop que sera integrada
- exemplo: https://sua-loja.nuvemshop.com.br
- este valor vem da loja da sua empresa ou da loja de testes usada na avaliacao

### JWT_SECRET
- chave usada para assinar o login do lojista no backend
- gere uma string longa e aleatoria
- nao reutilize senhas comuns nem palavras do dicionario

### ADMIN_SECRET
- segredo usado para criar o primeiro lojista ou contas administrativas
- gere um valor forte e unico, diferente do JWT_SECRET
- use apenas no cadastro interno, nunca no frontend

5. Modelo pratico de preenchimento:

- DB_PASSWORD=uma_senha_forte_aqui
- NUVEMSHOP_CLIENT_ID=seu_client_id_aqui
- NUVEMSHOP_CLIENT_SECRET=seu_client_secret_aqui
- NUVEMSHOP_REDIRECT_URI=http://localhost:3000/auth/callback
- STORE_PUBLIC_URL=https://sua-loja.nuvemshop.com.br
- JWT_SECRET=uma_chave_longa_e_aleatoria
- ADMIN_SECRET=outro_segredo_longo_e_aleatorio

6. Regra de seguranca:
- nao versionar .env
- nao compartilhar secrets em print, commit ou README

7. Se voce estiver criando o app pela primeira vez, a ordem correta e:
- criar conta no Nuvemshop Partners
- criar o app
- copiar Client ID e Client Secret
- cadastrar a Redirect URI do projeto
- preencher o .env
- subir os containers com docker compose up -d --build
- testar o login OAuth

## 6. Subida da stack Docker

No diretorio raiz do projeto:

docker compose up -d --build

Conferir estado:

docker compose ps

Conferir logs:

docker compose logs --tail=100

## 7. Enderecos de acesso

- Frontend: http://localhost
- Backend (host): http://localhost:3000
- Banco (interno): db:5432

Observacao:
- o frontend usa proxy no Nginx para /api e /auth

## 8. Validacao obrigatoria para apresentacao

### Teste 1 - Saude dos containers

docker compose ps

Esperado:
- customglass_frontend: healthy
- customglass_backend: healthy
- customglass_db: healthy

### Teste 2 - Banco aceitando conexoes

docker exec customglass_db pg_isready -U postgres -d custom_glass_db

Esperado:
- accepting connections

### Teste 3 - Query simples no banco

docker exec customglass_db psql -U postgres -d custom_glass_db -c "select 1;"

Esperado:
- retorno com valor 1

### Teste 4 - Health do frontend

docker exec customglass_frontend wget -q --spider http://127.0.0.1:80/health

Esperado:
- comando finaliza sem erro (codigo 0)

### Teste 5 - Rota publica de produtos via proxy

docker exec customglass_frontend wget -q -O- http://127.0.0.1/api/public/products

Esperado:
- resposta JSON valida
- se nao houver loja integrada, pode retornar lista vazia sem caracterizar falha da stack

## 9. Evidencias que devem ser mostradas ao professor

Capturar print de:
1. docker compose ps com os 3 servicos healthy
2. pg_isready com accepting connections
3. select 1 no PostgreSQL
4. teste de /health do frontend
5. retorno de /api/public/products

## 10. Roteiro de apresentacao (2 a 5 minutos)

1. Mostrar os arquivos de Docker no repositorio
2. Executar docker compose up -d --build
3. Mostrar docker compose ps
4. Rodar testes 2, 3, 4 e 5
5. Mostrar logs curtos: docker compose logs --tail=30
6. Finalizar com docker compose down

## 11. Solucao de problemas rapida

### 11.1 Frontend unhealthy

docker compose up -d --build frontend
docker exec customglass_frontend wget -q --spider http://127.0.0.1:80/health

### 11.2 Backend indisponivel

docker compose logs backend --tail=100
docker compose restart backend

### 11.3 Banco com falha de inicializacao

docker compose logs db --tail=100

Se precisar resetar dados locais para teste limpo:

docker compose down -v
docker compose up -d --build

### 11.4 Comandos de pausa no PowerShell

Evite timeout /t 5 > nul no PowerShell.
Use:

Start-Sleep -Seconds 5

## 12. Encerramento da execucao

Parar mantendo volume:

docker compose down

Parar removendo volumes:

docker compose down -v

## 13. Seguranca e credenciais

Regras obrigatorias:
1. Nunca commitar .env
2. Nunca colocar segredo real em docker-compose.yml
3. Rotacionar credenciais se houver qualquer exposicao

Segredos que devem ser fortes e unicos:
- DB_PASSWORD
- NUVEMSHOP_CLIENT_SECRET
- JWT_SECRET
- ADMIN_SECRET

Gerador de segredo (Node.js):

node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

Depois de trocar secrets no .env:

docker compose down
docker compose up -d --build

---

