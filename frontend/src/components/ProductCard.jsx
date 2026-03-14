import { Link } from "react-router-dom"                         // Link permite navegação sem recarregar página

function ProductCard({ nome, imagem, slug }) {                  // recebe propriedades do produto

  return (

    <div className="produto">

      <img src={imagem} alt={nome} />                            {/* imagem do produto */}

      <h3>{nome}</h3>                                            {/* nome do produto */}

      <Link to={`/produto/${slug}`}>                             {/* cria link para página dinâmica */}

        <button>Personalizar</button>                            {/* botão que leva para página do produto */}

      </Link>

    </div>

  )

}

export default ProductCard                                     // exporta componente