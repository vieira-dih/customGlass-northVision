import { useParams } from "react-router-dom"                  // Pega o ID/Slug da URL para saber qual produto exibir
import { useState } from "react"                              // Gerencia o que muda na tela (estado)

import Header from "../../components/Header"                  // Import do componente de topo
import Footer from "../../components/Footer"                  // Import do componente de rodapé

import products from "../../data/products"                    // Onde ficam os dados (preço, nome, etc) dos produtos

// --- IMPORTAÇÃO DE IMAGENS ---
// Se adicionar uma lente nova, importe o arquivo .png aqui com um nome único
import lensAzul from "../../assets/glasses/radar-ev/curvo/lentes/lens-azul.png"
import lensPrata from "../../assets/glasses/radar-ev/curvo/lentes/lens-prata.png"
import lensRoxa from "../../assets/glasses/radar-ev/curvo/lentes/lens-roxa.png"
import lensVermelha from "../../assets/glasses/radar-ev/curvo/lentes/lens-vermelha.png"

// --- IMPORTAÇÃO DE ARMAÇÕES ---
import armacaoPreta from "../../assets/glasses/radar-ev/curvo/armaçoes/armação-preta.png"
import armacaoBranca from "../../assets/glasses/radar-ev/curvo/armaçoes/armação-branca.png"
import armacaoBege from "../../assets/glasses/radar-ev/curvo/armaçoes/armação-bege.png"
import armacaoCinza from "../../assets/glasses/radar-ev/curvo/armaçoes/armação-cinza.png"
import armacaoMarrom from "../../assets/glasses/radar-ev/curvo/armaçoes/armação-marrom.png"
import armacaoTranspBrilho from "../../assets/glasses/radar-ev/curvo/armaçoes/armação-transparente-brilhante.png"
import armacaoTranspFosco from "../../assets/glasses/radar-ev/curvo/armaçoes/armação-transparente-fosco.png"

import "./productPage.css"                                    // Arquivo de estilos (mude cores e tamanhos aqui)

