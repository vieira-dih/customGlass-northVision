import "../styles/header.css"
import logo from "../assets/northvision-logo.webp"
import OAuthButton from "./OAuthButton"

function Header() {

  return (

    <header className="header">

      <img src={logo} className="logo" alt="North Vision" />

      <nav>
        <a href="/">Home</a>
        <OAuthButton label="Área do lojista" />
      </nav>

    </header>

  )

}

export default Header