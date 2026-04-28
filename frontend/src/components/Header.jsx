// ======================================================
// Arquivo: components/Header.jsx
// ======================================================
// Cabecalho principal da aplicacao.
// Mostra navegacao basica e acesso da area do lojista.
// ======================================================

import "../styles/header.css"
import logo from "../assets/northvision-logo.webp"
import OAuthButton from "./OAuthButton"

function Header() {

  return (

    <header className="header">

      <img src={logo} className="logo" alt="North Vision" />

      <nav>
        <a href="/">Home</a>
        {/* Botao destinado ao dono da loja para integrar via OAuth */}
        <OAuthButton label="Área do lojista" />
      </nav>

    </header>

  )

}

export default Header