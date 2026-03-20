import { useParams } from "react-router-dom"                  // Pega o ID/Slug da URL para saber qual produto exibir
import { useState } from "react"                              // Gerencia o que muda na tela (estado)

import Header from "../../components/Header"                  // Import do componente de topo
import Footer from "../../components/Footer"                  // Import do componente de rodapé

import products from "../../data/products"                    // Onde ficam os dados (preço, nome, etc) dos produtos

// --- IMPORTAÇÃO DE IMAGENS ---
// Se adicionar uma lente nova, importe o arquivo .png aqui com um nome único
import lensPreta from "../../assets/glasses/radar-ev/curvo/lens-preta.png"
import lensAzulClaro from "../../assets/glasses/radar-ev/curvo/lens-azul-claro.png"
import lensAzulEscuro from "../../assets/glasses/radar-ev/curvo/lens-azul-escuro.png"
import lensAmarela from "../../assets/glasses/radar-ev/curvo/lens-amarela.png"
import lensPrata from "../../assets/glasses/radar-ev/curvo/lens-prata.png"
import lensRoxa from "../../assets/glasses/radar-ev/curvo/lens-roxa.png"
import lensVermelha from "../../assets/glasses/radar-ev/curvo/lens-vermelha.png"
import lensTransparente from "../../assets/glasses/radar-ev/curvo/lens-transparente.png"
import lensVerde from "../../assets/glasses/radar-ev/curvo/lens-verde.png"

import "./productPage.css"                                    // Arquivo de estilos (mude cores e tamanhos aqui)