function ProductPage() {

  const { slug } = useParams()                                // Captura o nome do produto na URL
  const produto = products.find(p => p.slug === slug)         // Procura no JSON o produto que bate com a URL

  // --- ESTADOS (O QUE O USUÁRIO ESCOLHE) ---
  const [tipoArmacao, setTipoArmacao] = useState("curvo")     // Define qual categoria de lentes mostrar primeiro
  const [armacaoSelecionada, setArmacaoSelecionada] = useState(armacaoPreta) // Armação escolhida
  const [armacaoHover, setArmacaoHover] = useState(null)      // Armação em hover (pré-visualização)
  const [lenteSelecionada, setLenteSelecionada] = useState(lensAzul) // Lente selecionada para o preview
  const [lenteHover, setLenteHover] = useState(null)          // Lente em hover (pré-visualização)
  const [lentesSelecionadas, setLentesSelecionadas] = useState([]) // Array que guarda até 5 objetos de lentes
  const [preview, setPreview] = useState(lensAzul)           // Define qual imagem aparece no destaque principal

  // --- DICIONÁRIO DE CONFIGURAÇÃO ---
  // Para adicionar um novo tipo (ex: "quadrado"), crie uma nova chave abaixo de "reto"
  const config = {
    curvo: {
      armacoes: [
        { nome: "Preta", img: armacaoPreta },
        { nome: "Branca", img: armacaoBranca },
        { nome: "Bege", img: armacaoBege },
        { nome: "Cinza", img: armacaoCinza },
        { nome: "Marrom", img: armacaoMarrom },
        { nome: "Transparente Brilhante", img: armacaoTranspBrilho },
        { nome: "Transparente Fosco", img: armacaoTranspFosco },
      ],
      lentes: [
        { nome: "Azul", img: lensAzul },                      // Para mudar o nome exibido, mude o 'nome'
        { nome: "Prata", img: lensPrata },                    // Para mudar a imagem, mude o 'img'
        { nome: "Roxa", img: lensRoxa },
        { nome: "Vermelha", img: lensVermelha },
      ]
    },
    reto: {
      armacoes: [
        { nome: "Preta", img: armacaoPreta },
        { nome: "Cinza", img: armacaoCinza },
      ],
      lentes: [
        { nome: "Azul", img: lensAzul },
        { nome: "Prata", img: lensPrata },
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
        setLenteSelecionada(novas[novas.length - 1].img)
      } else {
        setLenteSelecionada(lensAzul)
      }

    } else {
      // Lógica de ADICIONAR lente (Mude o número 5 abaixo se quiser permitir mais ou menos lentes)
      if (lentesSelecionadas.length < 5) {
        const novas = [...lentesSelecionadas, lente]
        setLentesSelecionadas(novas)
        setLenteSelecionada(lente.img)                        // Faz a lente clicada aparecer no preview
      } else {
        alert("Máximo de 5 lentes")                           // Mensagem de erro de limite
      }
    }
  }

  // --- LÓGICA DE MUDANÇA DE TIPO ---
  const mudarTipo = (novoTipo) => {
    setTipoArmacao(novoTipo)
    setArmacaoSelecionada(config[novoTipo].armacoes[0].img)
    setArmacaoHover(null)
    setLenteSelecionada(lensAzul)
    setLentesSelecionadas([])
    setPreview(lensAzul)
  }

  // Se o usuário digitar um link que não existe, mostra erro
  if (!produto) return <h1>Produto não encontrado</h1>

  return (
    <>
      <Header />

      <div className="custom-container">

        {/* --- ÁREA DA ESQUERDA (IMAGEM EM CAMADAS) --- */}
        <div className="custom-left">
          <div className="preview-container">
            {/* Armação (atrás) */}
            <img className="preview-layer frame" src={armacaoHover || armacaoSelecionada} alt="Armação" />
            {/* Lente (na frente) */}
            <img className="preview-layer lens" src={lenteHover || lenteSelecionada} alt="Lente" />
          </div>
        </div>

        {/* --- ÁREA DA DIREITA (OPÇÕES) --- */}
        <div className="custom-right">

          <h1>{produto.nome}</h1>

          {/* SEÇÃO: TIPOS (Botões Curvo/Reto) */}
          <div className="section">
            <h2>Tipo de lente</h2>
            <div className="tipo-armacao">
              <button
                className={tipoArmacao === "curvo" ? "ativo" : ""}
                onClick={() => mudarTipo("curvo")}
              > Curvo </button>

              <button
                className={tipoArmacao === "reto" ? "ativo" : ""}
                onClick={() => mudarTipo("reto")}
              > Reto </button>
            </div>
          </div>

          {/* SEÇÃO: ARMAÇÕES (Mapeia as armações do config) */}
          <div className="section">
            <h2>Escolha a armação</h2>
            <div className="armacoes-grid">
              {opcoes.armacoes.map((a, index) => (
                <button
                  key={index}
                  className={armacaoSelecionada === a.img ? "ativo" : ""}
                  onClick={() => setArmacaoSelecionada(a.img)}
                  onMouseEnter={() => setArmacaoHover(a.img)}
                  onMouseLeave={() => setArmacaoHover(null)}
                >
                  <img src={a.img} alt={a.nome} />
                  <span className="tooltip">{a.nome}</span>
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
                    onMouseEnter={() => setLenteHover(l.img)}
                    onMouseLeave={() => setLenteHover(null)}
                  >
                    <img src={l.img} alt={l.nome} />
                    <span className="tooltip">{l.nome}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* SEÇÃO: RESUMO (Mostra o que foi escolhido em texto) */}
          <div className="summary">
            <p><strong>Tipo:</strong> {tipoArmacao}</p>
            <p><strong>Armação:</strong> {opcoes.armacoes.find(a => a.img === armacaoSelecionada)?.nome || "-"}</p>
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