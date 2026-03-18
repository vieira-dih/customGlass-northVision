import "./home.css"                                            // importa css da página
import Header from "../../components/Header"                   // importa componente Header
import Footer from "../../components/Footer"                   // importa componente Footer
import products from "../../data/products"                     // importa lista de produtos
import ProductCard from "../../components/ProductCard"         // importa componente de card
import banner from "../../assets/banner-north.png"                      // importa imagem de banner
function Home() {                                              // componente da página inicial

  return (
    <div>
      <Header />                                               {/* renderiza o header do site */}
      <section className="hero">                               {/* seção principal */}
        <img src={banner} alt="Banner principal" />
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