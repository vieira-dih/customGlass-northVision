import { useParams } from "react-router-dom"           // hook para pegar parâmetros da URL
import { useState } from "react"                       // hook para criar estado no componente

import Header from "../../components/Header"           // importa componente Header
import Footer from "../../components/Footer"           // importa componente Footer

import products from "../../data/products"             // importa lista de produtos

import lensPreta from "../../assets/glasses/radar-ev/lens-preta.png"     // importa imagem da lente preta
import lensAzul from "../../assets/glasses/radar-ev/lens-azul.png"       // importa imagem da lente azul
import lensDourada from "../../assets/glasses/radar-ev/lens-dourada.png" // importa imagem da lente dourada

import "./productPage.css"                             // importa css da página

function ProductPage() {                               // componente da página de customização

  const { slug } = useParams()                         // pega o slug da URL (ex: /product/radar-ev)

  const produto = products.find(p => p.slug === slug)  // procura o produto correspondente no array

  const [lente, setLente] = useState(lensPreta)        // cria estado da lente e define preta como padrão

  if (!produto) return <h1>Produto não encontrado</h1> // caso o slug não exista no array

  return (
    <>
      <Header />                                       {/* renderiza header do site */}

      <div className="custom-container">               {/* container principal da página */}

        <div className="custom-left">                  {/* lado esquerdo (preview do óculos) */}

          <img
            className="custom-glasses"                 // classe para estilização da imagem
            src={lente}                                // imagem muda conforme lente selecionada
            alt="Óculos customizado"                   // texto alternativo da imagem
          />

        </div>

        <div className="custom-right">                 {/* lado direito (configuração) */}

          <h1>{produto.nome}</h1>                      {/* mostra nome do produto */}

          <p>Escolha a cor da lente</p>                {/* instrução para o usuário */}

          <div className="lens-options">               {/* container dos botões de lentes */}

            <button 
            className="lens-btn preta"
            onClick={() => setLente(lensPreta)}>  {/* altera lente para preta */}
              Preta
            </button>

            <button
            className="lens-btn azul"
            onClick={() => setLente(lensAzul)}>   {/* altera lente para azul */}
              Azul
            </button>

            <button 
            className="lens-btn dourada"
            onClick={() => setLente(lensDourada)}> {/* altera lente para dourada */}
              Dourada
            </button>

          </div>

        </div>

      </div>

      <Footer />                                      {/* renderiza rodapé */}

    </>
  )
}

export default ProductPage                             // exporta componente da página