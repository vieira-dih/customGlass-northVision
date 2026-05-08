import { useParams, useSearchParams } from "react-router-dom"
import { useState } from "react"

import Header from "../../components/Header"
import Footer from "../../components/Footer"
import { gerarCheckoutPersonalizado } from "../../services/api"

import products from "../../data/products"

// --- IMPORTAÇÃO DE IMAGENS ---
// Para adicionar uma lente nova: importe o arquivo .png aqui e adicione um item em LENTES_DISPONIVEIS
import lensPreta from "../../assets/glasses/radar-ev/curvo/lens-preta.png"
import lensAzulClaro from "../../assets/glasses/radar-ev/curvo/lens-azul-claro.png"
import lensAzulEscuro from "../../assets/glasses/radar-ev/curvo/lens-azul-escuro.png"
import lensAmarela from "../../assets/glasses/radar-ev/curvo/lens-amarela.png"
import lensPrata from "../../assets/glasses/radar-ev/curvo/lens-prata.png"
import lensRoxa from "../../assets/glasses/radar-ev/curvo/lens-roxa.png"
import lensVermelha from "../../assets/glasses/radar-ev/curvo/lens-vermelha.png"
import lensTransparente from "../../assets/glasses/radar-ev/curvo/lens-transparente.png"
import lensVerde from "../../assets/glasses/radar-ev/curvo/lens-verde.png"

import "./productPage.css"

// --- LISTA DE LENTES DISPONÍVEIS ---
// Para adicionar uma nova lente, inclua um objeto { nome, img } aqui
const LENTES_DISPONIVEIS = [
  { nome: "Preta",        img: lensPreta        },
  { nome: "Azul Claro",   img: lensAzulClaro    },
  { nome: "Azul Escuro",  img: lensAzulEscuro   },
  { nome: "Vermelha",     img: lensVermelha     },
  { nome: "Amarela",      img: lensAmarela      },
  { nome: "Prata",        img: lensPrata        },
  { nome: "Roxa",         img: lensRoxa         },
  { nome: "Transparente", img: lensTransparente },
  { nome: "Verde",        img: lensVerde        },
]

const MAX_LENTES = 5

