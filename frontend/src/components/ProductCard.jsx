import { Link } from "react-router-dom"                         // Link permite navegação sem recarregar página

function ProductCard({ nome, imagem, slug, nuvemshopId }) {     // recebe propriedades do produto

  const nomeEncoded = encodeURIComponent(nome || "")
  const linkTo = nuvemshopId
    ? `/produto/${slug}?pid=${nuvemshopId}&nome=${nomeEncoded}`
    : `/produto/${slug}?nome=${nomeEncoded}`

  return (

    <div className="produto">

      <img src={imagem} alt={nome} />                            {/* imagem do produto */}

      <h3>{nome}</h3>                                            {/* nome do produto */}

      <Link to={linkTo}>                                         {/* cria link para página dinâmica */}

        <button>Personalizar</button>                            {/* botão que leva para página do produto */}

      </Link>

    </div>

  )

}

export default ProductCard                                     // exporta componente