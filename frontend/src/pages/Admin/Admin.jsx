import OAuthButton from "../../components/OAuthButton"

function Admin() {
  const token = localStorage.getItem("authToken")
  const storeId = localStorage.getItem("storeId")

  const desconectar = () => {
    localStorage.removeItem("authToken")
    localStorage.removeItem("storeId")
    window.location.reload()
  }

  return (
    <div style={{ maxWidth: 480, margin: "80px auto", padding: "40px", fontFamily: "sans-serif", border: "1px solid #ddd", borderRadius: 8 }}>
      <h2 style={{ marginBottom: 24 }}>Área do lojista</h2>

      {token && storeId ? (
        <div>
          <p style={{ color: "#28a745", marginBottom: 8 }}>✅ Loja conectada</p>
          <p style={{ color: "#555", fontSize: 14, marginBottom: 24 }}>Store ID: <strong>{storeId}</strong></p>
          <p style={{ fontSize: 14, color: "#555", marginBottom: 24 }}>
            Para reconectar com outra loja, desconecte primeiro e refaça o processo OAuth.
          </p>
          <button
            onClick={desconectar}
            style={{ backgroundColor: "#dc3545", color: "white", padding: "10px 20px", border: "none", borderRadius: 5, cursor: "pointer", fontSize: 14, marginRight: 12 }}
          >
            Desconectar loja
          </button>
          <OAuthButton label="Reconectar loja" />
        </div>
      ) : (
        <div>
          <p style={{ color: "#555", marginBottom: 24, fontSize: 14 }}>
            Nenhuma loja conectada. Clique abaixo para autenticar com sua conta Nuvemshop.
          </p>
          <OAuthButton label="Conectar loja Nuvemshop" />
        </div>
      )}
    </div>
  )
}

export default Admin
