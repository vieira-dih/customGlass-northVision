import "../styles/header.css"
import logo from "../assets/northvision-logo.webp"

function Header(){

  return(

    <header className="header">

      <img src={logo} className="logo"/>

      <nav>
        <a href="/">Home</a>
      </nav>

    </header>

  )

}

export default Header