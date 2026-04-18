import "../styles/header.css"
import logo from "../assets/northvision-logo.webp"
import OAuthButton from "./OAuthButton"

function Header(){
  const isConectado = localStorage.getItem('authToken') && localStorage.getItem('storeId')

  return(

    <header className="header">

      <img src={logo} className="logo"/>

      <nav>
        <a href="/">Home</a>
        {isConectado ? (
          <span style={{ color: '#4CAF50', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            ✅ Loja conectada
          </span>
        ) : (
          <OAuthButton />
        )}
      </nav>

    </header>

  )

}

export default Header