// ======================================================
// Arquivo: components/Footer.jsx
// ======================================================
// Rodape simples exibido nas paginas principais.
// ======================================================

import "../styles/footer.css"
import { Link } from "react-router-dom"

function Footer(){

  return(

    <footer className="footer">

      <p>© North Vision</p>

      <Link
        to="/lojista/login"
        style={{ color: "#555", fontSize: "11px", textDecoration: "none", marginTop: "6px", display: "inline-block" }}
      >
        Área do lojista
      </Link>

    </footer>

  )

}

export default Footer