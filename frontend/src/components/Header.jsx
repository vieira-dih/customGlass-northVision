// ======================================================
// Arquivo: components/Header.jsx
// ======================================================
// Cabecalho principal da aplicacao.
// Mostra navegacao basica e acesso da area do lojista.
// ======================================================

import "../styles/header.css"
import logo from "../assets/northvision-logo.webp"

function Header() {

  return (

    <header className="header">

      <img src={logo} className="logo" alt="North Vision" />

      <nav>
        <a href="/">Home</a>
      </nav>

    </header>

  )

}

export default Header