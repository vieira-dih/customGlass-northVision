import { useState } from "react"
import { useNavigate } from "react-router-dom"

function LojistaLogin() {
  const [modo, setModo] = useState("login") // "login" | "cadastro"
  const [form, setForm] = useState({ nome: "", email: "", senha: "", chave: "" })
  const [erro, setErro] = useState("")
  const [carregando, setCarregando] = useState(false)
  const navigate = useNavigate()

  const set = (campo) => (e) => setForm({ ...form, [campo]: e.target.value })

  const handleLogin = async (e) => {
    e.preventDefault()
    setErro("")
    setCarregando(true)
    try {
      const res = await fetch("http://localhost:3000/auth/lojista/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, senha: form.senha }),
      })
      const data = await res.json()
      if (!res.ok) { setErro(data.erro || "Erro ao fazer login"); return }
      localStorage.setItem("lojistaToken", data.token)
      localStorage.setItem("lojistaNome", data.nome)
      navigate("/lojista/admin")
    } catch {
      setErro("Não foi possível conectar ao servidor")
    } finally {
      setCarregando(false)
    }
  }

  const handleCadastro = async (e) => {
    e.preventDefault()
    setErro("")
    if (form.senha.length < 8) { setErro("A senha deve ter no mínimo 8 caracteres"); return }
    if (!form.chave.trim()) { setErro("Informe a chave de registro"); return }
    setCarregando(true)
    try {
      const res = await fetch("http://localhost:3000/auth/lojista/criar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: form.nome,
          email: form.email,
          senha: form.senha,
          adminSecret: form.chave,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setErro(data.erro || "Erro ao criar conta"); return }
      // Após cadastrar, faz login automaticamente
      const loginRes = await fetch("http://localhost:3000/auth/lojista/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, senha: form.senha }),
      })
      const loginData = await loginRes.json()
      localStorage.setItem("lojistaToken", loginData.token)
      localStorage.setItem("lojistaNome", loginData.nome)
      navigate("/lojista/admin")
    } catch {
      setErro("Não foi possível conectar ao servidor")
    } finally {
      setCarregando(false)
    }
  }

  const trocarModo = (novoModo) => {
    setErro("")
    setForm({ nome: "", email: "", senha: "", chave: "" })
    setModo(novoModo)
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.titulo}>Área do lojista</h2>

        {/* Abas */}
        <div style={styles.abas}>
          <button
            onClick={() => trocarModo("login")}
            style={{ ...styles.aba, ...(modo === "login" ? styles.abaAtiva : {}) }}
          >
            Entrar
          </button>
          <button
            onClick={() => trocarModo("cadastro")}
            style={{ ...styles.aba, ...(modo === "cadastro" ? styles.abaAtiva : {}) }}
          >
            Criar conta
          </button>
        </div>

        {modo === "login" ? (
          <form onSubmit={handleLogin} style={styles.form}>
            <Campo label="E-mail" type="email" value={form.email} onChange={set("email")} autoComplete="email" />
            <Campo label="Senha" type="password" value={form.senha} onChange={set("senha")} autoComplete="current-password" />
            {erro && <Erro texto={erro} />}
            <button type="submit" disabled={carregando} style={styles.botao}>
              {carregando ? "Entrando..." : "Entrar"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleCadastro} style={styles.form}>
            <Campo label="Nome" type="text" value={form.nome} onChange={set("nome")} autoComplete="name" />
            <Campo label="E-mail" type="email" value={form.email} onChange={set("email")} autoComplete="email" />
            <Campo label="Senha" type="password" value={form.senha} onChange={set("senha")} autoComplete="new-password" />
            <Campo
              label="Chave de registro"
              type="password"
              value={form.chave}
              onChange={set("chave")}
              hint="Definida no arquivo .env como ADMIN_SECRET"
            />
            {erro && <Erro texto={erro} />}
            <button type="submit" disabled={carregando} style={styles.botao}>
              {carregando ? "Criando conta..." : "Criar conta"}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

function Campo({ label, type, value, onChange, autoComplete, hint }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      <label style={{ fontSize: "13px", fontWeight: "600", color: "#444" }}>{label}</label>
      <input
        type={type}
        required
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        style={{
          padding: "10px 12px",
          border: "1px solid #ddd",
          borderRadius: "5px",
          fontSize: "14px",
          outline: "none",
        }}
      />
      {hint && <span style={{ fontSize: "11px", color: "#999" }}>{hint}</span>}
    </div>
  )
}

function Erro({ texto }) {
  return (
    <p style={{
      color: "#dc3545",
      fontSize: "13px",
      margin: "0",
      padding: "8px 12px",
      backgroundColor: "#fdf0f0",
      borderRadius: "4px",
      border: "1px solid #f5c6cb",
    }}>
      {texto}
    </p>
  )
}

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f5f5f5",
  },
  card: {
    backgroundColor: "white",
    padding: "40px",
    borderRadius: "8px",
    boxShadow: "0 2px 12px rgba(0,0,0,0.1)",
    width: "100%",
    maxWidth: "400px",
  },
  titulo: { margin: "0 0 24px 0", fontSize: "22px", fontWeight: "700", color: "#111" },
  abas: { display: "flex", marginBottom: "28px", borderBottom: "2px solid #eee" },
  aba: {
    flex: 1,
    padding: "10px",
    border: "none",
    background: "none",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
    color: "#888",
    borderBottom: "2px solid transparent",
    marginBottom: "-2px",
    transition: "color 0.2s",
  },
  abaAtiva: { color: "#111", borderBottomColor: "#111" },
  form: { display: "flex", flexDirection: "column", gap: "16px" },
  botao: {
    marginTop: "8px",
    padding: "12px",
    backgroundColor: "#111",
    color: "white",
    border: "none",
    borderRadius: "5px",
    fontSize: "15px",
    fontWeight: "600",
    cursor: "pointer",
  },
}

export default LojistaLogin
