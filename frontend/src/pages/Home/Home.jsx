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
        
        // Transforma os dados da API para o formato esperado
        // Expande variantes (cores) de cada produto em cards individuais
        const produtosFormatados = (Array.isArray(dados) ? dados : [])
          .filter((produto) => {
            // Filtra apenas produtos do Kit Radar EV Curvo (por nome ou handle)
            const nome = (produto.name?.pt || produto.name || "").toLowerCase()
            const handle = (produto.handle?.pt || produto.handle || "").toLowerCase()
            return nome.includes("radar ev") || nome.includes("kit") || handle.includes("radar-ev")
          })
          .flatMap((produto) => {
            const nomeBase = produto.name?.pt || produto.name || "Sem nome"
            const imagemBase = produto.images?.[0]?.src || produto.image?.src || null
            const slugBase = produto.handle?.pt || produto.handle || nomeBase.toLowerCase().replace(/\s+/g, "-")

            // Se produto tem mais de uma variante, expande cada cor como card próprio
            if (produto.variants && produto.variants.length > 1) {
              return produto.variants.map((variante) => {
                const cor = variante.values?.join(" ") || ""                  // nome da cor da variante
                const nome = cor ? `${nomeBase} - ${cor}` : nomeBase          // ex: "Kit Radar EV Curvo - Cinza"
                const imagem = variante.image?.src || imagemBase               // imagem da variante ou do produto
                const slug = cor
                  ? `${slugBase}-${cor.toLowerCase().replace(/\s+/g, "-")}`   // slug único por cor
                  : slugBase
                return {
                  id: variante.id,                                             // ID único da variante
                  nuvemshopId: produto.id,                                     // ID do produto pai na Nuvemshop
                  varianteId: variante.id,                                     // ID da variante para checkout
                  nome,
                  imagem,
                  slug,
                }
              })
            }

            // Produto sem variantes múltiplas — card único
            return [{
              id: produto.id,
              nuvemshopId: produto.id,
              varianteId: produto.variants?.[0]?.id || null,
              nome: nomeBase,
              imagem: imagemBase,
              slug: slugBase,
            }]
          })
        
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