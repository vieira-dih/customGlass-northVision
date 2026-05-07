// ======================================================
// Script: criar-lojista.js
// ======================================================
// Cria o usuário lojista no banco de dados.
// Os dados são pedidos interativamente — nada fica
// gravado no código.
//
// Uso:
//   node criar-lojista.js
// ======================================================

import bcrypt from "bcryptjs"
import pkg from "pg"
import dotenv from "dotenv"
import readline from "readline"
import { fileURLToPath } from "url"
import { dirname, join } from "path"

const __dirname = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: join(__dirname, "../.env") })

const { Pool } = pkg

const rl = readline.createInterface({ input: process.stdin, output: process.stdout })

const perguntar = (pergunta) =>
  new Promise((resolve) => rl.question(pergunta, resolve))

const perguntarSenha = (pergunta) =>
  new Promise((resolve) => {
    process.stdout.write(pergunta)
    // Oculta a digitação da senha no terminal
    process.stdin.setRawMode?.(true)
    let senha = ""
    process.stdin.resume()
    process.stdin.setEncoding("utf8")
    const onData = (ch) => {
      if (ch === "\n" || ch === "\r" || ch === "\u0003") {
        process.stdin.setRawMode?.(false)
        process.stdin.removeListener("data", onData)
        process.stdout.write("\n")
        resolve(senha)
      } else if (ch === "\u007f") {
        senha = senha.slice(0, -1)
      } else {
        senha += ch
        process.stdout.write("*")
      }
    }
    process.stdin.on("data", onData)
  })

async function criar() {
  console.log("\n=== Criar lojista - Custom Glass North Vision ===\n")

  const nome  = (await perguntar("Nome completo: ")).trim()
  const email = (await perguntar("E-mail: ")).trim().toLowerCase()
  const senha = await perguntarSenha("Senha (mín. 8 caracteres): ")

  rl.close()

  if (!nome || !email || !senha) {
    console.error("\n❌ Todos os campos são obrigatórios")
    process.exit(1)
  }

  if (senha.length < 8) {
    console.error("❌ A senha deve ter no mínimo 8 caracteres")
    process.exit(1)
  }

  const pool = new Pool({
    host:     process.env.DB_HOST,
    port:     process.env.DB_PORT,
    database: process.env.DB_NAME,
    user:     process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  })

  try {
    const hash = await bcrypt.hash(senha, 12)

    const result = await pool.query(
      `INSERT INTO users (nome, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, nome, email`,
      [nome, email, hash]
    )

    console.log("\n✅ Lojista criado com sucesso!")
    console.log("   ID:    ", result.rows[0].id)
    console.log("   Nome:  ", result.rows[0].nome)
    console.log("   Email: ", result.rows[0].email)
    console.log("\nAcesse: http://localhost:5173/lojista/login\n")
  } catch (err) {
    if (err.code === "23505") {
      console.error("\n❌ Este email já está cadastrado no banco")
    } else {
      console.error("\n❌ Erro:", err.message)
    }
    process.exit(1)
  } finally {
    await pool.end()
  }
}

criar()

