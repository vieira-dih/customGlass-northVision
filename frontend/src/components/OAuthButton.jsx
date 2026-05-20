// ======================================================
// Componente: OAuthButton.jsx
// ======================================================
// Botão para iniciar o fluxo OAuth com Nuvemshop
// Quando clicado, redireciona para /auth/nuvemshop
// ======================================================

function OAuthButton({ label = "Conectar loja" }) {

  const iniciarOAuth = () => {
    console.log('🔄 Iniciando OAuth...')
    console.log('📍 Redirecionando para: http://localhost:3000/auth/nuvemshop')
    
    // Redirecionar para a rota do backend que inicia o OAuth
    // O backend vai fazer o redirect para Nuvemshop
    window.location.href = "http://localhost:3000/auth/nuvemshop"
  }

  return (
    <button 
      onClick={iniciarOAuth}
      style={{
        backgroundColor: "#007bff",
        color: "white",
        padding: "10px 20px",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
        fontSize: "14px",
        fontWeight: "bold",
        transition: "background-color 0.3s",
      }}
      onMouseOver={(e) => e.target.style.backgroundColor = "#0056b3"}
      onMouseOut={(e) => e.target.style.backgroundColor = "#007bff"}
    >
      {label}
    </button>
  )
}

export default OAuthButton
