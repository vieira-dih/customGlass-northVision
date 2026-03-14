import oculos from "../assets/oculos-teste.webp"                // importa imagem de teste

const products = [

  {
    id: 1,                                                       // identificador único
    nome: "Radar EV",                                            // nome exibido no site
    slug: "radar-ev",                                            // usado na URL /produto/radar-ev
    imagem: oculos                                               // imagem do produto
  },

  {
    id: 2,
    nome: "Holbrook",
    slug: "holbrook",
    imagem: oculos
  },

  {
    id: 3,
    nome: "Jawbreaker",
    slug: "jawbreaker",
    imagem: oculos
  }

]

export default products                                         // exporta lista de produtos