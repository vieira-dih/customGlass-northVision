import { useParams } from "react-router-dom"
import { useState } from "react"

import Header from "../../components/Header"
import Footer from "../../components/Footer"

import products from "../../data/products"

import lensPreta from "../../assets/glasses/radar-ev/lens-preta.png"
import lensAzul from "../../assets/glasses/radar-ev/lens-azul.png"
import lensDourada from "../../assets/glasses/radar-ev/lens-dourada.png"

import "./productPage.css"

function ProductPage() {

  const { slug } = useParams()
  const produto = products.find(p => p.slug === slug)

  const [tipoArmacao, setTipoArmacao] = useState("curvo")
  const [corArmacao, setCorArmacao] = useState(null)
  const [lentesSelecionadas, setLentesSelecionadas] = useState([])

  const config = {
    curvo: {
      cores: ["preto", "branco","laranja", "cinza", "bege",  "transparente brilhante", "transparente fosco"],
      lentes: [
        { nome: "Preta", img: lensPreta },
        { nome: "Azul", img: lensAzul },
        { nome: "Dourada", img: lensDourada },
      ]
    },
    reto: {
      cores: ["preto", "cinza", "marrom", "verde"],
      lentes: [
        { nome: "Preta", img: lensPreta },
        { nome: "Azul", img: lensAzul },
      ]
    }
  }

  const opcoes = config[tipoArmacao]

  const toggleLente = (lente) => {
    const existe = lentesSelecionadas.find(l => l.nome === lente.nome)

    if (existe) {
      setLentesSelecionadas(lentesSelecionadas.filter(l => l.nome !== lente.nome))
    } else {
      if (lentesSelecionadas.length < 5) {
        setLentesSelecionadas([...lentesSelecionadas, lente])
      } else {
        alert("Máximo de 5 lentes")
      }
    }
  }

  const preview = lentesSelecionadas[0]?.img || lensPreta

  if (!produto) return <h1>Produto não encontrado</h1>

  return (
    <>
      <Header />

      <div className="custom-container">

        {/* 🔎 PREVIEW */}
        <div className="custom-left">
          <img className="custom-glasses" src={preview} alt="Óculos" />
        </div>

        {/* ⚙️ CONFIG */}
        <div className="custom-right">

          <h1>{produto.nome}</h1>

          {/* 🕶️ TIPO */}
          <div className="section">
            <h2>Tipo de armação</h2>
            <div className="tipo-armacao">
              <button
                className={tipoArmacao === "curvo" ? "ativo" : ""}
                onClick={() => {
                  setTipoArmacao("curvo")
                  setCorArmacao(null)
                  setLentesSelecionadas([])
                }}
              >
                Curvo
              </button>

              <button
                className={tipoArmacao === "reto" ? "ativo" : ""}
                onClick={() => {
                  setTipoArmacao("reto")
                  setCorArmacao(null)
                  setLentesSelecionadas([])
                }}
              >
                Reto
              </button>
            </div>
          </div>

          {/* 🎨 CORES */}
          <div className="section">
            <h2>Cor da armação</h2>

            <div className="cores">
              {opcoes.cores.map(cor => (
                <button
                  key={cor}

                  className={`
                    ${cor.toLowerCase().replace(/\s+/g, "-")}
                    ${corArmacao === cor ? "ativo" : ""}
                  `}

                  onClick={() => setCorArmacao(cor)}
                >
                  <span className="tooltip">{cor}</span> {/* 🔥 nome da cor */}
                </button>
              ))}
            </div>
          </div>

          {/* 👓 LENTES */}
          <div className="section">
            <h2>Escolha até 5 lentes</h2>

            <div className="lens-options">
              {opcoes.lentes.map((l, index) => {

                const selecionada = lentesSelecionadas.find(item => item.nome === l.nome)

                return (
                  <button
                    key={index}
                    className={selecionada ? "ativo" : ""}
                    onClick={() => toggleLente(l)}
                  >
                    <img src={l.img} alt={l.nome} />
                  </button>
                )
              })}
            </div>
          </div>

          {/* 📦 RESUMO */}
          <div className="summary">
            <p><strong>Tipo:</strong> {tipoArmacao}</p>
            <p><strong>Armação:</strong> {corArmacao || "-"}</p>
            <p><strong>Lentes:</strong> {lentesSelecionadas.map(l => l.nome).join(", ") || "-"}</p>
          </div>

          {/* 🛒 BOTÃO */}
          <button className="buy-button">
            Comprar personalizado
          </button>

        </div>
      </div>

      <Footer />
    </>
  )
}

export default ProductPage