import "./home.css"
import { useState, useEffect } from "react"
import Header from "../../components/Header"
import Footer from "../../components/Footer"
import { buscarProdutosPublicos } from "../../services/api"
import ProductCard from "../../components/ProductCard"

function Home() {
  const [produtos, setProdutos] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(null)

  useEffect(() => {
    const carregarProdutos = async () => {
      try {
        setCarregando(true)
        const dados = await buscarProdutosPublicos()

                // Nomes exatos dos 7 produtos que devem aparecer no catálogo
        const PRODUTOS_PERMITIDOS = [
          "kit radar ev 5 lentes brilho curvo",
          "kit radar ev 5 lentes transparente brilho curvo",
          "radar ev bege kit 5 lentes brilho curvo",
          "kit radar ev 5 lentes - branca brilho curvo",
          "kit radar ev 5 lentes - cinza brilho curvo",
          "kit 5 lentes - radar ev marrom - brilho curvo",
          "kit 5 lentes - radar ev transparente fosco - brilho curvo -",
        ]

        // Transforma os dados da API para o formato esperado
        const produtosFormatados = (Array.isArray(dados) ? dados : [])
          .filter((produto) => {
            // Mantém apenas os produtos da lista (sem diferenciar maiúsculas/minúsculas)
            const nome = (produto.name?.pt || produto.name || "").toLowerCase().trim()
            return PRODUTOS_PERMITIDOS.includes(nome)
          })
          .map((produto) => ({
            id: produto.id,
            nuvemshopId: produto.id,
            nome: produto.name?.pt || produto.name || "Sem nome",
            imagem: produto.images?.[0]?.src || produto.image?.src || null,
            slug: produto.handle?.pt || produto.handle || (produto.name?.pt || "").toLowerCase().replace(/\s+/g, "-"),
          }))
        
        setProdutos(produtosFormatados)
        setErro(null)
      } catch (erro) {
        console.error("Erro ao carregar produtos:", erro)
        setErro(erro.message)
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
        <video
          src="/banner.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="hero-video"
        />
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
                nuvemshopId={produto.nuvemshopId}
                varianteId={produto.varianteId}
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