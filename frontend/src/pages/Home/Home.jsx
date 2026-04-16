import "./home.css"
import { useState, useEffect } from "react"
import Header from "../../components/Header"
import Footer from "../../components/Footer"
import { buscarProdutos } from "../../services/api"
import ProductCard from "../../components/ProductCard"
import banner from "../../assets/banner-north.png"

function Home() {
  const [produtos, setProdutos] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(null)

  useEffect(() => {
    const carregarProdutos = async () => {
      try {
        setCarregando(true)
        const dados = await buscarProdutos()
        
        // Transforma os dados da API para o formato esperado
        const produtosFormatados = dados.map((produto) => ({
          id: produto.id,
          nome: produto.name,
          imagem: produto.image?.src || produto.images?.[0]?.src || banner,
          slug: produto.slug || produto.name.toLowerCase().replace(/\s+/g, "-")
        }))
        
        setProdutos(produtosFormatados)
        setErro(null)
      } catch (erro) {
        console.error("Erro ao carregar produtos:", erro)
        setErro("Erro ao carregar produtos: " + erro.message)
        setProdutos([])
      } finally {
        setCarregando(false)
      }
    }

    carregarProdutos()
  }, [])

  return (
    <div>
      <Header />
      <section className="hero">
        <img src={banner} alt="Banner principal" />
      </section>
      <section className="catalogo" id="modelos">
        <h2>Modelos disponíveis</h2>
        {erro && <p style={{ color: "orange", padding: "10px" }}>{erro}</p>}
        {carregando ? (
          <p style={{ textAlign: "center", padding: "20px" }}>Carregando produtos...</p>
        ) : (
          <div className="produtos">
            {produtos.map((produto) => (
              <ProductCard
                key={produto.id}
                nome={produto.nome}
                imagem={produto.imagem}
                slug={produto.slug}
              />
            ))}
          </div>
        )}
      </section>
      <Footer />
    </div>
  )
}

export default Home