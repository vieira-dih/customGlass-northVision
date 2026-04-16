import "../styles/header.css"
import logo from "../assets/northvision-logo.webp"
import OAuthButton from "./OAuthButton"

function Header(){

  return(

    <header className="header">

      <img src={logo} className="logo"/>

      <nav>
        <a href="/">Home</a>
        <OAuthButton />
      </nav>

    </header>

  )

}

export default Header