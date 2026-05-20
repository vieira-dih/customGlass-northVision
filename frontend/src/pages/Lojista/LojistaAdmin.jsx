import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import OAuthButton from "../../components/OAuthButton"

function LojistaAdmin() {
  const navigate = useNavigate()
  const [nome, setNome] = useState("")
  const [storeId, setStoreId] = useState(null)
  const [lojaConectada, setLojaConectada] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem("lojistaToken")
    if (!token) {
      navigate("/lojista/login")
      return
    }

    // Verificar se token ainda é válido
    fetch("http://localhost:3000/auth/verify", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => {
        if (!r.ok) throw new Error("Token inválido")
        return r.json()
      })
      .catch(() => {
        localStorage.removeItem("lojistaToken")
        localStorage.removeItem("lojistaNome")
        navigate("/lojista/login")
      })

    setNome(localStorage.getItem("lojistaNome") || "Lojista")

    const sid = localStorage.getItem("storeId")
    setStoreId(sid)
    setLojaConectada(!!sid && !!localStorage.getItem("authToken"))
  }, [navigate])

  const sair = () => {
    localStorage.removeItem("lojistaToken")
    localStorage.removeItem("lojistaNome")
    navigate("/lojista/login")
  }

  const desconectarLoja = () => {
    localStorage.removeItem("authToken")
    localStorage.removeItem("storeId")
    setStoreId(null)
    setLojaConectada(false)
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div>
            <h2 style={styles.titulo}>Painel do Lojista</h2>
            <p style={styles.subtitulo}>Bem-vindo, {nome}</p>
          </div>
          <button onClick={sair} style={styles.botaoSair}>Sair</button>
        </div>

        <hr style={{ border: "none", borderTop: "1px solid #eee", margin: "24px 0" }} />

        <h3 style={styles.secaoTitulo}>Integração Nuvemshop</h3>

        {lojaConectada ? (
          <div style={styles.statusConectado}>
            <p style={{ color: "#28a745", fontWeight: "600", marginBottom: 4 }}>
              ✅ Loja conectada
            </p>
            <p style={{ color: "#555", fontSize: 13, marginBottom: 20 }}>
              Store ID: <strong>{storeId}</strong>
            </p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <button onClick={desconectarLoja} style={styles.botaoPerigo}>
                Desconectar loja
              </button>
              <OAuthButton label="Reconectar loja" />
            </div>
          </div>
        ) : (
          <div>
            <p style={{ color: "#555", fontSize: 14, marginBottom: 20 }}>
              Nenhuma loja conectada. Clique abaixo para autenticar com sua conta Nuvemshop e permitir que o site acesse os produtos da loja.
            </p>
            <OAuthButton label="Conectar loja Nuvemshop" />
          </div>
        )}
      </div>
    </div>
  )
}

const styles = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#f5f5f5",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px",
  },
  card: {
    backgroundColor: "white",
    borderRadius: "8px",
    boxShadow: "0 2px 12px rgba(0,0,0,0.1)",
    padding: "40px",
    width: "100%",
    maxWidth: "520px",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  titulo: { margin: "0 0 4px 0", fontSize: "22px", fontWeight: "700", color: "#111" },
  subtitulo: { margin: 0, fontSize: "13px", color: "#888" },
  secaoTitulo: { fontSize: "16px", fontWeight: "600", color: "#333", marginBottom: "16px" },
  statusConectado: {},
  botaoSair: {
    padding: "8px 16px",
    backgroundColor: "transparent",
    color: "#666",
    border: "1px solid #ddd",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "13px",
  },
  botaoPerigo: {
    padding: "10px 20px",
    backgroundColor: "#dc3545",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "14px",
  },
}

export default LojistaAdmin
