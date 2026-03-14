import "./home.css"                                            // importa css da página
import Header from "../../components/Header"                   // importa componente Header
import Footer from "../../components/Footer"                   // importa componente Footer
import products from "../../data/products"                     // importa lista de produtos
import ProductCard from "../../components/ProductCard"         // importa componente de card

function Home() {                                              // componente da página inicial

  return (
    <div>
      <Header />                                               {/* renderiza o header do site */}
      <section className="hero">                               {/* seção principal */}
        <h1>Personalize seu óculos</h1>                        {/* título principal */}
        <p>                                                    {/* descrição */}
          Escolha um modelo e monte seu óculos esportivo
          com cores de lente e armação exclusivas.
        </p>
      </section>
      <section className="catalogo" id="modelos">              {/* seção de catálogo */}
        <h2>Modelos disponíveis</h2>                            {/* título da seção */}
        <div className="produtos">                              {/* container dos produtos */}
          {products.map((produto) => (                          // percorre todos os produtos
            <ProductCard
              key={produto.id}                                  // chave única exigida pelo React
              nome={produto.nome}                               // envia nome do produto
              imagem={produto.imagem}                           // envia imagem do produto
              slug={produto.slug}                               // envia slug para rota dinâmica
            />
          ))}
        </div>
      </section>
      <Footer />                                               {/* renderiza o rodapé do site */}
    </div>
  )
}

export default Home                                           // exporta página