function ProductPage() {

  const { slug } = useParams()                                // Captura o nome do produto na URL
  const produto = products.find(p => p.slug === slug)         // Procura no JSON o produto que bate com a URL

  // --- ESTADOS (O QUE O USUÁRIO ESCOLHE) ---
  const [tipoArmacao, setTipoArmacao] = useState("curvo")     // Define qual categoria de lentes mostrar primeiro
  const [corArmacao, setCorArmacao] = useState(null)          // Guarda a cor que o usuário clicou
  const [lentesSelecionadas, setLentesSelecionadas] = useState([]) // Array que guarda até 5 objetos de lentes
  const [preview, setPreview] = useState(lensPreta)           // Define qual imagem aparece no destaque principal

  // --- DICIONÁRIO DE CONFIGURAÇÃO ---
  // Para adicionar um novo tipo (ex: "quadrado"), crie uma nova chave abaixo de "reto"
  const config = {
    curvo: {
      cores: ["preto", "branco","laranja", "cinza", "bege", "transparente brilhante", "transparente fosco"],
      lentes: [
        { nome: "Preta", img: lensPreta },                    // Para mudar o nome exibido, mude o 'nome'
        { nome: "Azul Claro", img: lensAzulClaro },           // Para mudar a imagem, mude o 'img'
        { nome: "Azul Escuro", img: lensAzulEscuro },
        { nome: "Vermelha", img: lensVermelha },
        { nome: "Amarela", img: lensAmarela },
        { nome: "Prata", img: lensPrata },
        { nome: "Roxa", img: lensRoxa },
        { nome: "Transparente", img: lensTransparente },
        { nome: "Verde", img: lensVerde },
      ]
    },
    reto: {
      cores: ["preto", "cinza", "marrom", "verde"],
      lentes: [
        { nome: "Preta", img: lensPreta },
        { nome: "Azul Claro", img: lensAzulClaro },
      ]
    }
  }

  const opcoes = config[tipoArmacao]                          // Filtra as opções baseadas no tipo selecionado

  // --- LÓGICA DE SELEÇÃO DE LENTES ---
  const toggleLente = (lente) => {
    const existe = lentesSelecionadas.find(l => l.nome === lente.nome)

    if (existe) {
      // Se já clicou, remove da lista
      const novas = lentesSelecionadas.filter(l => l.nome !== lente.nome)
      setLentesSelecionadas(novas)

      // Se removeu, mostra a imagem da lente anterior ou a padrão
      if (novas.length > 0) {
        setPreview(novas[novas.length - 1].img)
      } else {
        setPreview(lensPreta)
      }

    } else {
      // Lógica de ADICIONAR lente (Mude o número 5 abaixo se quiser permitir mais ou menos lentes)
      if (lentesSelecionadas.length < 5) {
        const novas = [...lentesSelecionadas, lente]
        setLentesSelecionadas(novas)
        setPreview(lente.img)                                 // Faz a lente clicada "aparecer" no óculos
      } else {
        alert("Máximo de 5 lentes")                           // Mensagem de erro de limite
      }
    }
  }

  // Se o usuário digitar um link que não existe, mostra erro
  if (!produto) return <h1>Produto não encontrado</h1>

  return (
    <>
      <Header />

      <div className="custom-container">

        {/* --- ÁREA DA ESQUERDA (IMAGEM GRANDE) --- */}
        <div className="custom-left">
          <img className="custom-glasses" src={preview} alt="Óculos" />
        </div>

        {/* --- ÁREA DA DIREITA (OPÇÕES) --- */}
        <div className="custom-right">

          <h1>{produto.nome}</h1>

          {/* SEÇÃO: TIPOS (Botões Curvo/Reto) */}
          <div className="section">
            <h2>Tipo de armação</h2>
            <div className="tipo-armacao">
              <button
                className={tipoArmacao === "curvo" ? "ativo" : ""} // Classe 'ativo' para pintar o botão selecionado
                onClick={() => {
                  setTipoArmacao("curvo")
                  setCorArmacao(null)                         // Reseta a cor ao trocar o tipo
                  setLentesSelecionadas([])                   // Limpa o carrinho ao trocar o tipo
                  setPreview(lensPreta)
                }}
              > Curvo </button>

              <button
                className={tipoArmacao === "reto" ? "ativo" : ""}
                onClick={() => {
                  setTipoArmacao("reto")
                  setCorArmacao(null)
                  setLentesSelecionadas([])
                  setPreview(lensPreta)
                }}
              > Reto </button>
            </div>
          </div>

          {/* SEÇÃO: CORES (Mapeia as cores do config) */}
          <div className="section">
            <h2>Cor da armação</h2>
            <div className="cores">
              {opcoes.cores.map(cor => (
                <button
                  key={cor}
                  className={`
                    ${cor.toLowerCase().replace(/\s+/g, "-")} 
                    ${corArmacao === cor ? "ativo" : ""}
                  `}                                          // Cria classes como "preto", "transparente-fosco"
                  onClick={() => setCorArmacao(cor)}
                >
                  <span className="tooltip">{cor}</span>
                </button>
              ))}
            </div>
          </div>

          {/* SEÇÃO: LENTES (Miniaturas das lentes) */}
          <div className="section">
            <h2>Escolha até 5 lentes</h2>
            <div className="lens-options">
              {opcoes.lentes.map((l, index) => {
                const selecionada = lentesSelecionadas.find(item => item.nome === l.nome)
                return (
                  <button
                    key={index}
                    className={selecionada ? "ativo" : ""}    // Dá destaque visual se a lente for escolhida
                    onClick={() => toggleLente(l)}
                  >
                    <img src={l.img} alt={l.nome} />
                  </button>
                )
              })}
            </div>
          </div>

          {/* SEÇÃO: RESUMO (Mostra o que foi escolhido em texto) */}
          <div className="summary">
            <p><strong>Tipo:</strong> {tipoArmacao}</p>
            <p><strong>Armação:</strong> {corArmacao || "-"}</p>
            <p><strong>Lentes:</strong> {lentesSelecionadas.map(l => l.nome).join(", ") || "-"}</p>
          </div>

          {/* BOTÃO FINAL: Enviar para o carrinho */}
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