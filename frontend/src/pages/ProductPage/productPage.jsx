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

  // 🔥 NOVOS ESTADOS
  const [tipoArmacao, setTipoArmacao] = useState("curvo")
  const [corArmacao, setCorArmacao] = useState(null)
  const [lente, setLente] = useState(lensPreta)

  // 🔥 CONFIGURAÇÃO POR TIPO
  const config = {
    curvo: {
      cores: ["preto", "branco", "azul", "vermelho", "verde", "transparente"],
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

  if (!produto) return <h1>Produto não encontrado</h1>

  return (
    <>
      <Header />

      <div className="custom-container">

        {/* 🔎 PREVIEW */}
        <div className="custom-left">
          <img
            className="custom-glasses"
            src={lente}
            alt="Óculos customizado"
          />

          <p>Tipo: {tipoArmacao}</p>
          <p>Armação: {corArmacao || "Selecione"}</p>
        </div>

        {/* ⚙️ CONFIGURAÇÃO */}
        <div className="custom-right">

          <h1>{produto.nome}</h1>

          {/* 🕶️ TIPO */}
          <h2>Tipo de armação</h2>

          <div className="tipo-armacao">
            <button
              className={tipoArmacao === "curvo" ? "ativo" : ""}
              onClick={() => {
                setTipoArmacao("curvo")
                setCorArmacao(null)
                setLente(null)
              }}
            >
              Curvo
            </button>

            <button
              className={tipoArmacao === "reto" ? "ativo" : ""}
              onClick={() => {
                setTipoArmacao("reto")
                setCorArmacao(null)
                setLente(null)
              }}
            >
              Reto
            </button>
          </div>

          {/* 🎨 COR */}
          <h2>Cor da armação</h2>

          <div className="cores">
            {opcoes.cores.map(cor => (
              <button
                key={cor}
                className={corArmacao === cor ? "ativo" : ""}
                onClick={() => setCorArmacao(cor)}
              >
                {cor}
              </button>
            ))}
          </div>

          {/* 👓 LENTES */}
          <h2>Lentes disponíveis</h2>

          <div className="lens-options">
            {opcoes.lentes.map((l, index) => (
              <button
                key={index}
                className={`lens-btn ${l.nome.toLowerCase()}`}
                onClick={() => setLente(l.img)}
              >
                {l.nome}
              </button>
            ))}
          </div>

        </div>

      </div>

      <Footer />
    </>
  )
}

export default ProductPage