function ProductPage() {

  const { slug } = useParams()
  const [searchParams] = useSearchParams()
  const nuvemshopProductId = searchParams.get("pid")
  const produto = products.find(p => p.slug === slug)

  const produtoNome = produto?.nome || searchParams.get("nome") || slug.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase())

  // --- ESTADOS ---
  const [lentesSelecionadas, setLentesSelecionadas] = useState([])
  const [preview, setPreview] = useState(lensPreta)
  const [finalizandoCompra, setFinalizandoCompra] = useState(false)
  const [modalAberto, setModalAberto] = useState(false)
  const [contato, setContato] = useState({ nome: "", sobrenome: "", email: "" })
  const [erroContato, setErroContato] = useState("")

  // --- LÓGICA DE SELEÇÃO DE LENTES ---
  const toggleLente = (lente) => {
    const jaEstaLista = lentesSelecionadas.find(l => l.nome === lente.nome)

    if (jaEstaLista) {
      const novas = lentesSelecionadas.filter(l => l.nome !== lente.nome)
      setLentesSelecionadas(novas)
      setPreview(novas.length > 0 ? novas[novas.length - 1].img : lensPreta)
    } else {
      if (lentesSelecionadas.length >= MAX_LENTES) {
        alert(`Máximo de ${MAX_LENTES} lentes por pedido`)
        return
      }
      const novas = [...lentesSelecionadas, lente]
      setLentesSelecionadas(novas)
      setPreview(lente.img)
    }
  }

  if (!produto && !nuvemshopProductId) return <h1>Produto não encontrado</h1>

  const handleComprarPersonalizado = () => {
    if (lentesSelecionadas.length < MAX_LENTES) {
      alert(`Selecione exatamente ${MAX_LENTES} lentes para continuar (${lentesSelecionadas.length}/${MAX_LENTES} selecionadas)`)
      return
    }
    setModalAberto(true)
  }

  const handleConfirmarContato = async () => {
    const { nome, sobrenome, email } = contato
    if (!nome.trim() || !sobrenome.trim() || !email.trim()) {
      setErroContato("Por favor, preencha todos os campos.")
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setErroContato("Digite um e-mail válido.")
      return
    }
    setErroContato("")
    setModalAberto(false)

    try {
      setFinalizandoCompra(true)

      const customizacao = {
        lentes: lentesSelecionadas.map((lente) => lente.nome),
      }

      const response = await gerarCheckoutPersonalizado({
        productSlug: produto?.slug || slug,
        nuvemshopProductId,
        customizacao,
        contato: { nome: nome.trim(), sobrenome: sobrenome.trim(), email: email.trim() },
      })

      if (!response?.checkoutUrl) {
        throw new Error("Não foi possível gerar o link para finalizar na loja")
      }

      window.location.href = response.checkoutUrl
    } catch (error) {
      console.error("Erro ao finalizar compra personalizada:", error)
      alert(error.message || "Erro ao redirecionar para checkout da loja")
    } finally {
      setFinalizandoCompra(false)
    }
  }

  return (
    <div className="page-wrapper">
      <Header />

      <div className="custom-container">

        {/* ÁREA DA ESQUERDA: imagem da lente em destaque */}
        <div className="custom-left">
          <img className="custom-glasses" src={preview} alt="Óculos" />
        </div>

        {/* ÁREA DA DIREITA: seleção de lentes */}
        <div className="custom-right">

          <h1>{produtoNome}</h1>

          {/* SEÇÃO: LENTES */}
          <div className="section">
            <h2>Escolha exatamente {MAX_LENTES} lentes</h2>
            <div className="lens-options">
              {LENTES_DISPONIVEIS.map((lente, index) => {
                const selecionada = lentesSelecionadas.find(l => l.nome === lente.nome)
                return (
                  <button
                    key={index}
                    className={selecionada ? "ativo" : ""}
                    onClick={() => toggleLente(lente)}
                    title={lente.nome}
                  >
                    <img src={lente.img} alt={lente.nome} />
                  </button>
                )
              })}
            </div>
          </div>

          {/* RESUMO */}
          <div className="summary">
            <p>
              <strong>Lentes escolhidas ({lentesSelecionadas.length}/{MAX_LENTES}):</strong>{" "}
              {lentesSelecionadas.map(l => l.nome).join(", ") || "-"}
            </p>
          </div>

          <button
            className="buy-button"
            onClick={handleComprarPersonalizado}
            disabled={finalizandoCompra || lentesSelecionadas.length < MAX_LENTES}
          >
            {finalizandoCompra ? "Redirecionando..." : "Finalizar na loja"}
          </button>

        </div>
      </div>

      {/* MODAL: DADOS DE CONTATO */}
      {modalAberto && (
        <div className="modal-overlay" onClick={() => setModalAberto(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h2>Quase lá! 🎉</h2>
            <p>Informe seus dados para continuar para o checkout.</p>

            <div className="modal-campo">
              <label>Nome</label>
              <input
                type="text"
                placeholder="Seu nome"
                value={contato.nome}
                onChange={(e) => setContato(c => ({ ...c, nome: e.target.value }))}
              />
            </div>

            <div className="modal-campo">
              <label>Sobrenome</label>
              <input
                type="text"
                placeholder="Seu sobrenome"
                value={contato.sobrenome}
                onChange={(e) => setContato(c => ({ ...c, sobrenome: e.target.value }))}
              />
            </div>

            <div className="modal-campo">
              <label>E-mail</label>
              <input
                type="email"
                placeholder="seu@email.com"
                value={contato.email}
                onChange={(e) => setContato(c => ({ ...c, email: e.target.value }))}
              />
            </div>

            {erroContato && <p className="modal-erro">{erroContato}</p>}

            <div className="modal-acoes">
              <button className="modal-btn-cancelar" onClick={() => setModalAberto(false)}>
                Cancelar
              </button>
              <button
                className="modal-btn-confirmar"
                onClick={handleConfirmarContato}
                disabled={finalizandoCompra}
              >
                {finalizandoCompra ? "Aguarde..." : "Ir para checkout"}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}

export default ProductPage
