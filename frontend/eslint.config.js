// ======================================================
// Arquivo: eslint.config.js
// ======================================================
// Configuração do ESLint para o projeto React + Vite.
// O ESLint analisa o código em busca de erros e más
// práticas antes mesmo de rodar no navegador.
// ======================================================

// Regras base do JavaScript recomendadas pelo ESLint
import js from '@eslint/js'

// Variáveis globais dos ambientes (ex: window, document, console)
import globals from 'globals'

// Plugin que enforça as regras dos React Hooks
// (ex: não chamar hooks dentro de ifs ou loops)
import reactHooks from 'eslint-plugin-react-hooks'

// Plugin que avisa quando um componente não pode ser
// atualizado em tempo real pelo Fast Refresh do Vite
import reactRefresh from 'eslint-plugin-react-refresh'

// Helpers do ESLint para definir configuração em flat config format
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([

  // Ignora a pasta dist/ (arquivos gerados pelo build — não precisam ser analisados)
  globalIgnores(['dist']),

  {
    // Aplica as regras a todos os arquivos .js e .jsx do projeto
    files: ['**/*.{js,jsx}'],

    // Conjuntos de regras que este projeto herda:
    extends: [
      js.configs.recommended,              // regras JS essenciais (ex: sem variáveis não declaradas)
      reactHooks.configs.flat.recommended, // regras dos React Hooks
      reactRefresh.configs.vite,           // compatibilidade com Fast Refresh do Vite
    ],

    languageOptions: {
      ecmaVersion: 2020,          // versão mínima do JavaScript suportada
      globals: globals.browser,   // reconhece variáveis globais do browser (window, fetch, etc.)
      parserOptions: {
        ecmaVersion: 'latest',    // permite sintaxe JS mais recente no parser
        ecmaFeatures: { jsx: true }, // habilita parsing de JSX (sintaxe dos componentes React)
        sourceType: 'module',     // trata os arquivos como ES Modules (import/export)
      },
    },

    rules: {
      // Variáveis não utilizadas geram erro, EXCETO as que começam com letra maiúscula
      // ou underscore (ex: constantes como PRODUTOS_PERMITIDOS são ignoradas)
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
    },
  },
])
