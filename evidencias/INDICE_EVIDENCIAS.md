# Índice de Evidências - Trilha A

Este arquivo referencia os prints enviados na pasta `evidencias/` e indica o que cada um comprova para análise do professor no repositório.

## Ordem sugerida de análise

1. Infraestrutura da stack
2. Banco aceitando conexões
3. Query simples no PostgreSQL
4. Health do frontend
5. Rota pública via proxy do frontend
6. Logs recentes da aplicação

## Prints e referências

| Print | Arquivo | O que comprova |
| --- | --- | --- |
| 1 | [docker ps.png](docker%20ps.png) | Os 3 containers estão ativos e saudáveis (`frontend`, `backend` e `db`). |
| 2 | [conexão-banco.png](conex%C3%A3o-banco.png) | O PostgreSQL está aceitando conexões com `pg_isready`. |
| 3 | [query.png](query.png) | A query `select 1;` executou com sucesso no banco. |
| 4 | [health-front.png](health-front.png) | O endpoint de health do frontend respondeu corretamente. |
| 5 | [rota-publica.png](rota-publica.png) | A rota pública foi acessada via proxy do frontend e retornou JSON válido. |
| 6 | [logs.png](logs.png) | Os logs mostram a stack em execução e a comunicação entre os serviços. |

## Como usar na entrega

Abra este índice e, ao lado, os prints correspondentes. A sequência acima está organizada para facilitar a verificação da entrega:

- primeiro valide o ambiente Docker funcionando;
- depois comprove o banco;
- em seguida valide o health do frontend;
- por fim confirme a rota pública e os logs.

## Observação

Para rastreabilidade, cada print acima está associado ao comando executado e ao resultado esperado descrito em [../docs/EVIDENCIAS_TRILHA_A.md](../docs/EVIDENCIAS_TRILHA_A.md).
